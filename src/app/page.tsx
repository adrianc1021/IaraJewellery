import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, MapPin, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { getSiteLayout } from "@/lib/site-layout";
import { getLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type HomeStyle = CSSProperties & Record<`--home-${string}`, string | number>;

const curated = [
  { title: "日常微光", eyebrow: "EVERYDAY SIGNATURES", href: "/shop?collection=LUMEA", image: "photo-1617038260897-41a1f14a8ca0" },
  { title: "重要時刻", eyebrow: "MARK THE MOMENT", href: "/shop?sort=newest", image: "photo-1515562141207-7a88fb7ce338" },
  { title: "婚嫁臻選", eyebrow: "ARIA BRIDAL", href: "/shop?collection=ARIA+BRIDAL", image: "photo-1605100804763-247f67b3557e" }
];

export default async function HomePage() {
  const [products, layout, categories, locale] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", featured: true, audience: "PEOPLE" }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 5 }),
    getSiteLayout(),
    db.catalogGroup.findMany({ where: { kind: "CATEGORY", active: true, featured: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    getLocale()
  ]);
  const en = locale === "en";
  const style: HomeStyle = {
    "--home-hero-height": `${layout.heroHeight}px`,
    "--home-category-height": `${layout.categoryTileHeight}px`,
    "--home-section-space": `${layout.sectionSpacing}px`,
    "--home-new-columns": layout.newArrivalsColumns,
    "--home-product-ratio": layout.productImageRatio,
    "--home-editorial-height": `${layout.editorialHeight}px`,
    "--home-curation-height": `${layout.curationTileHeight}px`
  };

  return <main id="main" className="page-shell homepage-layout" style={style}>
    <section className="hero"><Image src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=2200&q=90" alt={en ? "Woman wearing an Iara pendant" : "佩戴 Iara 吊墜的女性"} fill priority sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">THE TIDE OF LIGHT · 2026</p><h1>{en ? "Where light lingers" : "光，在此停留"}</h1><p>{en ? "Fluid forms hold every light that belongs to you." : "以海的流動姿態，凝住每一道屬於你的光。"}</p><div className="hero-actions"><Link className="button button-light" href="/shop?collection=LUMEA">{en ? "Discover the collection" : "探索全新系列"}</Link><Link className="button button-secondary" href="/appointment">{en ? "Book an appointment" : "預約鑑賞"}</Link></div></div><Link className="hero-scroll" href="#new-arrivals">SCROLL <span /></Link></section>
    <section className="home-intro reveal-item"><p className="eyebrow">IARA SIGNATURE</p><h2>{en ? "A light to live with" : "為日常，收藏一束光"}</h2><p>{en ? "Born from the movement of water and light, each Iara piece brings precious materials naturally into the everyday." : "Iara 源自對水與光的想像。每件作品以細膩曲線承托寶石，讓珍貴不只留在重要時刻，也自然融入每一天。"}</p><Link className="text-link" href="/shop">{en ? "Explore all jewellery" : "探索所有珠寶"} <ArrowRight size={13} /></Link></section>
    {products[0] && <section className="signature-piece"><div className="signature-piece-image"><Image src={JSON.parse(products[0].imagesJson)[0]} alt={en ? products[0].nameEn : products[0].nameZh} fill sizes="(max-width: 680px) 100vw, 55vw" /></div><div className="signature-piece-copy reveal-item"><p className="eyebrow">SIGNATURE PIECE</p><h2>{en ? products[0].nameEn : products[0].nameZh}</h2><p className="signature-material">{products[0].material} · {products[0].isNaturalDiamond ? (en ? "Natural diamond" : "天然鑽石") : products[0].gemstone}</p><p>{en ? products[0].descriptionEn : "以流動曲線承托一道光，將海面晨光凝聚成可每日佩戴的作品。"}</p><strong className="signature-price">{formatMoney(products[0].variants[0]?.priceMinor || 0)}</strong><Link className="text-link" href={`/product/${products[0].slug}`}>{en ? "Discover this piece" : "探索作品"} <ArrowRight size={13} /></Link></div></section>}
    <section className="category-chapter"><header className="category-chapter-heading reveal-item"><p className="eyebrow">DISCOVER IARA</p><h2>{en ? "Explore the world of jewellery" : "探索珠寶世界"}</h2><p>{en ? "Across different silhouettes and materials, find the light that belongs to you." : "從不同輪廓與材質之間，尋找屬於你的光。"}</p></header><div className="category-strip" aria-label={en ? "Shop by category" : "按分類選購"}>{categories.map((category) => <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.nameZh)}`}><span className="category-image"><Image src={category.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=86"} alt={en ? category.nameEn : `${category.nameZh}系列`} fill sizes="(max-width: 680px) 50vw, 25vw" /></span><span className="category-label"><small>{category.nameEn.toUpperCase()}</small>{en ? category.nameEn : category.nameZh}</span></Link>)}</div></section>
    <section className="section" id="new-arrivals"><div className="section-heading reveal-item"><div><p className="eyebrow">NEW ARRIVALS</p><h2>{en ? "New this season" : "本季新作"}</h2><p>{en ? "New silhouettes and Iara signatures, selected for this moment." : "從全新輪廓到標誌系列，細選當季值得珍藏的作品。"}</p></div><Link className="text-link" href="/shop?sort=newest">{en ? "Shop all new arrivals" : "選購所有新品"} <ArrowRight size={13} /></Link></div><div className="product-grid home-new-grid">{products.slice(1).map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></section>
    <section className="curation-section"><div className="curation-heading reveal-item"><p className="eyebrow">CURATED BY IARA</p><h2>{en ? "Find your light" : "從此刻，找到你的光"}</h2></div><div className="curation-grid">{curated.map((item) => <Link className="reveal-item" href={item.href} key={item.title}><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1200&q=88`} alt={item.title} fill sizes="(max-width: 680px) 100vw, 33vw" /><span><small>{item.eyebrow}</small><strong>{en ? ({ "日常微光": "Everyday signatures", "重要時刻": "Mark the moment", "婚嫁臻選": "Bridal selection" }[item.title]) : item.title}</strong><em>{en ? "Explore" : "探索系列"} <ArrowRight size={14} /></em></span></Link>)}</div></section>
    <section className="pet-home-band"><div className="pet-home-image"><Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1500&q=88" alt={en ? "Dog wearing an Iara pet piece" : "佩戴 Iara 寵物飾品的狗狗"} fill sizes="55vw" /></div><div className="pet-home-copy reveal-item"><p className="eyebrow">IARA PET ATELIER</p><h2>{en ? "A signature for every companion" : "留下專屬印記"}</h2><p>{en ? "Precious materials and considered craft create a keepsake for every journey shared." : "以貴金屬與細緻工藝，為每一段同行留下值得珍藏的記號。"}</p><p className="pet-service-points">{en ? "Personal engraving · Rounded edges · Atelier quality check" : "專屬刻字 · 圓潤邊緣 · 工房品質檢查"}</p><Link className="button button-primary" href="/pets">{en ? "Discover pet jewellery" : "探索寵物系列"}</Link></div></section>
    <section className="pet-craft-transition reveal-item"><span /><p>{en ? <>Every personal mark is shaped<br />by hands, care and time.</> : <>每一道專屬印記，<br />皆由雙手與時間細緻成形。</>}</p></section>
    <section className="editorial-band" id="story"><div className="editorial-copy reveal-item"><p className="eyebrow">THE ART OF IARA</p><h2>{en ? <>Craft you can<br />feel</> : <>讓工藝，成為<br />可感受的溫度</>}</h2><p>{en ? "From stone selection and hand setting to the final polish, every piece is carefully inspected in our Hong Kong atelier." : "從寶石甄選、手工鑲嵌到最後拋光，每一件作品皆在香港工房經過細緻檢查，讓光線、弧度與肌膚恰好相遇。"}</p><div className="craft-proof"><span><strong>01</strong>{en ? "Stone selection" : "寶石甄選"}</span><span><strong>02</strong>{en ? "Hand setting" : "手工鑲嵌"}</span><span><strong>03</strong>{en ? "Final polish" : "最後拋光"}</span></div><Link className="text-link" href="/journal">{en ? "Read our craft story" : "閱讀工藝故事"} <ArrowRight size={13} /></Link></div><div className="editorial-image"><Image src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=1600&q=88" alt={en ? "Jeweller working by hand in an atelier" : "珠寶工匠在工房以手工製作"} fill sizes="55vw" /></div></section>
    <section className="service-band"><div className="service-item reveal-item"><Gem size={26} /><h3>{en ? "Private consultation" : "私人珠寶顧問"}</h3><p>{en ? "One-to-one guidance on stones, sizing and gifts." : "由選石、尺寸到送禮建議，提供一對一服務。"}</p><Link className="text-link" href="/appointment">{en ? "Book now" : "預約鑑賞"} <ArrowRight size={13} /></Link></div><div className="service-item reveal-item"><MapPin size={26} /><h3>{en ? "Central atelier" : "中環工作室"}</h3><p>{en ? "Experience the light and proportion of each piece in person." : "親身感受寶石光澤與佩戴比例。"}</p><Link className="text-link" href="/appointment">{en ? "Visit us" : "查看門市"} <ArrowRight size={13} /></Link></div><div className="service-item reveal-item"><ShieldCheck size={26} /><h3>{en ? "Shop with confidence" : "安心選購"}</h3><p>{en ? "Complimentary Hong Kong delivery and 14-day returns." : "香港免費配送，網上訂單享 14 天退換保障。"}</p><Link className="text-link" href="/faq">{en ? "Learn more" : "了解更多"} <ArrowRight size={13} /></Link></div></section>
  </main>;
}
