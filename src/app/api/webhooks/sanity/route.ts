import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET, signature = request.headers.get("x-iara-sanity-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Sanity webhook 未設定。" }, { status: 503 });
  const body = await request.text(); const expected = createHash("sha256").update(`${secret}:${body}`).digest("hex");
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "簽名驗證失敗。" }, { status: 400 });
  const id = request.headers.get("x-sanity-transaction-id") || createHash("sha256").update(body).digest("hex");
  if (await db.webhookEvent.findUnique({ where: { id } })) return NextResponse.json({ ok: true, duplicate: true });
  await db.webhookEvent.create({ data: { id, provider: "SANITY", eventType: "content.changed", payloadHash: createHash("sha256").update(body).digest("hex") } });
  return NextResponse.json({ ok: true, revalidationRequired: true });
}
