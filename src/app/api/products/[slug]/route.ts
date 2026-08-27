import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const product = await db.product.findUnique({ where: { slug }, include: { variants: true } }); return product ? NextResponse.json({ product }) : NextResponse.json({ error: "找不到作品。" }, { status: 404 }); }
