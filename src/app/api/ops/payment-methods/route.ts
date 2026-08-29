import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { paymentSettingsSchema } from "@/lib/validation";

const allowedPaymentCodes = new Set(["FPS", "PAYME", "ALIPAY"]);

export async function PATCH(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["ADMIN", "SUPER_ADMIN"]);
    const { methods, fpsNumber, qrCodeUrl } = paymentSettingsSchema.parse(await request.json());
    if (!methods.some((method) => allowedPaymentCodes.has(method.code) && method.enabled)) return NextResponse.json({ error: "最少需要啟用一種付款方式。" }, { status: 400 });
    if (methods.some((method) => method.code === "FPS" && method.enabled) && !fpsNumber?.trim() && !qrCodeUrl?.trim()) return NextResponse.json({ error: "啟用 FPS 前，請填寫收款號碼或上載 QR Code。" }, { status: 400 });
    const oldValue = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
    const enabledByCode = new Map(methods.map((method) => [method.code, method.enabled]));
    await db.$transaction([
      ...Array.from(allowedPaymentCodes).map((code) => db.paymentMethodSetting.update({ where: { code }, data: { enabled: Boolean(enabledByCode.get(code)), accountReference: code === "FPS" ? (fpsNumber?.trim() || null) : undefined, qrCodeUrl: code === "FPS" ? (qrCodeUrl?.trim() || null) : undefined, updatedBy: session.user.id } })),
      ...["CREDIT_CARD", "APPLE_PAY", "CASH", "WECHAT_PAY"].map((code) => db.paymentMethodSetting.update({ where: { code }, data: { enabled: false, updatedBy: session.user.id } }))
    ]);
    const settings = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_PAYMENT_METHODS", entityType: "PaymentMethodSetting", entityId: "checkout", oldValue, newValue: settings, reason: "後台調整可用付款方式", ipAddress: requestIp(request) });
    revalidatePath("/checkout");
    revalidatePath("/cart");
    return NextResponse.json({ settings });
  } catch (error) { return apiError(error); }
}
