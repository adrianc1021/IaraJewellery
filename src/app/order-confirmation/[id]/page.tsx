import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";
export default async function OrderConfirmationPage({ params }: { params: Promise<{id:string}> }) { const { id } = await params; const order = await db.order.findUnique({ where: { id }, include: { items: true } }); if (!order) notFound(); return <main id="main" className="form-shell wide"><p className="eyebrow">ORDER STATUS</p><h1>{order.orderNumber}</h1><p><StatusPill value={order.orderStatus} /></p><p>{order.paymentStatus === "PAID" ? "付款已確認。" : "訂單仍待付款，不會安排出貨或扣減正式庫存。"}</p><div className="data-table-wrap"><table className="data-table"><thead><tr><th>作品</th><th>尺寸</th><th>數量</th><th>金額</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.optionName}</td><td>{item.quantity}</td><td>{formatMoney(item.lineTotalMinor)}</td></tr>)}</tbody></table></div><p style={{marginTop:20,fontWeight:700}}>總額：{formatMoney(order.totalMinor)}</p><Link className="button button-primary" href="/account">前往會員中心</Link></main>; }
