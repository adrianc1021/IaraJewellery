import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, MapPin, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { getSiteLayout } from "@/lib/site-layout";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type HomeStyle = CSSProperties & Record<`--home-${string}`, string | number>;

const curated = [
  { title: "日常微光", eyebrow: "EVERYDAY SIGNATURES", href: "/shop?collection=LUMEA", image: "photo-1617038260897-41a1f14a8ca0" },
  { title: "重要時刻", eyebrow: "MARK THE MOMENT", href: "/shop?sort=newest", image: "photo-1515562141207-7a88fb7ce338" },
  { title: "婚嫁臻選", eyebrow: "ARIA BRIDAL", href: "/shop?collection=ARIA+BRIDAL", image: "photo-1605100804763-247f67b3557e" }
];

export default async function HomePage() {
  const [products, layout, categories, petProducts, locale] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", featured: true, audience: "PEOPLE" }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 5 }),
    getSiteLayout(),
    db.catalogGroup.findMany({ where: { kind: "CATEGORY", active: true, featured: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    db.product.findMany({ where: { status: "ACTIVE", audience: "PET" }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 2 }),
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
    {products[0] && <section className="signature-piece"><div className="signature-piece-image"><Image src={JSON.parse(products[0].imagesJson)[0]} alt={en ? products[0].nameEn : products[0].nameZh} fill sizes="(max-width: 680px) 100vw, 52vw" /></div><div className="signature-piece-copy reveal-item"><p className="eyebrow">SIGNATURE PIECE</p><h2>{en ? products[0].nameEn : products[0].nameZh}</h2><p>{en ? products[0].descriptionEn : products[0].descriptionZh}</p><Link className="text-link" href={`/product/${products[0].slug}`}>{en ? "Discover this piece" : "探索這件作品"} <ArrowRight size={13} /></Link></div></section>}
    <section className="category-strip" aria-label={en ? "Shop by category" : "按分類選購"}>{categories.map((category) => <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.nameZh)}`}><Image src={category.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=86"} alt={en ? category.nameEn : `${category.nameZh}系列`} fill sizes="(max-width: 680px) 50vw, 25vw" /><span><small>{category.nameEn.toUpperCase()}</small>{en ? category.nameEn : category.nameZh}</span></Link>)}</section>
    <section className="section" id="new-arrivals"><div className="section-heading reveal-item"><div><p className="eyebrow">NEW ARRIVALS</p><h2>{en ? "New this season" : "本季新作"}</h2><p>{en ? "New silhouettes and Iara signatures, selected for this moment." : "從全新輪廓到標誌系列，細選當季值得珍藏的作品。"}</p></div><Link className="text-link" href="/shop?sort=newest">{en ? "Shop all new arrivals" : "選購所有新品"} <ArrowRight size={13} /></Link></div><div className="product-grid home-new-grid">{products.slice(1).map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></section>
    <section className="curation-section"><div className="curation-heading reveal-item"><p className="eyebrow">CURATED BY IARA</p><h2>{en ? "Find your light" : "從此刻，找到你的光"}</h2></div><div className="curation-grid">{curated.map((item) => <Link className="reveal-item" href={item.href} key={item.title}><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1200&q=88`} alt={item.title} fill sizes="(max-width: 680px) 100vw, 33vw" /><span><small>{item.eyebrow}</small><strong>{en ? ({ "日常微光": "Everyday signatures", "重要時刻": "Mark the moment", "婚嫁臻選": "Bridal selection" }[item.title]) : item.title}</strong><em>{en ? "Explore" : "探索系列"} <ArrowRight size={14} /></em></span></Link>)}</div></section>
    <section className="pet-home-band"><div className="pet-home-image"><Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1500&q=88" alt={en ? "Dog wearing an Iara pet piece" : "佩戴 Iara 寵物飾品的狗狗"} fill sizes="60vw" /></div><div className="pet-home-copy reveal-item"><p className="eyebrow">IARA PET ATELIER</p><h2>{en ? "A signature for every companion" : "為最親密的伙伴，留下專屬印記"}</h2><p>{en ? "Precious tags and collar charms, softly finished for comfort and made to carry a name, a memory and a little light." : "以貴金屬與圓潤邊緣打造寵物名牌及頸圈吊飾，刻下名字，也收藏每天相伴的光。"}</p><div className="pet-home-products">{petProducts.map((product) => <span key={product.id}>{en ? product.nameEn : product.nameZh}</span>)}</div><Link className="button button-light" href="/pets">{en ? "Discover pet jewellery" : "探索寵物飾品"}</Link></div></section>
    <section className="editorial-band" id="story"><div className="editorial-image"><Image src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1400&q=88" alt={en ? "Jewellery atelier craftsmanship" : "珠寶工房工藝細節"} fill sizes="60vw" /></div><div className="editorial-copy reveal-item"><p className="eyebrow">THE ART OF IARA</p><h2>{en ? "Craft you can feel" : "讓工藝，成為可感受的溫度"}</h2><p>{en ? "From stone selection and setting to the final polish, every piece is completed with care in our Hong Kong atelier." : "從寶石甄選、手工鑲嵌到最後拋光，每件作品都在香港工房細緻完成，讓光線、弧度與肌膚恰好相遇。"}</p><div className="craft-proof"><span><strong>01</strong>{en ? "Stone selection" : "寶石甄選"}</span><span><strong>02</strong>{en ? "Hand setting" : "手工鑲嵌"}</span><span><strong>03</strong>{en ? "Final polish" : "最後拋光"}</span></div><Link className="button button-light" href="/journal">{en ? "Read our craft story" : "閱讀工藝故事"}</Link></div></section>
    <section className="service-band"><div className="service-item reveal-item"><Gem size={26} /><h3>{en ? "Private consultation" : "私人珠寶顧問"}</h3><p>{en ? "One-to-one guidance on stones, sizing and gifts." : "由選石、尺寸到送禮建議，提供一對一服務。"}</p><Link className="text-link" href="/appointment">{en ? "Book now" : "預約鑑賞"} <ArrowRight size={13} /></Link></div><div className="service-item reveal-item"><MapPin size={26} /><h3>{en ? "Central atelier" : "中環工作室"}</h3><p>{en ? "Experience the light and proportion of each piece in person." : "親身感受寶石光澤與佩戴比例。"}</p><Link className="text-link" href="/appointment">{en ? "Visit us" : "查看門市"} <ArrowRight size={13} /></Link></div><div className="service-item reveal-item"><ShieldCheck size={26} /><h3>{en ? "Shop with confidence" : "安心選購"}</h3><p>{en ? "Complimentary Hong Kong delivery and 14-day returns." : "香港免費配送，網上訂單享 14 天退換保障。"}</p><Link className="text-link" href="/faq">{en ? "Learn more" : "了解更多"} <ArrowRight size={13} /></Link></div></section>
  </main>;
}
