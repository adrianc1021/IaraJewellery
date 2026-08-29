import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney, parseImages } from "@/lib/format";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";
import { JsonLd } from "@/components/json-ld";
import { getLocale } from "@/lib/i18n";
import { localizeProductCopy, localizeProductValue } from "@/lib/product-i18n";
import { absoluteUrl, organizationId, seoConfig } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await db.product.findUnique({ where: { slug } });
  if (!product || product.status !== "ACTIVE") return { title: locale === "en" ? "Piece not found" : "找不到作品", robots: { index: false, follow: false } };
  const name = locale === "en" ? product.nameEn : product.nameZh;
  const description = locale === "en" ? product.descriptionEn : product.descriptionZh;
  const images = parseImages(product.imagesJson).map(absoluteUrl);
  const canonical = `/product/${product.slug}`;
  return { title: name, description, alternates: { canonical }, openGraph: { title: name, description, url: canonical, type: "website", images: images.slice(0, 4).map((url) => ({ url, alt: name })) }, twitter: { card: "summary_large_image", title: name, description, images: images.slice(0, 1) } };
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
    [en ? "Material" : "材質", localizeProductValue(product.material, locale)],
    [en ? "Pendant dimensions" : "吊墜實際尺寸", product.pendantDimensions],
    [en ? "Chain length" : "鏈長及可調節長度", product.chainLength],
    [en ? "Product weight" : "產品重量", localizeProductValue(product.productWeight, locale)],
    [en ? "Clasp" : "扣件類型", localizeProductValue(product.claspType, locale)],
    [en ? "Made in" : "產地／製作地", localizeProductValue(product.origin, locale)],
    [en ? "Product number / SKU" : "產品編號／SKU", product.variants[0]?.sku]
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const gemstones = [
    [en ? "Gemstone" : "寶石", localizeProductValue(product.gemstone, locale)],
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
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const activeVariants = product.variants.filter((variant) => variant.active);
  const schema = { "@context": "https://schema.org", "@type": "Product", "@id": `${productUrl}#product`, url: productUrl, name, alternateName: en ? product.nameZh : product.nameEn, image: images.map(absoluteUrl), description, sku: activeVariants[0]?.sku, category: product.category, material: product.material, brand: { "@type": "Brand", name: seoConfig.name }, offers: activeVariants.map((variant) => ({ "@type": "Offer", url: productUrl, sku: variant.sku, name: variant.optionName, priceCurrency: variant.currency, price: variant.priceMinor / 100, availability: variant.stockOnHand - variant.stockReserved > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition", seller: { "@id": organizationId }, shippingDetails: { "@type": "OfferShippingDetails", shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "HKD" }, shippingDestination: { "@type": "DefinedRegion", addressCountry: "HK" }, deliveryTime: { "@type": "ShippingDeliveryTime", transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" } } }, hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "HK", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 14, returnMethod: "https://schema.org/ReturnByMail", returnFees: "https://schema.org/FreeReturn" } })), additionalProperty: [...specs, ...gemstones, ...services].map(([label, value]) => ({ "@type": "PropertyValue", name: label, value })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: en ? "Home" : "首頁", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: en ? (product.audience === "PET" ? "Pet jewellery" : "Jewellery") : (product.audience === "PET" ? "寵物飾品" : "珠寶"), item: absoluteUrl(product.audience === "PET" ? "/pets" : "/shop") }, { "@type": "ListItem", position: 3, name, item: productUrl }] };

  return <main id="main" className="page-shell">
    <JsonLd data={schema} /><JsonLd data={breadcrumbSchema} />
    <div className="breadcrumb container"><Link href="/">{en ? "Home" : "首頁"}</Link><span>/</span><Link href={product.audience === "PET" ? "/pets" : "/shop"}>{en ? (product.audience === "PET" ? "Pet jewellery" : "Jewellery") : (product.audience === "PET" ? "寵物飾品" : "珠寶")}</Link><span>/</span><span>{name}</span></div>
    <section className="product-detail container">
      <div className="product-gallery">
        <div className="product-gallery-main"><Image src={images[0]} alt={name} fill priority sizes="(max-width:680px) 100vw, 55vw" /></div>
        {images.length > 1 && <div className="product-gallery-thumbs">{images.map((image, index) => <Image key={`${image}-${index}`} src={image} alt={`${name} ${index + 1}`} width={88} height={110} />)}</div>}
      </div>
      <div className="product-info-panel">
        <p className="eyebrow">{product.collection}</p><h1>{name}</h1><p className="product-price">{formatMoney(product.variants[0]?.priceMinor || 0)}</p>
        <p className="muted">{en ? "PayMe, FPS or AlipayHK · Complimentary Hong Kong delivery" : "PayMe、FPS 或 AlipayHK · 香港免費配送"}</p>
        <div className="fact-row"><span>{localizeProductValue(product.material, locale)}</span><span>{localizeProductValue(product.gemstone, locale)}</span>{product.audience === "PET" && <span>{en ? "Pet Atelier" : "寵物專區"}</span>}</div>
        <p className="product-description">{description}</p>
        <ProductPurchase productId={product.id} slug={product.slug} variants={product.variants} locale={locale} />
        <div className="detail-accordions"><details open><summary>{en ? "Piece details" : "作品細節"}</summary><p>{en ? product.descriptionEn : product.storyZh}</p></details><details><summary>{en ? "Care" : "工藝與保養"}</summary><p>{localizeProductCopy(product.careRepair, locale, "Wipe with a soft dry cloth after wear. Avoid perfume and chemicals, and store separately.")}</p></details><details><summary>{en ? "Delivery and returns" : "配送及退換"}</summary><p>{en ? "Complimentary Hong Kong delivery. Non-personalised pieces may be returned within 14 days." : "香港免費配送。未經刻字或訂製作品可於收貨後 14 天內申請退換。"}</p></details></div>
      </div>
    </section>
    <section className="product-information container">
      <div className="product-story-block"><p className="eyebrow">THE STORY</p><h2>{en ? "Designed around your light" : "以你的光，成就每一道線條"}</h2><p>{en ? product.descriptionEn : product.storyZh || description}</p></div>
      <div className="product-spec-columns"><section><p className="eyebrow">DETAILS</p><h2>{en ? "Detailed specifications" : "詳細規格"}</h2><dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section><p className="eyebrow">GEMSTONES</p><h2>{en ? "Stone information" : "寶石資料"}</h2><dl>{gemstones.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section><section><p className="eyebrow">IARA SERVICE</p><h2>{en ? "Care and personalisation" : "專屬服務"}</h2><dl>{services.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section></div>
      <div className="product-service-grid"><div><h3>{en ? "Sizing guide" : "尺寸指南"}</h3><p>{en ? "Our jewellery consultant can advise on ring size, pendant proportion and chain length. Book a private viewing for a considered fit." : "珠寶顧問可協助選擇戒指尺寸、吊墜比例及鏈長；歡迎預約私人鑑賞，親身確認佩戴效果。"}</p></div><div><h3>The Iara Experience</h3><p>{en ? "Signature packaging, complimentary Hong Kong delivery, 14-day returns, one-to-one guidance and ongoing cleaning checks." : "專屬包裝、香港免費配送、14 天退換、一對一珠寶顧問及持續清潔檢查服務。"}</p></div><div><h3>{en ? "Authenticity and certificate" : "真品及證書說明"}</h3><p>{en ? "Every piece is inspected before delivery. Certificate details and stone origin are recorded with the product and can be shared by our team." : "每件作品出貨前均經品質檢查；證書資料及寶石來源會與產品紀錄保存，可向團隊查詢。"}</p></div></div>
    </section>
    <section className="section" style={{ background: "var(--paper)" }}><div className="section-heading"><div><p className="eyebrow">YOU MAY ALSO LIKE</p><h2>{en ? "Pieces to pair" : "相襯作品"}</h2></div><Link className="text-link" href="/shop">{en ? "All jewellery" : "所有珠寶"} →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} locale={locale} />)}</div></section>
  </main>;
}
