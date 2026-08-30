import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

type ShopProduct = React.ComponentProps<typeof ProductCard>["product"];
type CatalogGroup = { id: string; nameZh: string; nameEn: string; imageUrl: string | null; slug: string };

const campaignImage = "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1800&q=88";
const bridalImage = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2200&q=90";
const bridalPathwayImages = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=88"
];
const collectionImages = [
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=88"
];

function ProductGrid({ products, locale, className = "" }: { products: ShopProduct[]; locale: Locale; className?: string }) {
  return <div className={`product-grid ${className}`}>{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div>;
}

export function NewArrivalsExperience({ products, locale }: { products: ShopProduct[]; locale: Locale }) {
  const en = locale === "en";
  return <main id="main" className="shop-experience shop-new-experience">
    <section className="experience-hero experience-hero-campaign"><Image src={campaignImage} alt={en ? "Iara new jewellery campaign" : "Iara 最新珠寶系列形象照"} fill priority sizes="100vw" /><div className="experience-hero-shade" /><div className="experience-hero-copy"><p className="eyebrow">NEW ARRIVALS · 2026</p><h1>{en ? "New pieces, newly arrived" : "最新作品"}</h1><p>{en ? "A new season of light, line and everyday jewellery." : "新一季光影、線條與日常佩戴方式。探索 IARA 最新登場的珠寶作品。"}</p><Link className="text-link text-link-light" href="#new-arrivals-grid">{en ? "Explore the new edit" : "探索最新作品"}<ArrowRight size={14} /></Link></div></section>
    <section className="experience-intro"><p className="eyebrow">THE NEW EDIT</p><h2>{en ? "Designed to be noticed." : "為值得留意的日常而作。"}</h2><p>{en ? "Meet the latest Iara pieces, released in a considered edit and made to order from our Hong Kong atelier." : "以編輯式選題呈現最新作品，從香港工房細緻製作，讓每件珠寶在日常中留下剛好的光。"}</p></section>
    <section className="new-arrivals-editorial container" id="new-arrivals-grid">{products[0] && <div className="new-arrivals-feature"><div className="new-arrivals-feature-image"><Image src={String(JSON.parse(products[0].imagesJson)[0] || campaignImage)} alt={en ? (products[0].nameEn || products[0].nameZh) : products[0].nameZh} fill sizes="(max-width: 680px) 100vw, 58vw" /></div><div><p className="eyebrow">{en ? "JUST IN" : "本月新作"}</p><h2>{en ? (products[0].nameEn || products[0].nameZh) : products[0].nameZh}</h2><p>{en ? "A considered new expression of Iara's fluid forms." : "以流動輪廓重新演繹 Iara 的日常光影。"}</p><Link className="text-link" href={`/product/${products[0].slug}`}>{en ? "View the piece" : "查看作品"}<ArrowRight size={14} /></Link></div></div>}<ProductGrid products={products.slice(1)} locale={locale} className="new-arrivals-grid" /></section>
  </main>;
}

export function CollectionsExperience({ groups, products, locale }: { groups: CatalogGroup[]; products: ShopProduct[]; locale: Locale }) {
  const en = locale === "en";
  return <main id="main" className="shop-experience collections-experience"><section className="collections-heading container"><p className="eyebrow">THE IARA COLLECTIONS</p><h1>{en ? "The collections" : "IARA 系列"}</h1><p>{en ? "Each collection begins with a distinct shape of light, a feeling and a way of expressing yourself." : "每個系列，源自一種光的形態、一段情感，以及一種屬於佩戴者的表達方式。"}</p></section><section className="collections-story container"><div className="collections-story-image"><Image src={collectionImages[0]} alt={en ? "Iara collection jewellery" : "Iara 系列珠寶細節"} fill sizes="(max-width: 680px) 100vw, 55vw" /></div><div className="collections-story-copy"><p className="eyebrow">A LANGUAGE OF LIGHT</p><h2>{en ? "Jewellery with its own point of view." : "每一道光，都有自己的語言。"}</h2><p>{en ? "Explore the worlds behind Iara's signature forms, from fluid lines to quiet textures." : "從流動線條到安靜紋理，走進 Iara 標誌輪廓背後的設計世界。"}</p></div></section><section className="collection-worlds container"><header><p className="eyebrow">EXPLORE THE WORLDS</p><h2>{en ? "Find the collection that feels like you." : "尋找最能代表你的系列。"}</h2></header><div className="collection-world-grid">{groups.map((group, index) => { const image = group.imageUrl || collectionImages[index % collectionImages.length]; const groupProducts = products.filter((product) => product.collection === group.nameZh); return <article key={group.id} className={index === 0 ? "featured" : ""}><Link href={`/shop?collection=${encodeURIComponent(group.nameZh)}`}><span className="collection-world-image"><Image src={image} alt={en ? `${group.nameEn} collection` : `${group.nameZh}系列`} fill sizes="(max-width: 680px) 100vw, 40vw" /></span><span className="collection-world-copy"><small>{group.nameEn.toUpperCase()}</small><strong>{en ? group.nameEn : group.nameZh}</strong><em>{en ? `${groupProducts.length} pieces · Explore` : `${groupProducts.length} 件作品 · 探索系列`} <ArrowRight size={13} /></em></span></Link></article>; })}</div></section></main>;
}

export function BridalExperience({ products, locale }: { products: ShopProduct[]; locale: Locale }) {
  const en = locale === "en";
  const pathways = en ? [
    { eyebrow: "ENGAGEMENT RINGS", title: "A ring for the question", copy: "Explore diamond proportions, settings and details made for a singular promise.", cta: "Explore engagement rings", href: "#bridal-products" },
    { eyebrow: "WEDDING BANDS", title: "Made to be worn together", copy: "Discover considered bands designed for a lifetime of everyday wear.", cta: "Discover wedding bands", href: "#bridal-products" },
    { eyebrow: "BRIDAL JEWELLERY", title: "Light for the celebration", copy: "Choose jewellery for the ceremony, the celebration and every occasion after.", cta: "Explore the bridal edit", href: "#bridal-products" }
  ] : [
    { eyebrow: "ENGAGEMENT RINGS", title: "求婚戒指", copy: "從鑽石比例、戒托到專屬細節，為承諾選擇一枚真正合適的戒指。", cta: "探索求婚戒指", href: "#bridal-products" },
    { eyebrow: "WEDDING BANDS", title: "結婚戒指", copy: "探索適合相伴佩戴的輪廓、材質與婚戒配搭。", cta: "探索結婚戒指", href: "#bridal-products" },
    { eyebrow: "BRIDAL JEWELLERY", title: "婚嫁珠寶", copy: "為儀式、慶典及婚後每個重要時刻，選擇恰到好處的光。", cta: "探索婚嫁珠寶", href: "#bridal-products" }
  ];
  return <main id="main" className="shop-experience bridal-experience">
    <section className="experience-hero experience-hero-bridal"><Image src={bridalImage} alt={en ? "Diamond engagement ring from the Iara bridal collection" : "IARA 婚嫁系列鑽石求婚戒指"} fill priority sizes="100vw" /><div className="experience-hero-shade" /><div className="experience-hero-copy"><p className="eyebrow">IARA BRIDAL</p><h1>{en ? "Made for the promise" : "為愛而作"}</h1><p>{en ? "From the moment of promise to every day that follows." : "從承諾的一刻，到相伴的每一天。"}</p><Link className="text-link text-link-light" href="/appointment">{en ? "Book a private viewing" : "預約私人鑑賞"}<ArrowRight size={14} /></Link></div></section>
    <section className="bridal-intro"><p className="eyebrow">ENGAGEMENT &amp; BRIDAL</p><h2>{en ? "A celebration of your story" : "為每一段獨一無二的故事"}</h2><p>{en ? "Discover engagement rings, wedding bands and bridal jewellery shaped with care for a lifetime together." : "探索求婚戒指、結婚戒指及婚嫁珠寶。由選石、尺寸到專屬細節，IARA 陪你細緻完成每一個決定。"}</p></section>
    <section className="bridal-pathways container"><header><p className="eyebrow">DISCOVER IARA BRIDAL</p><h2>{en ? "Choose how your story begins" : "按心意探索婚嫁珠寶"}</h2></header><div className="bridal-pathway-grid">{pathways.map((item, index) => <article key={item.eyebrow}><Link href={item.href}><span className="bridal-pathway-image"><Image src={bridalPathwayImages[index]} alt={en ? item.title : `${item.title}形象`} fill sizes="(max-width: 680px) 100vw, 33vw" /></span><span className="bridal-pathway-copy"><small>{item.eyebrow}</small><strong>{item.title}</strong><p>{item.copy}</p><em>{item.cta}<ArrowRight size={13} /></em></span></Link></article>)}</div></section>
    <section className="bridal-products container" id="bridal-products"><header><div><p className="eyebrow">ARIA BRIDAL</p><h2>{en ? "The bridal collection" : "ARIA 婚嫁系列"}</h2><p>{en ? "Explore pieces selected for proposals, ceremonies and a lifetime beyond." : "由求婚、婚禮儀式到相伴日常，探索為重要時刻而作的珠寶。"}</p></div><Link className="text-link" href="/appointment">{en ? "Arrange a consultation" : "預約婚嫁顧問"}<ArrowRight size={14} /></Link></header><ProductGrid products={products} locale={locale} className="bridal-grid" /></section>
    <section className="bridal-services container"><article><div className="bridal-service-image"><Image src={bridalPathwayImages[2]} alt={en ? "Bridal styling details prepared for a private viewing" : "為私人鑑賞準備的婚嫁造型細節"} fill sizes="(max-width: 680px) 100vw, 50vw" /></div><div><p className="eyebrow">PRIVATE APPOINTMENT</p><h2>{en ? "Choose with time and privacy" : "在專屬空間，從容選擇"}</h2><p>{en ? "Compare proportions, settings and paired bands with one-to-one guidance from our team." : "由戒指比例、鑽石、尺寸到婚戒配搭，珠寶顧問會按你們的需要提供一對一建議。"}</p><Link className="text-link" href="/appointment">{en ? "Book an appointment" : "預約私人鑑賞"}<ArrowRight size={14} /></Link></div></article><article><div className="bridal-service-image"><Image src="/images/craft/hand-setting.jpg" alt={en ? "An Iara artisan setting a gemstone" : "IARA 工匠細緻鑲嵌寶石"} fill sizes="(max-width: 680px) 100vw, 50vw" /></div><div><p className="eyebrow">BRIDAL GUIDE</p><h2>{en ? "Understand every detail" : "了解每一個重要細節"}</h2><p>{en ? "Learn about ring size, settings, engraving and the care that follows your purchase." : "了解戒指尺寸、鑲嵌方式、刻字及售後保養，讓每個選擇更清楚安心。"}</p><Link className="text-link" href="/faq">{en ? "Read the bridal guide" : "閱讀婚嫁選購指南"}<ArrowRight size={14} /></Link></div></article></section>
    <section className="bridal-close"><p className="eyebrow">A PRIVATE BEGINNING</p><h2>{en ? "Your ring should feel like yours" : "一對婚戒，從你們的故事開始"}</h2><p>{en ? "Meet with an Iara jewellery advisor for a private bridal consultation." : "與 IARA 珠寶顧問見面，細談屬於你們的款式、尺寸與專屬細節。"}</p><Link className="button button-secondary" href="/appointment">{en ? "Book your appointment" : "預約鑑賞"}<ArrowRight size={14} /></Link></section>
  </main>;
}
