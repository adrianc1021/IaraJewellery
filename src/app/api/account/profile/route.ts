import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/server-auth";
import { apiError, enforceSameOrigin } from "@/lib/http";
import { memberProfileSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiUser(request);
    const input = memberProfileSchema.parse(await request.json());
    const user = await db.user.update({ where: { id: session.user.id }, data: input, select: { name: true, phone: true, locale: true, marketingConsent: true } });
    return NextResponse.json({ user });
  } catch (error) { return apiError(error); }
}
