import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, enforceRateLimit, enforceSameOrigin } from "@/lib/http";

const metricSchema = z.object({
  name: z.enum(["CLS", "FCP", "INP", "LCP", "TTFB"]),
  value: z.number().finite().nonnegative(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  id: z.string().max(120),
  path: z.string().startsWith("/").max(300),
  navigationType: z.string().max(80).optional()
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    enforceRateLimit(request, "web-vitals", 120, 60_000);
    const metric = metricSchema.parse(await request.json());
    console.info(JSON.stringify({ event: "WEB_VITAL", ...metric, recordedAt: new Date().toISOString() }));
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
