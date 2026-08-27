import Image from "next/image";
import Link from "next/link";
import { Gem, MapPin, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const products = await db.product.findMany({ where: { status: "ACTIVE", featured: true }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 4 });
  return <main id="main" className="page-shell">
    <section className="hero"><Image src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=2200&q=90" alt="佩戴 Iara 吊墜的女性" fill priority sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">THE TIDE OF LIGHT · 2026</p><h1>光，在此停留</h1><p>以海的流動姿態，凝住每一道屬於你的光。</p><div className="hero-actions"><Link className="button button-light" href="/shop?collection=LUMEA">探索全新系列</Link><Link className="button button-secondary" href="/appointment">預約鑑賞</Link></div></div></section>
    <section className="home-intro"><p className="eyebrow">IARA SIGNATURE</p><h2>為日常，收藏一束光</h2><p>Iara 源自對水與光的想像。每件作品以細膩曲線承托寶石，讓珍貴不只留在重要時刻，也自然融入每一天。</p><Link className="text-link" href="/shop">探索所有珠寶 →</Link></section>
    <section className="category-strip" aria-label="按分類選購">{[["戒指","photo-1605100804763-247f67b3557e"],["項鏈","photo-1599643478518-a784e5dc4c8f"],["耳環","photo-1535632066927-ab7c9ab60908"],["手鏈","photo-1611591437281-460bfbe1220a"]].map(([category, photo]) => <Link key={category} href={`/shop?category=${category}`}><Image src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=86`} alt={`${category}系列`} fill sizes="(max-width: 680px) 50vw, 25vw" /><span>{category}</span></Link>)}</section>
    <section className="section"><div className="section-heading"><div><p className="eyebrow">NEW ARRIVALS</p><h2>本季新作</h2></div><Link className="text-link" href="/shop?sort=newest">選購所有新品 →</Link></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="editorial-band" id="story"><div style={{position:"relative"}}><Image src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1400&q=88" alt="珠寶工房工藝細節" fill sizes="60vw" /></div><div className="editorial-copy"><p className="eyebrow">THE ART OF IARA</p><h2>讓工藝，成為可感受的溫度</h2><p>從寶石甄選、手工鑲嵌到最後拋光，每件作品都在香港工房細緻完成，讓光線、弧度與肌膚恰好相遇。</p><Link className="button button-light" href="/journal">閱讀工藝故事</Link></div></section>
    <section className="service-band"><div className="service-item"><Gem size={26} /><h3>私人珠寶顧問</h3><p>由選石、尺寸到送禮建議，提供一對一服務。</p><Link className="text-link" href="/appointment">預約鑑賞 →</Link></div><div className="service-item"><MapPin size={26} /><h3>中環工作室</h3><p>親身感受寶石光澤與佩戴比例。</p><Link className="text-link" href="/appointment">查看門市 →</Link></div><div className="service-item"><ShieldCheck size={26} /><h3>安心選購</h3><p>香港免費配送，網上訂單享 14 天退換保障。</p><Link className="text-link" href="/faq">了解更多 →</Link></div></section>
  </main>;
}
