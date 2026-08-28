import { NextResponse } from "next/server";
import { getOrCreateCart, readCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { cartItemSchema } from "@/lib/validation";
import { serializeCart } from "@/lib/serialize";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError } from "@/lib/http";
import { getLocale } from "@/lib/i18n";

export async function POST(request: Request) { try { enforceSameOrigin(request); enforceRateLimit(request, "cart-write", 40); const body = cartItemSchema.parse(await request.json()); const [cart, variant] = await Promise.all([getOrCreateCart(request.headers), db.productVariant.findUnique({ where: { id: body.variantId } })]); if (!variant?.active) throw new HttpError(404, "商品選項不存在。" ); const available = variant.stockOnHand - variant.stockReserved; const current = await db.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId: body.variantId } } }); if ((current?.quantity || 0) + body.quantity > available) throw new HttpError(409, "庫存不足，請調整數量。" ); await db.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: body.variantId } }, update: { quantity: { increment: body.quantity } }, create: { cartId: cart.id, variantId: body.variantId, quantity: body.quantity } }); return NextResponse.json(serializeCart(await readCart(request.headers), await getLocale()), { status: 201 }); } catch (error) { return apiError(error); } }
