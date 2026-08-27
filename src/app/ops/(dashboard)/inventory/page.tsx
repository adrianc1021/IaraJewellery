import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { InventoryAction } from "@/components/ops-actions";
import { requireStaff } from "@/lib/access";

export default async function OpsInventoryPage() {
  await requireStaff();
  const variants = await db.productVariant.findMany({ include: { product: true }, orderBy: { stockOnHand: "asc" } });
  const low = variants.filter((item) => item.stockOnHand - item.stockReserved <= item.lowStockAt).length;
  return <><OpsPageHeader eyebrow="MERCHANDISING" title="庫存管理" description="按 SKU 檢視現貨、預留數量及安全庫存，所有調整均寫入審計紀錄。" action={<span className="ops-page-count warning">{low} 個低庫存</span>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>SKU</th><th>作品</th><th>系列</th><th>尺寸</th><th>價格</th><th>可售</th><th>預留</th><th>操作</th></tr></thead><tbody>{variants.map((variant) => <tr key={variant.id}><td>{variant.sku}</td><td>{variant.product.nameZh}</td><td>{variant.product.collection}</td><td>{variant.optionName}</td><td>{formatMoney(variant.priceMinor)}</td><td className={variant.stockOnHand - variant.stockReserved <= variant.lowStockAt ? "stock-low" : ""}>{variant.stockOnHand - variant.stockReserved}</td><td>{variant.stockReserved}</td><td><InventoryAction id={variant.id} stock={variant.stockOnHand} /></td></tr>)}</tbody></table></div></section></>;
}
