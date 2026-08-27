import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney, parseImages } from "@/lib/format";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";
import { getLocale } from "@/lib/i18n";

type Params = Promise<{ slug: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { const [{ slug }, locale] = await Promise.all([params, getLocale()]); const product = await db.product.findUnique({ where: { slug } }); return product ? { title: locale === "en" ? product.nameEn : product.nameZh, description: locale === "en" ? product.descriptionEn : product.descriptionZh } : { title: locale === "en" ? "Piece not found" : "找不到作品" }; }

export default async function ProductPage({ params }: { params: Params }) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await db.product.findUnique({ where: { slug, status: "ACTIVE" }, include: { variants: { orderBy: { priceMinor: "asc" } } } });
  if (!product) notFound();
  const en = locale === "en";
  const name = en ? product.nameEn : product.nameZh;
  const description = en ? product.descriptionEn : product.descriptionZh;
  const images = parseImages(product.imagesJson);
  const related = await db.product.findMany({ where: { id: { not: product.id }, status: "ACTIVE", OR: [{ collection: product.collection }, { category: product.category }] }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 4 });
  const schema = { "@context": "https://schema.org", "@type": "Product", name, image: images, description, sku: product.variants[0]?.sku, offers: { "@type": "Offer", priceCurrency: "HKD", price: (product.variants[0]?.priceMinor || 0) / 100, availability: "https://schema.org/InStock" } };
  return <main id="main" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><div className="breadcrumb container"><Link href="/">{en ? "Home" : "首頁"}</Link><span>/</span><Link href={product.audience === "PET" ? "/pets" : "/shop"}>{en ? (product.audience === "PET" ? "Pet jewellery" : "Jewellery") : (product.audience === "PET" ? "寵物飾品" : "珠寶")}</Link><span>/</span><span>{name}</span></div><section className="product-detail container"><div className="product-gallery"><div className="product-gallery-main"><Image src={images[0]} alt={name} fill priority sizes="(max-width:680px) 100vw, 55vw" /></div></div><div className="product-info-panel"><p className="eyebrow">{product.collection}</p><h1>{name}</h1><p className="product-price">{formatMoney(product.variants[0]?.priceMinor || 0)}</p><p className="muted">{en ? "3 interest-free instalments · Complimentary Hong Kong delivery" : "可享 3 期免息付款 · 香港免費配送"}</p><div className="fact-row"><span>{product.material}</span><span>{product.gemstone}</span></div><p className="product-description">{description}</p><ProductPurchase productId={product.id} slug={product.slug} variants={product.variants} locale={locale} /><div className="detail-accordions"><details open><summary>{en ? "Piece details" : "作品細節"}</summary><p>{en ? product.descriptionEn : product.storyZh}</p></details><details><summary>{en ? "Care" : "工藝與保養"}</summary><p>{en ? "Wipe with a soft dry cloth after wear. Avoid perfume and chemicals, and store separately." : "佩戴後以柔軟乾布輕拭，避免接觸香水與化學品，並獨立存放。"}</p></details><details><summary>{en ? "Delivery and returns" : "配送及退換"}</summary><p>{en ? "Complimentary Hong Kong delivery. Non-personalised pieces may be returned within 14 days." : "香港免費配送。未經刻字或訂製作品可於收貨後 14 天內申請退換。"}</p></details></div></div></section><section className="section" style={{background:"var(--paper)"}}><div className="section-heading"><div><p className="eyebrow">YOU MAY ALSO LIKE</p><h2>{en ? "Pieces to pair" : "相襯作品"}</h2></div><Link className="text-link" href="/shop">{en ? "All jewellery" : "所有珠寶"} →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} locale={locale} />)}</div></section></main>;
}
