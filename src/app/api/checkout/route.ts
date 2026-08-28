import { NextResponse } from "next/server";
import { createPendingOrder } from "@/lib/order";
import { stripeClient } from "@/lib/stripe";
import { db } from "@/lib/db";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError } from "@/lib/http";
import { getLocale } from "@/lib/i18n";
import { sendOrderEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request); enforceRateLimit(request, "checkout", 8, 15 * 60_000);
    const en = await getLocale() === "en";
    const idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey || idempotencyKey.length < 12) throw new HttpError(400, en ? "A valid idempotency key is required." : "缺少有效的冪等鍵。");
    const result = await createPendingOrder(request, await request.json(), idempotencyKey);
    const method = await db.paymentMethodSetting.findUniqueOrThrow({ where: { code: result.paymentMethod } });
    if (method.checkoutMode !== "STRIPE") {
      await db.payment.upsert({ where: { providerIntent: `manual:${result.orderId}` }, update: {}, create: { orderId: result.orderId, provider: result.paymentMethod, providerIntent: `manual:${result.orderId}`, status: "AWAITING_PAYMENT", amountMinor: result.totalMinor } });
      const manualOrder = await db.order.findUnique({ where: { id: result.orderId } });
      if (manualOrder) await sendOrderEmail({ to: manualOrder.email, customerName: manualOrder.customerName, orderNumber: manualOrder.orderNumber, totalMinor: manualOrder.totalMinor, paymentStatus: "AWAITING_PAYMENT" }).catch(() => undefined);
      return NextResponse.json({ ...result, message: (en ? method.instructionsEn : method.instructionsZh) || (en ? "Your order has been created. Follow the instructions to complete payment." : "訂單已建立，請按指示完成付款。") }, { status: 202 });
    }
    const stripe = stripeClient();
    if (!stripe) return NextResponse.json({ ...result, configurationRequired: true, message: en ? "Online payment is not configured yet." : "網上付款尚未設定正式憑證。" }, { status: 202 });
    const order = await db.order.findUniqueOrThrow({ where: { id: result.orderId }, include: { items: true } });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const previousPayment = await db.payment.findFirst({ where: { orderId: result.orderId, provider: "STRIPE", providerIntent: { not: null } }, orderBy: { createdAt: "desc" } });
    if (previousPayment?.providerIntent) {
      const previousSession = await stripe.checkout.sessions.retrieve(previousPayment.providerIntent);
      if (previousSession.url) return NextResponse.json({ ...result, checkoutUrl: previousSession.url });
    }
    const discounts = order.discountMinor > 0 ? [{ coupon: (await stripe.coupons.create({ amount_off: order.discountMinor, currency: "hkd", duration: "once", name: `Iara ${order.orderNumber}` })).id }] : undefined;
    const session = await stripe.checkout.sessions.create({
      mode: "payment", customer_email: order.email,
      line_items: order.items.map((item) => ({ price_data: { currency: "hkd", product_data: { name: item.productName, description: item.optionName }, unit_amount: item.unitPriceMinor }, quantity: item.quantity })),
      discounts, metadata: { orderId: result.orderId, orderNumber: result.orderNumber, paymentMethod: result.paymentMethod },
      payment_intent_data: { metadata: { orderId: result.orderId, orderNumber: result.orderNumber, paymentMethod: result.paymentMethod } },
      success_url: `${appUrl}/order-confirmation/${result.orderId}?payment=success`, cancel_url: `${appUrl}/checkout?payment=cancelled`
    }, { idempotencyKey });
    if (!session.url) throw new HttpError(503, en ? "Secure payment is temporarily unavailable." : "安全付款暫時未能使用。");
    await db.order.update({ where: { id: result.orderId }, data: { stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined, payments: { create: { provider: "STRIPE", providerIntent: session.id, status: "checkout_session_created", amountMinor: result.totalMinor } } } });
    return NextResponse.json({ ...result, checkoutUrl: session.url });
  } catch (error) { return apiError(error); }
}
