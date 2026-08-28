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
  { title: "日常佩戴", titleEn: "Everyday jewellery", eyebrow: "EVERYDAY", href: "/shop?collection=LUMEA", image: "photo-1617038260897-41a1f14a8ca0" },
  { title: "送禮臻選", titleEn: "Gifts with meaning", eyebrow: "GIFT EDIT", href: "/shop?sort=newest", image: "photo-1515562141207-7a88fb7ce338" },
  { title: "婚嫁珠寶", titleEn: "Bridal jewellery", eyebrow: "ARIA BRIDAL", href: "/shop?collection=ARIA+BRIDAL", image: "photo-1605100804763-247f67b3557e" }
];

const discoveryLinks = [
  { labelZh: "瀏覽所有珠寶", labelEn: "Shop all jewellery", detailZh: "戒指、項鏈、耳環及手鏈", detailEn: "Rings, necklaces, earrings and bracelets", href: "/shop" },
  { labelZh: "查看本季新作", labelEn: "View new arrivals", detailZh: "最新設計與限量作品", detailEn: "New designs and limited pieces", href: "/shop?sort=newest" },
  { labelZh: "探索婚嫁珠寶", labelEn: "Explore bridal", detailZh: "訂婚戒指與紀念作品", detailEn: "Engagement and milestone pieces", href: "/shop?collection=ARIA+BRIDAL" },
  { labelZh: "預約私人鑑賞", labelEn: "Book a private viewing", detailZh: "一對一選石、尺寸及送禮建議", detailEn: "One-to-one stone, sizing and gift advice", href: "/appointment" }
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
    <section className="hero"><Image src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=2200&q=90" alt={en ? "Woman wearing an Iara pendant" : "佩戴 Iara 吊墜的女性"} fill priority sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">THE TIDE OF LIGHT · 2026</p><h1>{en ? "Where light lingers" : "光，在此停留"}</h1><p>{en ? "Fluid forms hold every light that belongs to you." : "以海的流動姿態，凝住每一道屬於你的光。"}</p><div className="hero-actions"><Link className="button button-light" href="/shop?collection=LUMEA">{en ? "Shop the collection" : "選購全新系列"}<ArrowRight size={15} /></Link><Link className="hero-secondary-link" href="/appointment">{en ? "Book a private viewing" : "預約私人鑑賞"}</Link></div></div></section>
    <section className="home-discovery"><div className="home-discovery-intro"><span>IARA JEWELLERY</span><h2>{en ? "Fine jewellery, made personal" : "從一件珠寶，開始你的選擇"}</h2><p>{en ? "Designed in Hong Kong for everyday wear, meaningful gifts and the moments worth remembering." : "香港設計的高級珠寶，為日常佩戴、珍貴送禮與值得記住的時刻而作。"}</p></div><nav className="home-discovery-links" aria-label={en ? "Start exploring" : "開始探索"}>{discoveryLinks.map((item) => <Link href={item.href} key={item.href}><span><strong>{en ? item.labelEn : item.labelZh}</strong><small>{en ? item.detailEn : item.detailZh}</small></span><ArrowRight size={17} /></Link>)}</nav></section>
    {products[0] && <section className="signature-piece"><div className="signature-piece-image"><Image src={JSON.parse(products[0].imagesJson)[0]} alt={en ? products[0].nameEn : products[0].nameZh} fill sizes="(max-width: 680px) 100vw, 55vw" /></div><div className="signature-piece-copy reveal-item"><p className="eyebrow">SIGNATURE PIECE</p><h2>{en ? products[0].nameEn : products[0].nameZh}</h2><p className="signature-material">{products[0].material} · {products[0].isNaturalDiamond ? (en ? "Natural diamond" : "天然鑽石") : products[0].gemstone}</p><p>{en ? products[0].descriptionEn : "以流動曲線承托一道光，將海面晨光凝聚成可每日佩戴的作品。"}</p><strong className="signature-price">{formatMoney(products[0].variants[0]?.priceMinor || 0)}</strong><div className="signature-actions"><Link className="button button-primary" href={`/product/${products[0].slug}`}>{en ? "View piece details" : "查看作品詳情"}<ArrowRight size={14} /></Link><Link className="text-link" href="/appointment">{en ? "Arrange a private viewing" : "預約私人鑑賞"}</Link></div></div></section>}
    <section className="category-chapter"><header className="category-chapter-heading reveal-item"><p className="eyebrow">DISCOVER IARA</p><h2>{en ? "Explore the world of jewellery" : "探索珠寶世界"}</h2><p>{en ? "Across different silhouettes and materials, find the light that belongs to you." : "從不同輪廓與材質之間，尋找屬於你的光。"}</p></header><div className="category-strip" aria-label={en ? "Shop by category" : "按分類選購"}>{categories.map((category) => <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.nameZh)}`}><span className="category-image"><Image src={category.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=86"} alt={en ? category.nameEn : `${category.nameZh}系列`} fill sizes="(max-width: 680px) 50vw, 25vw" /></span><span className="category-label"><small>{category.nameEn.toUpperCase()}</small>{en ? category.nameEn : category.nameZh}</span></Link>)}</div></section>
    <section className="section" id="new-arrivals"><div className="section-heading reveal-item"><div><p className="eyebrow">NEW ARRIVALS</p><h2>{en ? "New this season" : "本季新作"}</h2><p>{en ? "New silhouettes and Iara signatures, selected for this moment." : "從全新輪廓到標誌系列，細選當季值得珍藏的作品。"}</p></div><Link className="text-link" href="/shop?sort=newest">{en ? "Shop all new arrivals" : "選購所有新品"} <ArrowRight size={13} /></Link></div><div className="product-grid home-new-grid">{products.slice(1).map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></section>
    <section className="curation-section"><div className="curation-heading reveal-item"><p className="eyebrow">JEWELLERY FOR YOUR MOMENT</p><h2>{en ? "Choose by occasion" : "依你的時刻選擇"}</h2><p>{en ? "Begin with how you want to wear it, or who you are choosing it for." : "從佩戴方式與送禮心意出發，更快找到合適作品。"}</p></div><div className="curation-grid">{curated.map((item) => <Link href={item.href} key={item.title}><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1400&q=88`} alt={en ? item.titleEn : item.title} fill sizes="(max-width: 680px) 100vw, 58vw" /><span><small>{item.eyebrow}</small><strong>{en ? item.titleEn : item.title}</strong><em>{en ? "Shop the edit" : "選購精選"} <ArrowRight size={14} /></em></span></Link>)}</div></section>
    <section className="pet-home-band"><div className="pet-home-image"><Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1500&q=88" alt={en ? "Dog wearing an Iara pet piece" : "佩戴 Iara 寵物飾品的狗狗"} fill sizes="55vw" /></div><div className="pet-home-copy reveal-item"><p className="eyebrow">IARA PET ATELIER</p><h2>{en ? "A signature for every companion" : "留下專屬印記"}</h2><p>{en ? "Precious materials and considered craft create a keepsake for every journey shared." : "以貴金屬與細緻工藝，為每一段同行留下值得珍藏的記號。"}</p><p className="pet-service-points">{en ? "Personal engraving · Rounded edges · Atelier quality check" : "專屬刻字 · 圓潤邊緣 · 工房品質檢查"}</p><Link className="button button-primary" href="/pets">{en ? "Discover pet jewellery" : "探索寵物系列"}</Link></div></section>
    <section className="pet-craft-transition reveal-item"><span /><p>{en ? <>Every personal mark is shaped<br />by hands, care and time.</> : <>每一道專屬印記，<br />皆由雙手與時間細緻成形。</>}</p></section>
    <section className="editorial-band" id="story"><div className="editorial-copy reveal-item"><p className="eyebrow">THE ART OF IARA</p><h2>{en ? <>Craft you can<br />feel</> : <>讓工藝，成為<br />可感受的溫度</>}</h2><p>{en ? "From stone selection and hand setting to the final polish, every piece is carefully inspected in our Hong Kong atelier." : "從寶石甄選、手工鑲嵌到最後拋光，每一件作品皆在香港工房經過細緻檢查，讓光線、弧度與肌膚恰好相遇。"}</p><div className="craft-proof"><span>{en ? "Stone selection" : "寶石甄選"}</span><span>{en ? "Hand setting" : "手工鑲嵌"}</span><span>{en ? "Final inspection" : "最終品質檢查"}</span></div><Link className="text-link" href="/journal">{en ? "See how each piece is made" : "了解每件作品如何製作"} <ArrowRight size={13} /></Link></div><div className="editorial-image"><Image src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=1600&q=88" alt={en ? "Jeweller working by hand in an atelier" : "珠寶工匠在工房以手工製作"} fill sizes="55vw" /></div></section>
    <section className="service-band"><div className="service-intro"><p className="eyebrow">THE IARA EXPERIENCE</p><h2>{en ? "Personal service, before and after your purchase" : "選購前後，都有專人照顧"}</h2><p>{en ? "Speak with our team for sizing, gifting, delivery or aftercare advice." : "由尺寸、送禮、配送到售後保養，Iara 團隊會按你的需要提供協助。"}</p></div><div className="service-list"><Link href="/appointment"><Gem size={22} /><span><strong>{en ? "Book a private consultation" : "預約私人珠寶顧問"}</strong><small>{en ? "Stone, sizing and gift guidance" : "選石、尺寸及送禮建議"}</small></span><ArrowRight size={17} /></Link><Link href="/appointment"><MapPin size={22} /><span><strong>{en ? "Visit our Central atelier" : "到訪中環工作室"}</strong><small>{en ? "See proportion and detail in person" : "親身比較佩戴比例與細節"}</small></span><ArrowRight size={17} /></Link><Link href="/faq"><ShieldCheck size={22} /><span><strong>{en ? "Delivery, returns and aftercare" : "配送、退換及售後保養"}</strong><small>{en ? "Complimentary Hong Kong delivery and 14-day returns" : "香港免費配送及 14 天退換保障"}</small></span><ArrowRight size={17} /></Link></div></section>
  </main>;
}
