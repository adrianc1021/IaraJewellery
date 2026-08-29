import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AppointmentForm } from "@/components/appointment-form";
import { getLocale } from "@/lib/i18n";
export const metadata: Metadata = { title: "預約私人珠寶鑑賞", description: "預約 Iara Jewellery 香港私人珠寶鑑賞，獲取選石、尺寸、送禮及訂製建議。", alternates: { canonical: "/appointment" }, openGraph: { title: "預約私人珠寶鑑賞 | Iara Jewellery", description: "一對一珠寶顧問服務。", url: "/appointment", type: "website" } };
export default async function AppointmentPage() { const [stores, locale] = await Promise.all([db.store.findMany({ where: { active: true } }), getLocale()]); const en = locale === "en"; return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">PRIVATE APPOINTMENT</p><h1>{en ? "Book a private appointment" : "預約私人鑑賞"}</h1><p>{en ? "Tell us what you are looking for. An Iara jewellery advisor will contact you within one business day." : "告訴我們你的喜好，Iara 珠寶顧問將於一個工作天內與你聯絡。"}</p></header><div className="form-shell wide"><AppointmentForm stores={stores} locale={locale} /></div></main>; }
