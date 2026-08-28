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

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await db.product.findUnique({ where: { slug } });
  return product ? { title: locale === "en" ? product.nameEn : product.nameZh, description: locale === "en" ? product.descriptionEn : product.descriptionZh } : { title: locale === "en" ? "Piece not found" : "找不到作品" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await db.product.findUnique({ where: { slug, status: "ACTIVE" }, include: { variants: { orderBy: { priceMinor: "asc" } } } });
  if (!product) notFound();
  const en = locale === "en";
  const name = en ? product.nameEn : product.nameZh;
  const description = en ? product.descriptionEn : product.descriptionZh;
  const images = parseImages(product.imagesJson);
  const related = await db.product.findMany({ where: { id: { not: product.id }, status: "ACTIVE", OR: [{ collection: product.collection }, { category: product.category }] }, include: { variants: { orderBy: { priceMinor: "asc" } } }, take: 4 });
  const specs = [
    [en ? "Material" : "材質", product.material],
    [en ? "Pendant dimensions" : "吊墜實際尺寸", product.pendantDimensions],
    [en ? "Chain length" : "鏈長及可調節長度", product.chainLength],
    [en ? "Product weight" : "產品重量", product.productWeight],
    [en ? "Clasp" : "扣件類型", product.claspType],
    [en ? "Made in" : "產地／製作地", product.origin],
    [en ? "Product number / SKU" : "產品編號／SKU", product.variants[0]?.sku]
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const gemstones = [
    [en ? "Gemstone" : "寶石", product.gemstone],
    [en ? "Total diamond weight" : "鑽石總重量", product.diamondWeight],
    [en ? "Colour / clarity" : "鑽石顏色及淨度", product.diamondColorClarity],
    [en ? "Diamond origin" : "鑽石來源", product.isNaturalDiamond ? (en ? "Natural diamond" : "天然鑽石") : (en ? "Please enquire" : "請向珠寶顧問查詢")],
    [en ? "Certificate" : "證書", product.hasCertificate ? (en ? "Certificate included" : "附證書") : (en ? "Available on request" : "可按需要提供資料")]
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const services = [
    [en ? "Engraving" : "刻字服務", product.engravingAvailable ? (en ? "Available" : "可刻字") : (en ? "Not available" : "不適用")],
    [en ? "Chain adjustment" : "鏈長調整", product.chainLengthAdjustable ? (en ? "Available" : "可改鏈長") : (en ? "Please enquire" : "請向珠寶顧問查詢")],
    [en ? "Warranty and repairs" : "保養及維修年期", product.warrantyYears > 0 ? (en ? `${product.warrantyYears}-year service` : `${product.warrantyYears} 年服務`) : (en ? "Please enquire" : "請向珠寶顧問查詢")]
  ];
  const schema = { "@context": "https://schema.org", "@type": "Product", name, image: images, description, sku: product.variants[0]?.sku, offers: { "@type": "Offer", priceCurrency: "HKD", price: (product.variants[0]?.priceMinor || 0) / 100, availability: "https://schema.org/InStock" } };

  return <main id="main" className="page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="breadcrumb container"><Link href="/">{en ? "Home" : "首頁"}</Link><span>/</span><Link href={product.audience === "PET" ? "/pets" : "/shop"}>{en ? (product.audience === "PET" ? "Pet jewellery" : "Jewellery") : (product.audience === "PET" ? "寵物飾品" : "珠寶")}</Link><span>/</span><span>{name}</span></div>
    <section className="product-detail container">
      <div className="product-gallery">
        <div className="product-gallery-main"><Image src={images[0]} alt={name} fill priority sizes="(max-width:680px) 100vw, 55vw" /></div>
        {images.length > 1 && <div className="product-gallery-thumbs">{images.map((image, index) => <Image key={`${image}-${index}`} src={image} alt={`${name} ${index + 1}`} width={88} height={110} />)}</div>}
      </div>
      <div className="product-info-panel">
        <p className="eyebrow">{product.collection}</p><h1>{name}</h1><p className="product-price">{formatMoney(product.variants[0]?.priceMinor || 0)}</p>
        <p className="muted">{en ? "3 interest-free instalments · Complimentary Hong Kong delivery" : "可享 3 期免息付款 · 香港免費配送"}</p>
        <div className="fact-row"><span>{product.material}</span><span>{product.gemstone}</span>{product.audience === "PET" && <span>{en ? "Pet Atelier" : "寵物專區"}</span>}</div>
        <p className="product-description">{description}</p>
        <ProductPurchase productId={product.id} slug={product.slug} variants={product.variants} locale={locale} />
        <div className="detail-accordions"><details open><summary>{en ? "Piece details" : "作品細節"}</summary><p>{en ? product.descriptionEn : product.storyZh}</p></details><details><summary>{en ? "Care" : "工藝與保養"}</summary><p>{product.careRepair || (en ? "Wipe with a soft dry cloth after wear. Avoid perfume and chemicals, and store separately." : "佩戴後以柔軟乾布輕拭，避免接觸香水與化學品，並獨立存放。")}</p></details><details><summary>{en ? "Delivery and returns" : "配送及退換"}</summary><p>{en ? "Complimentary Hong Kong delivery. Non-personalised pieces may be returned within 14 days." : "香港免費配送。未經刻字或訂製作品可於收貨後 14 天內申請退換。"}</p></details></div>
      </div>
    </section>
    <section className="product-information container">
      <div className="product-story-block"><p className="eyebrow">THE STORY</p><h2>{en ? "Designed around your light" : "以你的光，成就每一道線條"}</h2><p>{product.storyZh || description}</p></div>
      <div className="product-spec-columns"><section><p className="eyebrow">DETAILS</p><h2>{en ? "Detailed specifications" : "詳細規格"}</h2><dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section><p className="eyebrow">GEMSTONES</p><h2>{en ? "Stone information" : "寶石資料"}</h2><dl>{gemstones.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section><p className="eyebrow">IARA SERVICE</p><h2>{en ? "Care and personalisation" : "專屬服務"}</h2><dl>{services.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section></div>
      <div className="product-service-grid"><div><h3>{en ? "Sizing guide" : "尺寸指南"}</h3><p>{en ? "Our jewellery consultant can advise on ring size, pendant proportion and chain length. Book a private viewing for a considered fit." : "珠寶顧問可協助選擇戒指尺寸、吊墜比例及鏈長；歡迎預約私人鑑賞，親身確認佩戴效果。"}</p></div><div><h3>The Iara Experience</h3><p>{en ? "Signature packaging, complimentary Hong Kong delivery, 14-day returns, one-to-one guidance and ongoing cleaning checks." : "專屬包裝、香港免費配送、14 天退換、一對一珠寶顧問及持續清潔檢查服務。"}</p></div><div><h3>{en ? "Authenticity and certificate" : "真品及證書說明"}</h3><p>{en ? "Every piece is inspected before delivery. Certificate details and stone origin are recorded with the product and can be shared by our team." : "每件作品出貨前均經品質檢查；證書資料及寶石來源會與產品紀錄保存，可向團隊查詢。"}</p></div></div>
    </section>
    <section className="section" style={{ background: "var(--paper)" }}><div className="section-heading"><div><p className="eyebrow">YOU MAY ALSO LIKE</p><h2>{en ? "Pieces to pair" : "相襯作品"}</h2></div><Link className="text-link" href="/shop">{en ? "All jewellery" : "所有珠寶"} →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} locale={locale} />)}</div></section>
  </main>;
}
