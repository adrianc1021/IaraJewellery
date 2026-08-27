import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { catalogGroupUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MERCHANDISER", "ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = catalogGroupUpdateSchema.parse(await request.json());
    const oldValue = await db.catalogGroup.findUniqueOrThrow({ where: { id } });
    const group = await db.$transaction(async (tx) => {
      if (input.nameZh && input.nameZh !== oldValue.nameZh) {
        if (oldValue.kind === "CATEGORY") await tx.product.updateMany({ where: { category: oldValue.nameZh }, data: { category: input.nameZh } });
        if (oldValue.kind === "COLLECTION") await tx.product.updateMany({ where: { collection: oldValue.nameZh }, data: { collection: input.nameZh } });
      }
      return tx.catalogGroup.update({ where: { id }, data: { ...input, imageUrl: input.imageUrl || null } });
    });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_CATALOG_GROUP", entityType: "CatalogGroup", entityId: id, oldValue, newValue: group, reason: "後台調整分類或系列", ipAddress: requestIp(request) });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/pets");
    return NextResponse.json({ group });
  } catch (error) { return apiError(error); }
}
