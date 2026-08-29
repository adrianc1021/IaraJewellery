import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { OrderAction, OrderPaymentAction } from "@/components/ops-actions";
import { StatusPill } from "@/components/status-pill";
import { requireStaff } from "@/lib/access";
import { OpsSearch } from "@/components/ops-search";

export default async function OpsOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; payment?: string; status?: string }> }) {
  await requireStaff();
  const params = await searchParams; const q = (params.q || "").trim(); const payment = params.payment || ""; const status = params.status || "";
  const where = { ...(q ? { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {}), ...(payment ? { paymentStatus: payment } : {}), ...(status ? { orderStatus: status } : {}) };
  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
  const outstanding = orders.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.orderStatus)).length;
  return <><OpsPageHeader eyebrow="COMMERCE" title="訂單管理" description="搜尋訂單、核對 FPS／PayMe／Alipay 收款及更新履行狀態。" action={<div className="ops-header-actions"><OpsSearch value={q} placeholder="搜尋訂單號、客戶、電郵或電話" /><span className="ops-page-count">{outstanding} 筆待處理</span></div>} /><section className="ops-section"><form className="ops-filter-bar" method="get"><select name="payment" defaultValue={payment} aria-label="付款狀態"><option value="">所有付款狀態</option><option value="PENDING">待付款</option><option value="AWAITING_PAYMENT">待核對</option><option value="PAID">已付款</option><option value="FAILED">付款失敗</option><option value="REFUNDED">已退款</option></select><select name="status" defaultValue={status} aria-label="訂單狀態"><option value="">所有訂單狀態</option><option value="PENDING_PAYMENT">待付款</option><option value="PROCESSING">處理中</option><option value="READY_FOR_PICKUP">待取貨</option><option value="SHIPPED">已出貨</option><option value="DELIVERED">已完成</option><option value="CANCELLED">已取消</option></select><input type="hidden" name="q" value={q} /><button className="button button-secondary" type="submit">套用篩選</button>{(payment || status || q) && <Link className="text-link" href="/ops/orders">清除</Link>}<span className="ops-filter-count">顯示 {orders.length} 張訂單</span></form><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>訂單</th><th>客戶</th><th>付款狀態</th><th>付款方式</th><th>履行</th><th>商品</th><th>總額</th><th>日期</th><th>操作</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><Link className="order-number-link" href={`/ops/orders/${order.id}`}>{order.orderNumber}</Link></td><td>{order.customerName}<br /><span className="muted">{order.email}</span></td><td><StatusPill value={order.paymentStatus} /></td><td>{order.paymentMethod.replaceAll("_", " ")}</td><td><StatusPill value={order.orderStatus} /></td><td>{order.items.length}</td><td>{formatMoney(order.totalMinor)}</td><td>{formatDate(order.createdAt)}</td><td>{order.paymentStatus === "PAID" ? <OrderAction id={order.id} status={order.orderStatus} /> : <OrderPaymentAction id={order.id} status={order.paymentStatus} />}</td></tr>)}</tbody></table></div></section></>;
}
