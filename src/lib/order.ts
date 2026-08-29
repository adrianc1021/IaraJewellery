import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { readCart } from "@/lib/cart";
import { HttpError } from "@/lib/http";
import { checkoutSchema } from "@/lib/validation";
import { sessionFromRequest } from "@/lib/server-auth";

const allowedPaymentCodes = new Set(["FPS", "PAYME", "ALIPAY"]);

export async function createPendingOrder(request: Request, raw: unknown, idempotencyKey: string) {
  const input = checkoutSchema.parse(raw);
  const existing = await db.idempotencyKey.findUnique({ where: { id: idempotencyKey } });
  if (existing?.response) return JSON.parse(existing.response) as { orderId: string; orderNumber: string; totalMinor: number; paymentMethod: string };
  if (!allowedPaymentCodes.has(input.paymentMethod)) throw new HttpError(400, "目前只接受 FPS、PayMe 及 AlipayHK 付款。" );
  const paymentMethod = await db.paymentMethodSetting.findUnique({ where: { code: input.paymentMethod } });
  if (!paymentMethod?.enabled) throw new HttpError(400, "所選付款方式目前未開放。");
  if (input.paymentMethod === "CASH" && input.deliveryMethod !== "PICKUP") throw new HttpError(400, "現金付款只適用於門市自取。");
  const cart = await readCart(request.headers);
  if (!cart.items.length) throw new HttpError(400, "購物袋沒有商品。" );
  const session = await sessionFromRequest(request);
  let discountMinor = 0;
  if (input.promotionCode) { const promo = await db.promotion.findUnique({ where: { code: input.promotionCode.toUpperCase() } }); const subtotal = cart.items.reduce((sum, item) => sum + item.variant.priceMinor * item.quantity, 0); if (promo?.active && promo.startsAt <= new Date() && promo.endsAt >= new Date() && subtotal >= promo.minimumMinor && (!promo.usageLimit || promo.usageCount < promo.usageLimit)) discountMinor = promo.type === "PERCENT" ? Math.floor(subtotal * promo.value / 100) : Math.min(promo.value, subtotal); else throw new HttpError(400, "優惠碼無效或未符合條件。" ); }
  return db.$transaction(async (tx) => {
    const currentKey = await tx.idempotencyKey.findUnique({ where: { id: idempotencyKey } });
    if (currentKey?.response) return JSON.parse(currentKey.response) as { orderId: string; orderNumber: string; totalMinor: number; paymentMethod: string };
    const subtotalMinor = cart.items.reduce((sum, item) => sum + item.variant.priceMinor * item.quantity, 0);
    for (const item of cart.items) {
      const current = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
      if (!current.active || current.stockOnHand - current.stockReserved < item.quantity) throw new HttpError(409, `${item.variant.product.nameZh} 庫存不足。`);
      const updated = await tx.productVariant.updateMany({ where: { id: current.id, stockOnHand: current.stockOnHand, stockReserved: current.stockReserved }, data: { stockReserved: { increment: item.quantity } } });
      if (updated.count !== 1) throw new HttpError(409, "庫存剛被更新，請重試。" );
    }
    const orderNumber = `IA${new Date().toISOString().slice(2,10).replaceAll("-","")}${randomUUID().slice(0,6).toUpperCase()}`;
    const order = await tx.order.create({ data: { orderNumber, userId: session?.user.id, email: input.email, customerName: input.customerName, phone: input.phone, paymentMethod: input.paymentMethod, subtotalMinor, discountMinor, totalMinor: subtotalMinor - discountMinor, deliveryMethod: input.deliveryMethod, shippingAddress: input.shippingAddress, giftMessage: input.giftMessage, promotionCode: input.promotionCode?.toUpperCase(), items: { create: cart.items.map((item) => ({ productId: item.variant.product.id, variantId: item.variant.id, productName: item.variant.product.nameZh, sku: item.variant.sku, optionName: item.variant.optionName, unitPriceMinor: item.variant.priceMinor, quantity: item.quantity, lineTotalMinor: item.variant.priceMinor * item.quantity })) } } });
    await tx.inventoryReservation.createMany({ data: cart.items.map((item) => ({ orderId: order.id, variantId: item.variant.id, quantity: item.quantity, expiresAt: new Date(Date.now() + 15 * 60_000) })) });
    await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "PENDING_PAYMENT", note: "訂單建立並預留庫存 15 分鐘" } });
    const response = { orderId: order.id, orderNumber: order.orderNumber, totalMinor: order.totalMinor, paymentMethod: input.paymentMethod };
    await tx.idempotencyKey.create({ data: { id: idempotencyKey, scope: "checkout", response: JSON.stringify(response) } });
    return response;
  });
}
