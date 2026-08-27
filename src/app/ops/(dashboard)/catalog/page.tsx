import { db } from "@/lib/db";
import { parseImages } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { CatalogManager } from "@/components/catalog-manager";

export default async function OpsCatalogPage() {
  const [products, groups] = await Promise.all([
    db.product.findMany({ include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } }),
    db.catalogGroup.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] })
  ]);
  const rows = products.map((product) => ({ id: product.id, slug: product.slug, nameZh: product.nameZh, nameEn: product.nameEn, category: product.category, collection: product.collection, audience: product.audience, status: product.status, featured: product.featured, imageUrl: parseImages(product.imagesJson)[0] || "", priceMinor: product.variants[0]?.priceMinor || 0, stock: product.variants.reduce((sum, variant) => sum + variant.stockOnHand - variant.stockReserved, 0) }));
  return <><OpsPageHeader eyebrow="MERCHANDISING" title="商品目錄" description="新增商品、管理上下架狀態，並調整珠寶分類及品牌系列。" action={<span className="ops-page-count">{products.filter((product) => product.status === "ACTIVE").length} 件上架商品</span>} /><CatalogManager products={rows} groups={groups} /></>;
}
