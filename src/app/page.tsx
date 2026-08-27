import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, MapPin, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { getSiteLayout } from "@/lib/site-layout";

type HomeStyle = CSSProperties & Record<`--home-${string}`, string | number>;

const categories = [
  ["戒指", "RINGS", "photo-1605100804763-247f67b3557e"],
  ["項鏈", "NECKLACES", "photo-1599643478518-a784e5dc4c8f"],
  ["耳環", "EARRINGS", "photo-1535632066927-ab7c9ab60908"],
  ["手鏈", "BRACELETS", "photo-1611591437281-460bfbe1220a"]
];

const curated = [
  { title: "日常微光", eyebrow: "EVERYDAY SIGNATURES", href: "/shop?collection=LUMEA", image: "photo-1617038260897-41a1f14a8ca0" },
  { title: "重要時刻", eyebrow: "MARK THE MOMENT", href: "/shop?sort=newest", image: "photo-1515562141207-7a88fb7ce338" },
  { title: "婚嫁臻選", eyebrow: "ARIA BRIDAL", href: "/shop?collection=ARIA+BRIDAL", image: "photo-1605100804763-247f67b3557e" }
];

export default async function HomePage() {
  const [products, layout] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", featured: true }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 5 }),
    getSiteLayout()
  ]);
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
    <section className="hero"><Image src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=2200&q=90" alt="佩戴 Iara 吊墜的女性" fill priority sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">THE TIDE OF LIGHT · 2026</p><h1>光，在此停留</h1><p>以海的流動姿態，凝住每一道屬於你的光。</p><div className="hero-actions"><Link className="button button-light" href="/shop?collection=LUMEA">探索全新系列</Link><Link className="button button-secondary" href="/appointment">預約鑑賞</Link></div></div><Link className="hero-scroll" href="#new-arrivals">SCROLL <span /></Link></section>
    <section className="home-intro"><p className="eyebrow">IARA SIGNATURE</p><h2>為日常，收藏一束光</h2><p>Iara 源自對水與光的想像。每件作品以細膩曲線承托寶石，讓珍貴不只留在重要時刻，也自然融入每一天。</p><Link className="text-link" href="/shop">探索所有珠寶 <ArrowRight size={13} /></Link></section>
    <section className="category-strip" aria-label="按分類選購">{categories.map(([category, english, photo]) => <Link key={category} href={`/shop?category=${category}`}><Image src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=86`} alt={`${category}系列`} fill sizes="(max-width: 680px) 50vw, 25vw" /><span><small>{english}</small>{category}</span></Link>)}</section>
    <section className="section" id="new-arrivals"><div className="section-heading"><div><p className="eyebrow">NEW ARRIVALS</p><h2>本季新作</h2><p>從全新輪廓到標誌系列，細選當季值得珍藏的作品。</p></div><Link className="text-link" href="/shop?sort=newest">選購所有新品 <ArrowRight size={13} /></Link></div><div className="product-grid home-new-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="curation-section"><div className="curation-heading"><p className="eyebrow">CURATED BY IARA</p><h2>從此刻，找到你的光</h2></div><div className="curation-grid">{curated.map((item) => <Link href={item.href} key={item.title}><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1200&q=88`} alt={item.title} fill sizes="(max-width: 680px) 100vw, 33vw" /><span><small>{item.eyebrow}</small><strong>{item.title}</strong><em>探索系列 <ArrowRight size={14} /></em></span></Link>)}</div></section>
    <section className="editorial-band" id="story"><div className="editorial-image"><Image src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1400&q=88" alt="珠寶工房工藝細節" fill sizes="60vw" /></div><div className="editorial-copy"><p className="eyebrow">THE ART OF IARA</p><h2>讓工藝，成為可感受的溫度</h2><p>從寶石甄選、手工鑲嵌到最後拋光，每件作品都在香港工房細緻完成，讓光線、弧度與肌膚恰好相遇。</p><Link className="button button-light" href="/journal">閱讀工藝故事</Link></div></section>
    <section className="service-band"><div className="service-item"><Gem size={26} /><h3>私人珠寶顧問</h3><p>由選石、尺寸到送禮建議，提供一對一服務。</p><Link className="text-link" href="/appointment">預約鑑賞 <ArrowRight size={13} /></Link></div><div className="service-item"><MapPin size={26} /><h3>中環工作室</h3><p>親身感受寶石光澤與佩戴比例。</p><Link className="text-link" href="/appointment">查看門市 <ArrowRight size={13} /></Link></div><div className="service-item"><ShieldCheck size={26} /><h3>安心選購</h3><p>香港免費配送，網上訂單享 14 天退換保障。</p><Link className="text-link" href="/faq">了解更多 <ArrowRight size={13} /></Link></div></section>
  </main>;
}
