import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { isWebp, MAX_PAYMENT_QR_BYTES, paymentMediaUrl, resolvePaymentMediaPath } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let savedPath = "";
  try {
    enforceSameOrigin(request);
    enforceRateLimit(request, "payment-qr-upload", 8, 60_000);
    const session = await requireApiStaff(request, ["ADMIN", "SUPER_ADMIN"]);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) throw new HttpError(400, "請選擇 QR Code 圖片。");
    if (file.type !== "image/webp") throw new HttpError(400, "QR Code 必須先壓縮為 WebP 格式。");
    if (file.size > MAX_PAYMENT_QR_BYTES) throw new HttpError(400, "QR Code 圖片不可超過 900 KB。");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!isWebp(bytes)) throw new HttpError(400, "圖片內容不是有效的 WebP 檔案。");
    const filename = `${Date.now()}-${randomUUID()}.webp`;
    savedPath = resolvePaymentMediaPath(filename);
    await mkdir(path.dirname(savedPath), { recursive: true });
    await writeFile(savedPath, bytes, { flag: "wx" });
    const old = await db.paymentMethodSetting.findUnique({ where: { code: "FPS" }, select: { qrCodeUrl: true } });
    await db.paymentMethodSetting.update({ where: { code: "FPS" }, data: { qrCodeUrl: paymentMediaUrl(filename), updatedBy: session.user.id } });
    savedPath = "";
    if (old?.qrCodeUrl?.startsWith("/api/media/payment/")) {
      const oldFilename = old.qrCodeUrl.split("/").pop();
      if (oldFilename) await unlink(resolvePaymentMediaPath(oldFilename)).catch(() => undefined);
    }
    await writeAudit({ actorId: session.user.id, action: "UPDATE_PAYMENT_QR", entityType: "PaymentMethodSetting", entityId: "FPS", oldValue: old, newValue: { qrCodeUrl: paymentMediaUrl(filename), size: bytes.byteLength }, reason: "後台更新收款 QR Code", ipAddress: requestIp(request) });
    return NextResponse.json({ qrCodeUrl: paymentMediaUrl(filename) }, { status: 201 });
  } catch (error) {
    if (savedPath) await unlink(savedPath).catch(() => undefined);
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["ADMIN", "SUPER_ADMIN"]);
    const current = await db.paymentMethodSetting.findUnique({ where: { code: "FPS" }, select: { qrCodeUrl: true } });
    await db.paymentMethodSetting.update({ where: { code: "FPS" }, data: { qrCodeUrl: null, updatedBy: session.user.id } });
    if (current?.qrCodeUrl?.startsWith("/api/media/payment/")) {
      const filename = current.qrCodeUrl.split("/").pop();
      if (filename) await unlink(resolvePaymentMediaPath(filename)).catch(() => undefined);
    }
    await writeAudit({ actorId: session.user.id, action: "REMOVE_PAYMENT_QR", entityType: "PaymentMethodSetting", entityId: "FPS", oldValue: current, newValue: { qrCodeUrl: null }, reason: "後台移除收款 QR Code", ipAddress: requestIp(request) });
    return NextResponse.json({ qrCodeUrl: null });
  } catch (error) { return apiError(error); }
}
