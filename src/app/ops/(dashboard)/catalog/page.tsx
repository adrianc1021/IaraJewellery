import { db } from "@/lib/db";
import { parseImages } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { CatalogManager } from "@/components/catalog-manager";
import { requireStaff } from "@/lib/access";

export default async function OpsCatalogPage() {
  await requireStaff();
  const [products, groups] = await Promise.all([
    db.product.findMany({ include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } }),
    db.catalogGroup.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] })
  ]);
  const rows = products.map((product) => ({ ...product, imageUrl: parseImages(product.imagesJson)[0] || "", images: parseImages(product.imagesJson), priceMinor: product.variants[0]?.priceMinor || 0, stock: product.variants.reduce((sum, variant) => sum + variant.stockOnHand - variant.stockReserved, 0), variant: product.variants[0] ? { id: product.variants[0].id, sku: product.variants[0].sku, optionName: product.variants[0].optionName, priceMinor: product.variants[0].priceMinor, stockOnHand: product.variants[0].stockOnHand } : null }));
  return <><OpsPageHeader eyebrow="MERCHANDISING" title="商品目錄" description="新增商品、管理上下架狀態，並調整珠寶分類及品牌系列。" action={<span className="ops-page-count">{products.filter((product) => product.status === "ACTIVE").length} 件上架商品</span>} /><CatalogManager products={rows} groups={groups} /></>;
}
