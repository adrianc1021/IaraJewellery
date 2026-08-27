import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { requireApiStaff } from "@/lib/server-auth";
import { popupAnnouncementSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MARKETING", "ADMIN", "SUPER_ADMIN"]);
    const body = popupAnnouncementSchema.parse(await request.json());
    const announcement = await db.popupAnnouncement.create({ data: {
      ...body,
      eyebrow: body.eyebrow || null,
      ctaLabel: body.ctaLabel || null,
      ctaHref: body.ctaHref || null,
      imageUrl: body.imageUrl || null,
      updatedBy: session.user.id
    } });
    await writeAudit({ actorId: session.user.id, action: "CREATE_POPUP_ANNOUNCEMENT", entityType: "PopupAnnouncement", entityId: announcement.id, newValue: announcement, reason: "後台建立彈出通告", ipAddress: requestIp(request) });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) { return apiError(error); }
}
