import Link from "next/link";
import { getLocale } from "@/lib/i18n";
export default async function NotFound() { const en = await getLocale() === "en"; return <main id="main" className="empty-state"><h1>{en ? "Page not found" : "找不到這一頁"}</h1><p>{en ? "This piece may have moved. Return to discover all jewellery." : "作品可能已移動，請返回瀏覽所有珠寶。"}</p><Link className="button button-primary" href="/shop">{en ? "Explore all jewellery" : "探索所有珠寶"}</Link></main>; }
