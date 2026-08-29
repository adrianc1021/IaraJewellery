import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderStatusSchema } from "@/lib/validation";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["CUSTOMER_SERVICE", "WAREHOUSE", "ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const body = orderStatusSchema.parse(await request.json());
    const old = await db.order.findUniqueOrThrow({ where: { id }, include: { payments: true } });
    if (body.orderStatus && body.orderStatus !== "CANCELLED" && body.paymentStatus && body.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "未確認付款前不能更新履行狀態。" }, { status: 400 });
    }
    const nextPaymentStatus = body.paymentStatus;
    const nextOrderStatus = body.orderStatus || (nextPaymentStatus === "PAID" ? "PROCESSING" : undefined);
    const order = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(nextOrderStatus ? { orderStatus: nextOrderStatus, fulfillmentStatus: nextOrderStatus } : {}),
          ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {})
        }
      });
      if (nextPaymentStatus) {
        const manual = old.payments.find((payment) => payment.providerIntent === `manual:${id}`);
        if (manual) await tx.payment.update({ where: { id: manual.id }, data: { status: nextPaymentStatus === "PAID" ? "succeeded" : nextPaymentStatus.toLowerCase() } });
        else if (nextPaymentStatus === "PAID") await tx.payment.create({ data: { orderId: id, provider: old.paymentMethod, providerIntent: `manual:${id}`, status: "succeeded", amountMinor: old.totalMinor } });
        await tx.orderStatusHistory.create({ data: { orderId: id, status: `PAYMENT_${nextPaymentStatus}`, note: body.note || "後台更新付款狀態", actorId: session.user.id } });
      }
      if (nextOrderStatus) await tx.orderStatusHistory.create({ data: { orderId: id, status: nextOrderStatus, note: body.note, actorId: session.user.id } });
      return updated;
    });
    await writeAudit({ actorId: session.user.id, action: nextPaymentStatus ? "UPDATE_ORDER_PAYMENT" : "UPDATE_ORDER_STATUS", entityType: "Order", entityId: id, oldValue: { orderStatus: old.orderStatus, paymentStatus: old.paymentStatus }, newValue: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus }, reason: body.note, ipAddress: requestIp(request) });
    return NextResponse.json({ order });
  } catch (error) {
    return apiError(error);
  }
}
