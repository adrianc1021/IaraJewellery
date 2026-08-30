import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  if (error instanceof ZodError) return NextResponse.json({ error: "部分資料需要修正。", fields: error.flatten().fieldErrors }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const targets = Array.isArray(error.meta?.target) ? error.meta.target.map(String) : [String(error.meta?.target || "")];
    const field = targets.some((target) => target.toLowerCase().includes("sku")) ? "sku" : targets.some((target) => target.toLowerCase().includes("slug")) ? "slug" : "";
    const fields = field ? { [field]: [field === "sku" ? "此 SKU 已被其他商品使用。" : "此網址代號已被其他商品使用。"] } : undefined;
    return NextResponse.json({ error: field ? "商品識別資料重複。" : "已有相同資料，請檢查後再試。", fields }, { status: 409 });
  }
  console.error(error);
  return NextResponse.json({ error: "系統暫時未能處理請求。" }, { status: 500 });
}
