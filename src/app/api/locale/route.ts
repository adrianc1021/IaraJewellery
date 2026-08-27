import { NextResponse } from "next/server";
import { enforceSameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  enforceSameOrigin(request);
  const body = await request.json();
  const locale = body.locale === "en" ? "en" : "zh-HK";
  const response = NextResponse.json({ locale });
  response.cookies.set("iara-locale", locale, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000 });
  return response;
}
