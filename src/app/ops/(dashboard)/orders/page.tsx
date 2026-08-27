import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { OrderAction } from "@/components/ops-actions";
import { StatusPill } from "@/components/status-pill";

export default async function OpsOrdersPage() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
  const outstanding = orders.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.orderStatus)).length;
  return <><OpsPageHeader eyebrow="COMMERCE" title="訂單管理" description="處理付款後的訂單、履行狀態及顧客服務備註。" action={<span className="ops-page-count">{outstanding} 筆待處理</span>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>訂單</th><th>客戶</th><th>付款</th><th>履行</th><th>商品</th><th>總額</th><th>日期</th><th>操作</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.customerName}<br /><span className="muted">{order.email}</span></td><td><StatusPill value={order.paymentStatus} /></td><td><StatusPill value={order.orderStatus} /></td><td>{order.items.length}</td><td>{formatMoney(order.totalMinor)}</td><td>{formatDate(order.createdAt)}</td><td><OrderAction id={order.id} status={order.orderStatus} /></td></tr>)}</tbody></table></div></section></>;
}
