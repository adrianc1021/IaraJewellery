import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { SITE_LAYOUT_ID } from "@/lib/site-layout";
import { siteLayoutSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MARKETING", "MERCHANDISER", "ADMIN", "SUPER_ADMIN"]);
    const body = siteLayoutSchema.parse(await request.json());
    const oldValue = await db.siteLayoutSetting.findUnique({ where: { id: SITE_LAYOUT_ID } });
    const settings = await db.siteLayoutSetting.upsert({
      where: { id: SITE_LAYOUT_ID },
      update: { ...body, updatedBy: session.user.id },
      create: { id: SITE_LAYOUT_ID, ...body, updatedBy: session.user.id }
    });
    await writeAudit({
      actorId: session.user.id,
      action: "UPDATE_SITE_LAYOUT",
      entityType: "SiteLayoutSetting",
      entityId: SITE_LAYOUT_ID,
      oldValue,
      newValue: settings,
      reason: "後台調整首頁版面",
      ipAddress: requestIp(request)
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return apiError(error);
  }
}
