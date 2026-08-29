import { NextResponse } from "next/server";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { adminCreateSchema } from "@/lib/validation";
import { apiError, enforceRateLimit, enforceSameOrigin, requestIp, HttpError } from "@/lib/http";
import { writeAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    enforceRateLimit(request, "ops-create-admin", 10, 60_000);
    const session = await requireApiStaff(request, ["ADMIN", "SUPER_ADMIN"]);
    const input = adminCreateSchema.parse(await request.json());
    const email = input.email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new HttpError(409, "此電郵已經建立帳戶。" );
    const userId = crypto.randomUUID();
    const password = await hashPassword(input.password);
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { id: userId, name: input.name, email, emailVerified: true, role: input.role, status: "ACTIVE", membershipTier: "MEMBER", locale: "zh-HK" } });
      await tx.account.create({ data: { id: crypto.randomUUID(), accountId: userId, providerId: "credential", issuer: "local:credential", userId, password } });
      return created;
    });
    await writeAudit({ actorId: session.user.id, action: "CREATE_STAFF_ACCOUNT", entityType: "User", entityId: user.id, newValue: { id: user.id, name: user.name, email: user.email, role: user.role }, reason: "後台新增管理員帳戶", ipAddress: requestIp(request) });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) { return apiError(error); }
}
