import { CartClient } from "@/components/cart-client";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export default async function CartPage() {
  const [locale, paymentMethods] = await Promise.all([
    getLocale(),
    db.paymentMethodSetting.findMany({ where: { enabled: true, code: { in: ["FPS", "PAYME", "ALIPAY"] } }, orderBy: { sortOrder: "asc" }, select: { code: true, nameZh: true, nameEn: true } })
  ]);
  return <main id="main" className="page-shell cart-page"><CartClient locale={locale} paymentMethods={paymentMethods} /></main>;
}
