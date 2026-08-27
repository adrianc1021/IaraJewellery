import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
import { productCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const session = await requireApiStaff(request, ["MERCHANDISER", "ADMIN", "SUPER_ADMIN"]);
    const input = productCreateSchema.parse(await request.json());
    const product = await db.product.create({ data: {
      sanityProductId: `ops-${input.slug}`,
      slug: input.slug,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      descriptionZh: input.descriptionZh,
      descriptionEn: input.descriptionEn,
      storyZh: "由 Iara 香港工房細緻完成，並通過品質檢查。",
      category: input.category,
      collection: input.collection,
      audience: input.audience,
      material: input.material,
      gemstone: input.gemstone,
      badge: input.badge || null,
      imagesJson: JSON.stringify([input.imageUrl]),
      featured: input.featured,
      variants: { create: { sku: input.sku.toUpperCase(), optionName: input.optionName, priceMinor: input.priceMinor, stockOnHand: input.stockOnHand } }
    }, include: { variants: true } });
    await writeAudit({ actorId: session.user.id, action: "CREATE_PRODUCT", entityType: "Product", entityId: product.id, newValue: product, reason: "後台新增商品", ipAddress: requestIp(request) });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/pets");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) { return apiError(error); }
}
