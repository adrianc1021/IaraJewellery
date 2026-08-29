import { CheckoutForm } from "@/components/checkout-form";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() { const [methods, locale] = await Promise.all([db.paymentMethodSetting.findMany({ where: { enabled: true, code: { in: ["FPS", "PAYME", "ALIPAY"] } }, orderBy: { sortOrder: "asc" }, select: { code: true, nameZh: true, nameEn: true, instructionsZh: true, instructionsEn: true } }), getLocale()]); const en = locale === "en"; return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">SECURE CHECKOUT</p><h1>{en ? "Secure checkout" : "安全結帳"}</h1><p>{en ? "Contact, delivery and payment. Every price and stock level is verified securely." : "聯絡資料、配送方式與付款。所有價格及庫存均由伺服器重新驗證。"}</p></header><div className="form-shell wide"><CheckoutForm methods={methods} locale={locale} /></div></main>; }
