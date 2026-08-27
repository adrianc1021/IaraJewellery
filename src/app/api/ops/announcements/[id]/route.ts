import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { requireApiStaff } from "@/lib/server-auth";
import { popupAnnouncementUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MARKETING", "ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const body = popupAnnouncementUpdateSchema.parse(await request.json());
    const oldValue = await db.popupAnnouncement.findUniqueOrThrow({ where: { id } });
    const announcement = await db.popupAnnouncement.update({ where: { id }, data: { ...body, updatedBy: session.user.id } });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_POPUP_ANNOUNCEMENT", entityType: "PopupAnnouncement", entityId: id, oldValue, newValue: announcement, reason: "後台更新彈出通告", ipAddress: requestIp(request) });
    return NextResponse.json({ announcement });
  } catch (error) { return apiError(error); }
}
