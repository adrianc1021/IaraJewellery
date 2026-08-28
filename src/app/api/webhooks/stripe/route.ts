import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = stripeClient(), secret = process.env.STRIPE_WEBHOOK_SECRET, signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Stripe webhook 未設定。" }, { status: 503 });
  const body = await request.text(); let event;
  try { event = stripe.webhooks.constructEvent(body, signature, secret); } catch { return NextResponse.json({ error: "簽名驗證失敗。" }, { status: 400 }); }
  const seen = await db.webhookEvent.findUnique({ where: { id: event.id } }); if (seen) return NextResponse.json({ received: true, duplicate: true });
  await db.$transaction(async (tx) => {
    await tx.webhookEvent.create({ data: { id: event.id, provider: "STRIPE", eventType: event.type, payloadHash: createHash("sha256").update(body).digest("hex") } });
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object; await settlePaidOrder(tx, intent.metadata.orderId, intent.id);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object; const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : undefined; await settlePaidOrder(tx, session.metadata?.orderId, paymentIntent || session.id);
    }
    if (event.type === "payment_intent.payment_failed") { const intent = event.data.object; if (intent.metadata.orderId) await tx.order.update({ where: { id: intent.metadata.orderId }, data: { paymentStatus: "FAILED", orderStatus: "PAYMENT_FAILED" } }); }
  });
  return NextResponse.json({ received: true });
}

async function settlePaidOrder(tx: Parameters<Parameters<typeof db.$transaction>[0]>[0], orderId: string | undefined, providerIntent: string) {
  if (!orderId) return;
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { reservations: true } });
  if (!order || order.paymentStatus === "PAID") return;
  for (const reservation of order.reservations.filter((item) => item.status === "ACTIVE")) { await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stockOnHand: { decrement: reservation.quantity }, stockReserved: { decrement: reservation.quantity } } }); await tx.inventoryReservation.update({ where: { id: reservation.id }, data: { status: "CONFIRMED" } }); }
  await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID", orderStatus: "PROCESSING", stripePaymentId: providerIntent, payments: { updateMany: { where: { orderId }, data: { status: "succeeded" } } } } });
  await tx.orderStatusHistory.create({ data: { orderId, status: "PROCESSING", note: "Stripe webhook 已驗證付款" } });
  if (order.userId) await tx.pointsTransaction.create({ data: { userId: order.userId, type: "EARN", points: Math.floor(order.totalMinor / 10000), orderId, reason: `訂單 ${order.orderNumber} 消費積分` } });
}
