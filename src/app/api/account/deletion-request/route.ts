import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, enforceRateLimit, enforceSameOrigin, requestIp } from "@/lib/http";
import { requireApiUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    enforceRateLimit(request, "account-deletion", 2, 24 * 60 * 60_000);
    const session = await requireApiUser(request);
    const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });
    if (user.status !== "DELETION_REQUESTED") {
      await db.$transaction([
        db.user.update({ where: { id: user.id }, data: { status: "DELETION_REQUESTED" } }),
        db.auditLog.create({ data: {
          actorId: user.id,
          action: "ACCOUNT_DELETION_REQUEST",
          entityType: "User",
          entityId: user.id,
          oldValue: JSON.stringify({ status: user.status }),
          newValue: JSON.stringify({ status: "DELETION_REQUESTED" }),
          reason: "會員從會員中心提交刪除帳戶申請",
          ipAddress: requestIp(request)
        } })
      ]);
    }
    return NextResponse.json({ message: "刪除帳戶申請已提交。" }, { status: 202 });
  } catch (error) { return apiError(error); }
}
