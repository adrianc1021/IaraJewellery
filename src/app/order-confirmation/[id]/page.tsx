/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";
import { getLocale } from "@/lib/i18n";

const paymentNames: Record<string, { zh: string; en: string }> = {
  CREDIT_CARD: { zh: "信用卡", en: "Credit card" },
  APPLE_PAY: { zh: "Apple Pay", en: "Apple Pay" },
  CASH: { zh: "現金", en: "Cash" },
  PAYME: { zh: "PayMe", en: "PayMe" },
  FPS: { zh: "轉數快 FPS", en: "FPS" },
  ALIPAY: { zh: "AlipayHK", en: "AlipayHK" },
  WECHAT_PAY: { zh: "WeChat Pay HK", en: "WeChat Pay HK" },
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const paymentDetails = await db.paymentMethodSetting.findUnique({ where: { code: order.paymentMethod }, select: { instructionsZh: true, instructionsEn: true, accountReference: true, qrCodeUrl: true } });
  const en = locale === "en";
  const paymentName = paymentNames[order.paymentMethod]?.[en ? "en" : "zh"] || order.paymentMethod.replaceAll("_", " ");
  return <main id="main" className="form-shell wide"><p className="eyebrow">ORDER STATUS</p><h1>{order.orderNumber}</h1><p><StatusPill value={order.orderStatus} /></p><p>{order.paymentStatus === "PAID" ? (en ? "Payment confirmed." : "付款已確認。") : (en ? "Payment is still pending. Your order will not be dispatched until payment is confirmed." : "訂單仍待付款，確認付款前不會安排出貨。")}</p><p className="muted">{en ? "Payment method" : "付款方式"}: {paymentName}</p>{order.paymentStatus !== "PAID" && paymentDetails && <section className="manual-payment-instructions"><h2>{en ? "Complete your payment" : "完成付款"}</h2><p>{en ? paymentDetails.instructionsEn : paymentDetails.instructionsZh}</p>{paymentDetails.accountReference && <p><strong>{en ? "FPS reference" : "FPS 收款號碼"}</strong><br />{paymentDetails.accountReference}</p>}{paymentDetails.qrCodeUrl && <img src={paymentDetails.qrCodeUrl} alt={en ? "Payment QR Code" : "收款 QR Code"} />}</section>}<div className="data-table-wrap"><table className="data-table"><thead><tr><th>{en ? "Piece" : "作品"}</th><th>{en ? "Option" : "尺寸"}</th><th>{en ? "Quantity" : "數量"}</th><th>{en ? "Amount" : "金額"}</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.optionName}</td><td>{item.quantity}</td><td>{formatMoney(item.lineTotalMinor)}</td></tr>)}</tbody></table></div><p style={{ marginTop: 20, fontWeight: 700 }}>{en ? "Total" : "總額"}: {formatMoney(order.totalMinor)}</p><Link className="button button-primary" href="/account">{en ? "Go to my account" : "前往會員中心"}</Link></main>;
}
