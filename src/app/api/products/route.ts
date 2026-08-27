import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) { const url = new URL(request.url); const q = url.searchParams.get("q") || ""; const products = await db.product.findMany({ where: { status: "ACTIVE", ...(q ? { OR: [{ nameZh: { contains: q } }, { nameEn: { contains: q } }, { collection: { contains: q } }, { category: { contains: q } }, { material: { contains: q } }, { gemstone: { contains: q } }, { descriptionZh: { contains: q } }, { descriptionEn: { contains: q } }] } : {}) }, include: { variants: true }, take: 50 }); return NextResponse.json({ products }); }
