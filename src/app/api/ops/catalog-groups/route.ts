import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { catalogGroupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MERCHANDISER", "ADMIN", "SUPER_ADMIN"]);
    const input = catalogGroupSchema.parse(await request.json());
    const group = await db.catalogGroup.create({ data: { ...input, imageUrl: input.imageUrl || null } });
    await writeAudit({ actorId: session.user.id, action: "CREATE_CATALOG_GROUP", entityType: "CatalogGroup", entityId: group.id, newValue: group, reason: "後台新增分類或系列", ipAddress: requestIp(request) });
    revalidatePath("/"); revalidatePath("/shop");
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) { return apiError(error); }
}
