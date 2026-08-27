import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { productUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MERCHANDISER", "ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = productUpdateSchema.parse(await request.json());
    const oldValue = await db.product.findUniqueOrThrow({ where: { id } });
    const product = await db.product.update({ where: { id }, data: input });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_PRODUCT", entityType: "Product", entityId: id, oldValue, newValue: product, reason: "後台更新商品狀態或分類", ipAddress: requestIp(request) });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/pets"); revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product });
  } catch (error) { return apiError(error); }
}
