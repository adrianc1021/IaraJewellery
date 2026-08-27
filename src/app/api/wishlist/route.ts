import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/server-auth";
import { apiError, enforceSameOrigin } from "@/lib/http";
const schema = z.object({ productId: z.string().min(1) });
export async function GET(request: Request) { try { const session = await requireApiUser(request); const items = await db.wishlistItem.findMany({ where: { userId: session.user.id }, include: { product: true } }); return NextResponse.json({ items }); } catch (error) { return apiError(error); } }
export async function POST(request: Request) { try { enforceSameOrigin(request); const session = await requireApiUser(request); const { productId } = schema.parse(await request.json()); const item = await db.wishlistItem.upsert({ where: { userId_productId: { userId: session.user.id, productId } }, update: {}, create: { userId: session.user.id, productId } }); return NextResponse.json({ item }, { status: 201 }); } catch (error) { return apiError(error); } }
export async function DELETE(request: Request) { try { enforceSameOrigin(request); const session = await requireApiUser(request); const { productId } = schema.parse(await request.json()); await db.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } }); return NextResponse.json({ ok: true }); } catch (error) { return apiError(error); } }
