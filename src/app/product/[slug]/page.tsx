import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney, parseImages } from "@/lib/format";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";

type Params = Promise<{ slug: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { const { slug } = await params; const product = await db.product.findUnique({ where: { slug } }); return product ? { title: product.nameZh, description: product.descriptionZh } : { title: "找不到作品" }; }

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug, status: "ACTIVE" }, include: { variants: { orderBy: { priceMinor: "asc" } } } });
  if (!product) notFound();
  const images = parseImages(product.imagesJson);
  const related = await db.product.findMany({ where: { id: { not: product.id }, status: "ACTIVE", OR: [{ collection: product.collection }, { category: product.category }] }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 4 });
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.nameZh, image: images, description: product.descriptionZh, sku: product.variants[0]?.sku, offers: { "@type": "Offer", priceCurrency: "HKD", price: (product.variants[0]?.priceMinor || 0) / 100, availability: "https://schema.org/InStock" } };
  return <main id="main" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><div className="breadcrumb container"><Link href="/">首頁</Link><span>/</span><Link href="/shop">珠寶</Link><span>/</span><span>{product.nameZh}</span></div><section className="product-detail container"><div className="product-gallery"><div className="product-gallery-main"><Image src={images[0]} alt={product.nameZh} fill priority sizes="(max-width:680px) 100vw, 55vw" /></div></div><div className="product-info-panel"><p className="eyebrow">{product.collection}</p><h1>{product.nameZh}</h1><p className="product-price">{formatMoney(product.variants[0]?.priceMinor || 0)}</p><p className="muted">可享 3 期免息付款 · 香港免費配送</p><div className="fact-row"><span>{product.material}</span><span>{product.gemstone}</span></div><p className="product-description">{product.descriptionZh}</p><ProductPurchase productId={product.id} slug={product.slug} variants={product.variants} /><div className="detail-accordions"><details open><summary>作品細節</summary><p>{product.storyZh}</p></details><details><summary>工藝與保養</summary><p>佩戴後以柔軟乾布輕拭，避免接觸香水與化學品，並獨立存放。</p></details><details><summary>配送及退換</summary><p>香港免費配送。未經刻字或訂製作品可於收貨後 14 天內申請退換。</p></details></div></div></section><section className="section" style={{background:"var(--paper)"}}><div className="section-heading"><div><p className="eyebrow">YOU MAY ALSO LIKE</p><h2>相襯作品</h2></div><Link className="text-link" href="/shop">所有珠寶 →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section></main>;
}
