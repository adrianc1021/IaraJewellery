import type { Metadata } from "next";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { localizeProductValue } from "@/lib/product-i18n";
import { MobileShopFilters, ShopFilterSidebar } from "@/components/shop-filters";
import { BridalExperience, CollectionsExperience, NewArrivalsExperience } from "@/components/shop-experiences";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const en = await getLocale() === "en";
  const query = await searchParams;
  const isNew = query.sort === "newest" && !query.view && !query.q && !query.category && !query.collection && !query.material && !query.gemstone && !query.priceMax && !query.audience;
  const isCollections = query.view === "collections";
  const isBridal = (Array.isArray(query.collection) ? query.collection : [query.collection]).includes("ARIA BRIDAL");
  const filtered = Object.keys(query).length > 0;
  if (isNew) return en ? { title: "New Arrivals | Iara Jewellery", description: "Discover the latest Iara Jewellery pieces, newly released from our Hong Kong atelier.", alternates: { canonical: "/shop?sort=newest" }, openGraph: { title: "New Arrivals | Iara Jewellery", description: "Discover the latest Iara Jewellery pieces.", url: "/shop?sort=newest", type: "website" } } : { title: "最新作品 | Iara Jewellery", description: "探索 Iara Jewellery 最新登場的珠寶作品。", alternates: { canonical: "/shop?sort=newest" }, openGraph: { title: "最新作品 | Iara Jewellery", description: "探索 Iara Jewellery 最新登場的珠寶作品。", url: "/shop?sort=newest", type: "website" } };
  if (isCollections) return en ? { title: "Collections | Iara Jewellery", description: "Explore the distinct jewellery worlds and design languages of Iara Jewellery.", alternates: { canonical: "/shop?view=collections" }, openGraph: { title: "Collections | Iara Jewellery", description: "Explore the distinct jewellery worlds of Iara Jewellery.", url: "/shop?view=collections", type: "website" } } : { title: "IARA 系列 | Iara Jewellery", description: "走進 Iara Jewellery 各個珠寶系列的設計故事與作品。", alternates: { canonical: "/shop?view=collections" }, openGraph: { title: "IARA 系列 | Iara Jewellery", description: "走進 Iara Jewellery 各個珠寶系列的設計故事。", url: "/shop?view=collections", type: "website" } };
  if (isBridal) return en ? { title: "Bridal Jewellery | Iara Jewellery", description: "Explore Iara bridal jewellery and book a private viewing for engagement and wedding rings.", alternates: { canonical: "/shop?collection=ARIA%20BRIDAL" }, openGraph: { title: "Bridal Jewellery | Iara Jewellery", description: "A considered way to choose your bridal jewellery.", url: "/shop?collection=ARIA%20BRIDAL", type: "website" } } : { title: "婚嫁珠寶 | Iara Jewellery", description: "探索 Iara 婚嫁珠寶、求婚戒指、結婚戒指及私人鑑賞服務。", alternates: { canonical: "/shop?collection=ARIA%20BRIDAL" }, openGraph: { title: "婚嫁珠寶 | Iara Jewellery", description: "從承諾的一刻，到相伴的每一天。", url: "/shop?collection=ARIA%20BRIDAL", type: "website" } };
  return en
    ? { title: "All Jewellery", description: "Explore rings, necklaces, earrings, bracelets and made-to-order pieces from Iara Jewellery in Hong Kong.", alternates: { canonical: "/shop" }, robots: filtered ? { index: false, follow: true } : undefined, openGraph: { title: "All Jewellery | Iara Jewellery", description: "Explore the complete Iara Jewellery collection.", url: "/shop", type: "website" } }
    : { title: "所有珠寶", description: "探索 Iara Jewellery 香港珠寶作品，包括戒指、項鏈、耳環、手鏈及訂製作品。", alternates: { canonical: "/shop" }, robots: filtered ? { index: false, follow: true } : undefined, openGraph: { title: "所有珠寶 | Iara Jewellery", description: "探索 Iara Jewellery 全部珠寶作品。", url: "/shop", type: "website" } };
}
export const dynamic = "force-dynamic";
const array = (value: string | string[] | undefined) => value ? (Array.isArray(value) ? value : [value]) : [];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [query, locale] = await Promise.all([searchParams, getLocale()]);
  const en = locale === "en";
  const isNew = query.sort === "newest" && !query.view && !query.q && !query.category && !query.collection && !query.material && !query.gemstone && !query.priceMax && !query.audience;
  const isCollections = query.view === "collections";
  const isBridal = (Array.isArray(query.collection) ? query.collection : [query.collection]).includes("ARIA BRIDAL");
  const categories = array(query.category), collections = array(query.collection), materials = array(query.material), gemstones = array(query.gemstone);
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const priceMax = typeof query.priceMax === "string" ? Number(query.priceMax) : 0;
  const audience = query.audience === "PET" ? "PET" : "PEOPLE";
  const products = await db.product.findMany({ where: { status: "ACTIVE", audience, ...(categories.length ? { category: { in: categories } } : {}), ...(collections.length ? { collection: { in: collections } } : {}), ...(materials.length ? { material: { in: materials } } : {}), ...(term ? { OR: [{ nameZh: { contains: term } }, { nameEn: { contains: term } }, { collection: { contains: term } }, { category: { contains: term } }, { material: { contains: term } }, { gemstone: { contains: term } }] } : {}) }, include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" }, ...(isNew || isBridal ? { take: 24 } : {}) });
  if (query.sort === "price-asc") products.sort((a, b) => (a.variants[0]?.priceMinor || 0) - (b.variants[0]?.priceMinor || 0));
  if (query.sort === "price-desc") products.sort((a, b) => (b.variants[0]?.priceMinor || 0) - (a.variants[0]?.priceMinor || 0));
  if (isNew) return <NewArrivalsExperience products={products} locale={locale} />;
  if (isBridal) return <BridalExperience products={products} locale={locale} />;
  const catalogGroups = await db.catalogGroup.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  if (isCollections) return <CollectionsExperience groups={catalogGroups.filter((group) => group.kind === "COLLECTION")} products={products} locale={locale} />;
  const visibleProducts = products.filter((product) => (!gemstones.length || gemstones.includes(product.gemstone)) && (!priceMax || (product.variants[0]?.priceMinor || 0) <= priceMax * 100));
  const filterData = await db.product.findMany({ where: { status: "ACTIVE", audience }, select: { category: true, collection: true, material: true, gemstone: true } });
  const unique = (key: "category" | "collection" | "material" | "gemstone") => [...new Set(filterData.map((item) => item[key]))].sort();
  const categoryOptions = catalogGroups.filter((group) => group.kind === "CATEGORY" && filterData.some((item) => item.category === group.nameZh));
  const collectionOptions = catalogGroups.filter((group) => group.kind === "COLLECTION" && filterData.some((item) => item.collection === group.nameZh));
  const filters = [{ key: "category", label: en ? "Category" : "珠寶分類", options: categoryOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "collection", label: en ? "Collection" : "系列", options: collectionOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "material", label: en ? "Material" : "材質", options: unique("material").map((value) => ({ value, label: localizeProductValue(value, locale) })) }, { key: "gemstone", label: en ? "Gemstone" : "寶石", options: unique("gemstone").map((value) => ({ value, label: localizeProductValue(value, locale) })) }];
  const selected = { category: categories, collection: collections, material: materials, gemstone: gemstones };
  const sort = typeof query.sort === "string" ? query.sort : "newest";
  const sortOptions = [{ value: "newest", label: en ? "Newest" : "最新上架" }, { value: "price-asc", label: en ? "Price: low to high" : "價格由低至高" }, { value: "price-desc", label: en ? "Price: high to low" : "價格由高至低" }];
  const priceOptions = [{ value: "10000", label: en ? "Under HK$10,000" : "HK$10,000 以下" }, { value: "30000", label: en ? "Under HK$30,000" : "HK$30,000 以下" }, { value: "60000", label: en ? "Under HK$60,000" : "HK$60,000 以下" }];
  const filterHiddenFields = [...(term ? [{ name: "q", value: term }] : []), ...(sort !== "newest" ? [{ name: "sort", value: sort }] : []), ...(audience === "PET" ? [{ name: "audience", value: "PET" }] : [])];
  const sortHiddenFields = [...categories.map((value) => ({ name: "category", value })), ...collections.map((value) => ({ name: "collection", value })), ...materials.map((value) => ({ name: "material", value })), ...gemstones.map((value) => ({ name: "gemstone", value })), ...(priceMax ? [{ name: "priceMax", value: String(priceMax) }] : []), ...(term ? [{ name: "q", value: term }] : []), ...(audience === "PET" ? [{ name: "audience", value: "PET" }] : [])];
  const clearHref = audience === "PET" ? "/shop?audience=PET" : "/shop";
  const filterLabels = { filter: en ? "Filter" : "篩選", filters: en ? "Filters" : "篩選作品", sort: en ? "Sort" : "排序", close: en ? "Close filters" : "關閉篩選", clear: en ? "Clear all" : "清除全部", apply: en ? "View pieces" : "查看作品", selected: en ? "selected filters" : "個已選篩選", price: en ? "Price" : "價格" };
  const activeFilters = [...categories.map((value) => ({ key: "category", value, label: localizeProductValue(value, locale) })), ...collections.map((value) => ({ key: "collection", value, label: localizeProductValue(value, locale) })), ...materials.map((value) => ({ key: "material", value, label: localizeProductValue(value, locale) })), ...gemstones.map((value) => ({ key: "gemstone", value, label: localizeProductValue(value, locale) })), ...(priceMax ? [{ key: "priceMax", value: String(priceMax), label: en ? `Under HK$${priceMax.toLocaleString()}` : `HK$${priceMax.toLocaleString()} 以下` }] : [])];
  const removeFilterHref = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (sort !== "newest") params.set("sort", sort);
    if (audience === "PET") params.set("audience", "PET");
    Object.entries(selected).forEach(([name, values]) => values.filter((item) => !(name === key && item === value)).forEach((item) => params.append(name, item)));
    if (priceMax && key !== "priceMax") params.set("priceMax", String(priceMax));
    const search = params.toString();
    return `/shop${search ? `?${search}` : ""}`;
  };
  return <main id="main" className="page-shell">
    <div className="breadcrumb container"><Link href="/">{en ? "Home" : "首頁"}</Link><span>/</span><span>{en ? "Jewellery" : "所有珠寶"}</span></div>
    <header className="page-heading shop-heading container">
      <p className="eyebrow">THE IARA COLLECTION</p>
      <h1>{en ? "All jewellery" : "所有珠寶"}</h1>
      <p>{en ? "Discover pieces designed for daily wear, gifts and remarkable moments." : "從日常佩戴、送禮到重要時刻，按你的需要探索合適作品。"}</p>
      <nav className="shop-category-nav" aria-label={en ? "Browse jewellery categories" : "瀏覽珠寶分類"}>
        <Link className={!categories.length ? "active" : ""} href="/shop">{en ? "View all" : "全部作品"}</Link>
        {categoryOptions.map((group) => <Link className={categories.includes(group.nameZh) ? "active" : ""} href={`/shop?category=${encodeURIComponent(group.nameZh)}`} key={group.id}>{en ? group.nameEn : group.nameZh}</Link>)}
      </nav>
    </header>
    <div className="shop-toolbar"><div className="shop-toolbar-inner container">
      <strong>{en ? `${visibleProducts.length} of ${products.length} pieces` : `顯示 ${visibleProducts.length}／${products.length} 件作品`}</strong>
      <form className="shop-search" action="/shop">
        {categories.map((value) => <input key={`category-${value}`} type="hidden" name="category" value={value} />)}
        {collections.map((value) => <input key={`collection-${value}`} type="hidden" name="collection" value={value} />)}
        {materials.map((value) => <input key={`material-${value}`} type="hidden" name="material" value={value} />)}
        {gemstones.map((value) => <input key={`gemstone-${value}`} type="hidden" name="gemstone" value={value} />)}
        {priceMax > 0 && <input type="hidden" name="priceMax" value={priceMax} />}
        {audience === "PET" && <input type="hidden" name="audience" value="PET" />}
        <Search size={16} /><input name="q" defaultValue={term} placeholder={en ? "Search pieces, gemstones or collections" : "搜尋作品、寶石或系列"} aria-label={en ? "Search jewellery" : "搜尋作品"} />
        <select id="shop-sort" name="sort" defaultValue={sort} aria-label={en ? "Sort" : "排序"}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <button className="button button-primary"><span>{en ? "Show results" : "顯示結果"}</span><Search className="shop-search-submit-icon" size={16} /></button>
      </form>
    </div></div>
    <MobileShopFilters filters={filters} hiddenFields={filterHiddenFields} selected={selected} priceOptions={priceOptions} priceMax={priceMax} clearHref={clearHref} labels={filterLabels} sort={sort} sortFields={sortHiddenFields} sortOptions={sortOptions} />
    <div className="shop-layout container">
      <ShopFilterSidebar filters={filters} hiddenFields={filterHiddenFields} selected={selected} priceOptions={priceOptions} priceMax={priceMax} clearHref={clearHref} labels={filterLabels} />
      <section className="shop-results">
        <div className="active-filter-row">
          {activeFilters.map((filter) => <Link className="filter-chip" href={removeFilterHref(filter.key, filter.value)} aria-label={`${en ? "Remove" : "移除"} ${filter.label}`} key={`${filter.key}-${filter.value}`}>{filter.label}<X size={11} /></Link>)}
        </div>
        {visibleProducts.length
          ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div>
          : <div className="empty-state"><h2>{en ? "No matching pieces" : "未找到相符作品"}</h2><p>{en ? "Try another search or adjust your filters." : "請調整篩選條件或搜尋其他字詞。"}</p><Link className="button button-primary" href={clearHref}>{en ? "View all jewellery" : "查看所有珠寶"}</Link></div>}
      </section>
    </div>
  </main>;
}
