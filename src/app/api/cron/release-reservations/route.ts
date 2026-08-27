import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expired = await db.inventoryReservation.findMany({ where: { status: "ACTIVE", expiresAt: { lt: new Date() } } });
  await db.$transaction(async (tx) => { for (const reservation of expired) { await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stockReserved: { decrement: reservation.quantity } } }); await tx.inventoryReservation.update({ where: { id: reservation.id }, data: { status: "EXPIRED" } }); await tx.order.updateMany({ where: { id: reservation.orderId, paymentStatus: "PENDING" }, data: { orderStatus: "PAYMENT_FAILED" } }); } });
  return NextResponse.json({ released: expired.length });
}
