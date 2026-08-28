import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { filenameFromProductMediaUrl, getMediaRoot, isWebp, MAX_PRODUCT_IMAGE_BYTES, MAX_PRODUCT_IMAGES, productMediaUrl, resolveProductMediaPath } from "@/lib/media-storage";

export const runtime = "nodejs";

const roles = ["MERCHANDISER", "ADMIN", "SUPER_ADMIN"];

export async function POST(request: Request) {
  const savedPaths: string[] = [];
  try {
    enforceSameOrigin(request);
    enforceRateLimit(request, "product-media-upload", 12, 60_000);
    const session = await requireApiStaff(request, roles);
    const form = await request.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length || files.length > MAX_PRODUCT_IMAGES) throw new HttpError(400, `每次可上載 1 至 ${MAX_PRODUCT_IMAGES} 張圖片。`);

    const directory = path.join(getMediaRoot(), "products");
    await mkdir(directory, { recursive: true });
    const uploaded = [];
    for (const file of files) {
      if (file.type !== "image/webp") throw new HttpError(400, "圖片必須先壓縮為 WebP 格式。" );
      if (!file.size || file.size > MAX_PRODUCT_IMAGE_BYTES) throw new HttpError(400, "每張壓縮圖片不可超過 1.6 MB。" );
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!isWebp(bytes)) throw new HttpError(400, "圖片內容不是有效的 WebP 檔案。" );
      const filename = `${Date.now()}-${randomUUID()}.webp`;
      const filePath = resolveProductMediaPath(filename);
      await writeFile(filePath, bytes, { flag: "wx" });
      savedPaths.push(filePath);
      uploaded.push({ url: productMediaUrl(filename), filename, size: bytes.byteLength });
    }
    await writeAudit({ actorId: session.user.id, action: "UPLOAD_PRODUCT_MEDIA", entityType: "Media", entityId: uploaded.map((file) => file.filename).join(","), newValue: uploaded, reason: "後台上載商品圖片", ipAddress: requestIp(request) });
    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (error) {
    await Promise.all(savedPaths.map((filePath) => unlink(filePath).catch(() => undefined)));
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, roles);
    const body = await request.json() as { url?: unknown };
    const filename = typeof body.url === "string" ? filenameFromProductMediaUrl(body.url) : null;
    if (!filename) throw new HttpError(400, "圖片網址無效。" );
    const inUse = await db.product.findFirst({ where: { imagesJson: { contains: body.url as string } }, select: { id: true } });
    if (inUse) throw new HttpError(409, "圖片已被商品使用，不能直接刪除。" );
    await unlink(resolveProductMediaPath(filename)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    await writeAudit({ actorId: session.user.id, action: "DELETE_PRODUCT_MEDIA", entityType: "Media", entityId: filename, oldValue: { url: body.url }, reason: "後台移除未使用商品圖片", ipAddress: requestIp(request) });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
