import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, readCart } from "@/lib/cart";
import { cartUpdateSchema } from "@/lib/validation";
import { serializeCart } from "@/lib/serialize";
import { apiError, enforceRateLimit, enforceSameOrigin, HttpError } from "@/lib/http";
import { getLocale } from "@/lib/i18n";

async function ownItem(request: Request, id: string) { const cart = await getOrCreateCart(request.headers); const item = await db.cartItem.findFirst({ where: { id, cartId: cart.id }, include: { variant: true } }); if (!item) throw new HttpError(404, "購物袋商品不存在。" ); return item; }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { enforceSameOrigin(request); enforceRateLimit(request, "cart-write", 40); const { id } = await params; const body = cartUpdateSchema.parse(await request.json()); const item = await ownItem(request, id); if (body.quantity > item.variant.stockOnHand - item.variant.stockReserved) throw new HttpError(409, "庫存不足。" ); await db.cartItem.update({ where: { id }, data: { quantity: body.quantity } }); return NextResponse.json(serializeCart(await readCart(request.headers), await getLocale())); } catch (error) { return apiError(error); } }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { try { enforceSameOrigin(request); const { id } = await params; await ownItem(request, id); await db.cartItem.delete({ where: { id } }); return NextResponse.json(serializeCart(await readCart(request.headers), await getLocale())); } catch (error) { return apiError(error); } }
