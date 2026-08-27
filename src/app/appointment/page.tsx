import { db } from "@/lib/db";
import { AppointmentForm } from "@/components/appointment-form";
export default async function AppointmentPage() { const stores = await db.store.findMany({ where: { active: true } }); return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">PRIVATE APPOINTMENT</p><h1>預約私人鑑賞</h1><p>告訴我們你的喜好，Iara 珠寶顧問將於一個工作天內與你聯絡。</p></header><div className="form-shell wide"><AppointmentForm stores={stores} /></div></main>; }
