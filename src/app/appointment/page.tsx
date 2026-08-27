import { db } from "@/lib/db";
import { AppointmentForm } from "@/components/appointment-form";
import { getLocale } from "@/lib/i18n";
export default async function AppointmentPage() { const [stores, locale] = await Promise.all([db.store.findMany({ where: { active: true } }), getLocale()]); const en = locale === "en"; return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">PRIVATE APPOINTMENT</p><h1>{en ? "Book a private appointment" : "預約私人鑑賞"}</h1><p>{en ? "Tell us what you are looking for. An Iara jewellery advisor will contact you within one business day." : "告訴我們你的喜好，Iara 珠寶顧問將於一個工作天內與你聯絡。"}</p></header><div className="form-shell wide"><AppointmentForm stores={stores} locale={locale} /></div></main>; }
