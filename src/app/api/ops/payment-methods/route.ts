import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { paymentMethodsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["ADMIN", "SUPER_ADMIN"]);
    const { methods } = paymentMethodsSchema.parse(await request.json());
    if (!methods.some((method) => method.enabled)) return NextResponse.json({ error: "最少需要啟用一種付款方式。" }, { status: 400 });
    const oldValue = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
    await db.$transaction(methods.map((method) => db.paymentMethodSetting.update({ where: { code: method.code }, data: { enabled: method.enabled, updatedBy: session.user.id } })));
    const settings = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_PAYMENT_METHODS", entityType: "PaymentMethodSetting", entityId: "checkout", oldValue, newValue: settings, reason: "後台調整可用付款方式", ipAddress: requestIp(request) });
    revalidatePath("/checkout");
    return NextResponse.json({ settings });
  } catch (error) { return apiError(error); }
}
