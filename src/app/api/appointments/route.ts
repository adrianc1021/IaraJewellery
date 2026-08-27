import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointmentSchema } from "@/lib/validation";
import { apiError, enforceRateLimit, enforceSameOrigin } from "@/lib/http";
import { sessionFromRequest } from "@/lib/server-auth";

export async function POST(request: Request) { try { enforceSameOrigin(request); enforceRateLimit(request, "appointment", 6, 15 * 60_000); const session = await sessionFromRequest(request); const body = appointmentSchema.parse(await request.json()); const appointment = await db.appointment.create({ data: { ...body, userId: session?.user.id } }); return NextResponse.json({ appointment }, { status: 201 }); } catch (error) { return apiError(error); } }
