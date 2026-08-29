import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolvePaymentMediaPath } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const bytes = await readFile(resolvePaymentMediaPath(filename));
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "image/webp", "Content-Length": String(bytes.byteLength), "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ error: "找不到圖片。" }, { status: 404 });
  }
}
