import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const CART_COOKIE = "iara_guest_cart";

export async function getCartContext(headers?: Headers) {
  const session = headers ? await auth.api.getSession({ headers }) : null;
  const cookieStore = await cookies();
  let guestToken = cookieStore.get(CART_COOKIE)?.value;
  if (!session && !guestToken) {
    guestToken = randomUUID();
    cookieStore.set(CART_COOKIE, guestToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return { userId: session?.user.id, guestToken: session ? undefined : guestToken };
}

export async function getOrCreateCart(headers?: Headers) {
  const identity = await getCartContext(headers);
  const where = identity.userId ? { userId: identity.userId } : { guestToken: identity.guestToken };
  const existing = await db.cart.findFirst({ where });
  if (existing) return existing;
  return db.cart.create({ data: { ...identity, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
}

export async function readCart(headers?: Headers) {
  const cart = await getOrCreateCart(headers);
  return db.cart.findUniqueOrThrow({ where: { id: cart.id }, include: { items: { orderBy: { createdAt: "asc" }, include: { variant: { include: { product: true } } } } } });
}
