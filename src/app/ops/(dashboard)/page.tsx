import Link from "next/link";
import { ArrowUpRight, Boxes, CalendarDays, ClipboardList, ContactRound } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";

export default async function OpsOverviewPage() {
  const [orders, variants, members, appointments] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 50 }),
    db.productVariant.findMany({ include: { product: true }, orderBy: { stockOnHand: "asc" } }),
    db.user.count(),
    db.appointment.findMany({ orderBy: { appointmentDate: "asc" }, include: { store: true }, take: 20 })
  ]);
  const paid = orders.filter((order) => order.paymentStatus === "PAID");
  const gross = paid.reduce((sum, order) => sum + order.totalMinor, 0);
  const aov = paid.length ? Math.round(gross / paid.length) : 0;
  const lowStock = variants.filter((variant) => variant.stockOnHand - variant.stockReserved <= variant.lowStockAt);
  const pending = appointments.filter((item) => ["NEW", "CONFIRMED"].includes(item.status));
  const cards = [
    { label: "訂單", value: orders.length, meta: formatMoney(gross), href: "/ops/orders", icon: ClipboardList },
    { label: "平均訂單", value: formatMoney(aov), meta: `${paid.length} 筆已付款`, href: "/ops/orders", icon: ArrowUpRight },
    { label: "低庫存 SKU", value: lowStock.length, meta: "需要補貨", href: "/ops/inventory", icon: Boxes },
    { label: "會員", value: members, meta: "所有帳戶", href: "/ops/members", icon: ContactRound },
    { label: "開放預約", value: pending.length, meta: "待確認或進行中", href: "/ops/appointments", icon: CalendarDays }
  ];
  return <><OpsPageHeader eyebrow="OVERVIEW" title="營運總覽" description={`Iara 即時營運狀態 · ${formatDate(new Date())}`} />
    {!process.env.STRIPE_SECRET_KEY && <p className="config-notice">Stripe、Email 與 Sanity 尚未設定正式憑證。付款只可停留在待付款狀態。</p>}
    <section className="ops-kpis ops-kpi-links">{cards.map(({ label, value, meta, href, icon: Icon }) => <Link className="ops-kpi" href={href} key={label}><span><Icon size={15} />{label}</span><strong>{value}</strong><small>{meta}</small></Link>)}</section>
    <div className="ops-grid"><section className="ops-panel"><div className="ops-panel-head"><div><h2>近期訂單</h2><p>最新建立的五筆訂單</p></div><Link href="/ops/orders">查看全部</Link></div><div className="ops-compact-list">{orders.slice(0, 5).map((order) => <Link href="/ops/orders" key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.customerName}</span></div><div><strong>{formatMoney(order.totalMinor)}</strong><span>{formatDate(order.createdAt)}</span></div></Link>)}</div></section><section className="ops-panel"><div className="ops-panel-head"><div><h2>需要跟進</h2><p>今日工作佇列</p></div></div><div className="ops-attention"><Link href="/ops/inventory"><strong>{lowStock.length}</strong><span>低庫存 SKU</span></Link><Link href="/ops/appointments"><strong>{pending.length}</strong><span>開放預約</span></Link></div></section></div>
  </>;
}
