import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getTrustedOrigins } from "@/lib/origins";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function enforceRateLimit(request: Request, scope: string, limit = 30, windowMs = 60_000) {
  const key = `${scope}:${requestIp(request)}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) throw new HttpError(429, "請稍後再試。");
}

export function enforceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (!getTrustedOrigins().includes(new URL(origin).origin)) throw new HttpError(403, "無效的請求來源。" );
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: "資料格式不正確。", fields: error.flatten().fieldErrors }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: "系統暫時未能處理請求。" }, { status: 500 });
}
