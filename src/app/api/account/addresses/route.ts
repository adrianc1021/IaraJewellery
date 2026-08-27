import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, enforceRateLimit, enforceSameOrigin } from "@/lib/http";
import { requireApiUser } from "@/lib/server-auth";

const schema = z.object({ recipient: z.string().min(2).max(80), phone: z.string().min(8).max(24), line1: z.string().min(5).max(200), district: z.string().min(2).max(50), label: z.string().max(30).default("主要地址"), isDefault: z.union([z.boolean(), z.literal("on")]).optional() });
export async function POST(request: Request) { try { enforceSameOrigin(request); enforceRateLimit(request, "address", 10); const session = await requireApiUser(request); const body = schema.parse(await request.json()); const isDefault = body.isDefault === true || body.isDefault === "on"; const address = await db.$transaction(async (tx) => { if (isDefault) await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }); return tx.address.create({ data: { userId: session.user.id, recipient: body.recipient, phone: body.phone, line1: body.line1, district: body.district, label: body.label, isDefault } }); }); return NextResponse.json({ address }, { status: 201 }); } catch (error) { return apiError(error); } }
