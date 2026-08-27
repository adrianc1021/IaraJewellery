import { NextResponse } from "next/server";
import { readCart } from "@/lib/cart";
import { serializeCart } from "@/lib/serialize";
import { apiError, enforceRateLimit } from "@/lib/http";
export async function GET(request: Request) { try { enforceRateLimit(request, "cart-read", 120); return NextResponse.json(serializeCart(await readCart(request.headers))); } catch (error) { return apiError(error); } }
