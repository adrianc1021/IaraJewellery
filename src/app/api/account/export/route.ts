import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, enforceRateLimit } from "@/lib/http";
import { requireApiUser } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "account-export", 3, 60 * 60_000);
    const session = await requireApiUser(request);
    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, emailVerified: true, phone: true,
        locale: true, marketingConsent: true, membershipTier: true, status: true,
        createdAt: true, updatedAt: true,
        addresses: true,
        orders: { include: { items: true, history: true, payments: true, refunds: true } },
        appointments: { include: { store: { select: { name: true, address: true } } } },
        wishlistItems: { include: { product: { select: { slug: true, nameZh: true, nameEn: true } } } },
        points: true
      }
    });
    return NextResponse.json(
      { generatedAt: new Date().toISOString(), account: user },
      {
        headers: {
          "cache-control": "private, no-store",
          "content-disposition": `attachment; filename="iara-account-${user.id}.json"`
        }
      }
    );
  } catch (error) { return apiError(error); }
}
