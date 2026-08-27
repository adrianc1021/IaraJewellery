import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const announcement = await db.popupAnnouncement.findFirst({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, eyebrow: true, title: true, body: true, ctaLabel: true, ctaHref: true, imageUrl: true, showOnce: true, updatedAt: true }
  });
  return NextResponse.json({ announcement }, { headers: { "cache-control": "no-store" } });
}
