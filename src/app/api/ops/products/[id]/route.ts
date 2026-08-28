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
    const oldValue = await db.product.findUniqueOrThrow({ where: { id }, include: { variants: true } });
    const { sku, optionName, priceMinor, stockOnHand, imageUrl, imageUrls, ...productInput } = input;
    const images = imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : undefined;
    const product = await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { ...productInput, ...(images ? { imagesJson: JSON.stringify(images) } : {}) } });
      if (sku !== undefined || optionName !== undefined || priceMinor !== undefined || stockOnHand !== undefined) {
        const variant = oldValue.variants[0];
        if (variant) await tx.productVariant.update({ where: { id: variant.id }, data: { ...(sku !== undefined ? { sku: sku.toUpperCase() } : {}), ...(optionName !== undefined ? { optionName } : {}), ...(priceMinor !== undefined ? { priceMinor } : {}), ...(stockOnHand !== undefined ? { stockOnHand } : {}) } });
      }
      return tx.product.findUniqueOrThrow({ where: { id }, include: { variants: true } });
    });
    await writeAudit({ actorId: session.user.id, action: "UPDATE_PRODUCT", entityType: "Product", entityId: id, oldValue, newValue: product, reason: "後台完整更新商品資料", ipAddress: requestIp(request) });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/pets"); revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product });
  } catch (error) { return apiError(error); }
}
