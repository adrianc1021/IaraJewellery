import { NextResponse } from "next/server";
import { createPendingOrder } from "@/lib/order";
import { stripeClient } from "@/lib/stripe";
import { db } from "@/lib/db";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError } from "@/lib/http";

export async function POST(request: Request) { try { enforceSameOrigin(request); enforceRateLimit(request, "checkout", 8, 15 * 60_000); const idempotencyKey = request.headers.get("idempotency-key"); if (!idempotencyKey || idempotencyKey.length < 12) throw new HttpError(400, "缺少有效的冪等鍵。" ); const result = await createPendingOrder(request, await request.json(), idempotencyKey); const stripe = stripeClient(); if (!stripe) return NextResponse.json({ ...result, configurationRequired: true, message: "訂單已建立為待付款；設定 Stripe 後方可提交付款。" }, { status: 202 }); const intent = await stripe.paymentIntents.create({ amount: result.totalMinor, currency: "hkd", automatic_payment_methods: { enabled: true }, metadata: { orderId: result.orderId, orderNumber: result.orderNumber } }, { idempotencyKey }); await db.order.update({ where: { id: result.orderId }, data: { stripePaymentId: intent.id, payments: { create: { providerIntent: intent.id, status: intent.status, amountMinor: result.totalMinor } } } }); return NextResponse.json({ ...result, clientSecret: intent.client_secret }); } catch (error) { return apiError(error); } }
