import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { OrderAction } from "@/components/ops-actions";
import { StatusPill } from "@/components/status-pill";
import { requireStaff } from "@/lib/access";
import { OpsSearch } from "@/components/ops-search";

export default async function OpsOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const q = ((await searchParams).q || "").trim();
  const orders = await db.order.findMany({ where: q ? { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : undefined, orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
  const outstanding = orders.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.orderStatus)).length;
  return <><OpsPageHeader eyebrow="COMMERCE" title="訂單管理" description="處理付款後的訂單、履行狀態及顧客服務備註。" action={<div className="ops-header-actions"><OpsSearch value={q} placeholder="搜尋訂單號、客戶或電郵" /><span className="ops-page-count">{outstanding} 筆待處理</span></div>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>訂單</th><th>客戶</th><th>付款狀態</th><th>付款方式</th><th>履行</th><th>商品</th><th>總額</th><th>日期</th><th>操作</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.customerName}<br /><span className="muted">{order.email}</span></td><td><StatusPill value={order.paymentStatus} /></td><td>{order.paymentMethod.replaceAll("_", " ")}</td><td><StatusPill value={order.orderStatus} /></td><td>{order.items.length}</td><td>{formatMoney(order.totalMinor)}</td><td>{formatDate(order.createdAt)}</td><td>{order.paymentStatus === "PAID" ? <OrderAction id={order.id} status={order.orderStatus} /> : <span className="muted">待付款</span>}</td></tr>)}</tbody></table></div></section></>;
}
