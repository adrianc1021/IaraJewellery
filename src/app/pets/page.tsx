import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "寵物印記訂製珠寶", description: "探索 Iara 以毛孩真實肉球或鼻紋轉化而成、由主人佩戴的香港訂製珠寶與紀念作品。", alternates: { canonical: "/pets" }, openGraph: { title: "寵物印記訂製珠寶 | Iara Jewellery", description: "把毛孩獨一無二的真實印記，轉化成主人每天可以佩戴的珠寶。", url: "/pets", type: "website" } };

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const [products, locale] = await Promise.all([db.product.findMany({ where: { status: "ACTIVE", audience: "PET" }, include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } }), getLocale()]);
  const en = locale === "en";
  return <main id="main" className="page-shell pet-page"><section className="pet-hero"><Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=2200&q=90" alt={en ? "Iara pet jewellery" : "Iara 寵物飾品"} fill priority sizes="100vw" /><div className="pet-hero-overlay" /><div><p className="eyebrow">IARA PET ATELIER</p><h1>{en ? "Made for every companion" : "為每一位同行的伙伴"}</h1><p>{en ? "Precious keepsakes designed with comfort, character and everyday life in mind." : "以舒適、個性與日常相伴為出發點，打造值得長久珍藏的寵物飾品。"}</p><Link className="button button-light" href="#pet-collection">{en ? "Explore the collection" : "探索系列"}<ArrowRight size={15} /></Link></div></section><section className="pet-values"><div><Heart size={22} /><h2>{en ? "Comfort first" : "舒適優先"}</h2><p>{en ? "Rounded edges and considered proportions for everyday wear." : "圓潤邊緣與合適比例，讓日常佩戴更自在。"}</p></div><div><Sparkles size={22} /><h2>{en ? "Personal engraving" : "專屬刻字"}</h2><p>{en ? "Add a name or meaningful date to selected pieces." : "指定款式可刻上名字或值得紀念的日期。"}</p></div><div><ShieldCheck size={22} /><h2>{en ? "Atelier checked" : "工房品質檢查"}</h2><p>{en ? "Each clasp, setting and surface is inspected before delivery." : "每件作品出貨前均檢查扣件、鑲嵌與表面細節。"}</p></div></section><section className="section" id="pet-collection"><div className="section-heading"><div><p className="eyebrow">THE PET COLLECTION</p><h2>{en ? "Small pieces, lasting bonds" : "小小飾品，收藏長久陪伴"}</h2></div></div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard product={product} locale={locale} key={product.id} />)}</div> : <div className="empty-state"><h2>{en ? "New pieces are arriving soon" : "新作即將登場"}</h2></div>}</section></main>;
}
