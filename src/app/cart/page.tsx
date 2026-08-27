import { CartClient } from "@/components/cart-client";
import { getLocale } from "@/lib/i18n";
export default async function CartPage() { const locale = await getLocale(); return <main id="main" className="page-shell"><CartClient locale={locale} /></main>; }
