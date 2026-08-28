import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", integrations: { stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET), email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), sanity: Boolean(process.env.SANITY_PROJECT_ID && process.env.SANITY_WEBHOOK_SECRET), database: true } });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
