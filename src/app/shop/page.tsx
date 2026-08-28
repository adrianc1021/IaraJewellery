import type { Metadata } from "next";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { localizeProductValue } from "@/lib/product-i18n";
import { MobileShopFilters, ShopFilterSidebar } from "@/components/shop-filters";

export async function generateMetadata(): Promise<Metadata> {
  const en = await getLocale() === "en";
  return en
    ? { title: "All Jewellery", description: "Explore the complete Iara Jewellery collection." }
    : { title: "所有珠寶", description: "探索 Iara Jewellery 全部珠寶作品。" };
}
export const dynamic = "force-dynamic";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const array = (value: string | string[] | undefined) => value ? (Array.isArray(value) ? value : [value]) : [];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [query, locale] = await Promise.all([searchParams, getLocale()]);
  const en = locale === "en";
  const categories = array(query.category), collections = array(query.collection), materials = array(query.material), gemstones = array(query.gemstone);
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const priceMax = typeof query.priceMax === "string" ? Number(query.priceMax) : 0;
  const audience = query.audience === "PET" ? "PET" : "PEOPLE";
  const products = await db.product.findMany({ where: { status: "ACTIVE", audience, ...(categories.length ? { category: { in: categories } } : {}), ...(collections.length ? { collection: { in: collections } } : {}), ...(materials.length ? { material: { in: materials } } : {}), ...(term ? { OR: [{ nameZh: { contains: term } }, { nameEn: { contains: term } }, { collection: { contains: term } }, { category: { contains: term } }, { material: { contains: term } }, { gemstone: { contains: term } }] } : {}) }, include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } });
  if (query.sort === "price-asc") products.sort((a, b) => (a.variants[0]?.priceMinor || 0) - (b.variants[0]?.priceMinor || 0));
  if (query.sort === "price-desc") products.sort((a, b) => (b.variants[0]?.priceMinor || 0) - (a.variants[0]?.priceMinor || 0));
  const visibleProducts = products.filter((product) => (!gemstones.length || gemstones.includes(product.gemstone)) && (!priceMax || (product.variants[0]?.priceMinor || 0) <= priceMax * 100));
  const [filterData, catalogGroups] = await Promise.all([db.product.findMany({ where: { status: "ACTIVE", audience }, select: { category: true, collection: true, material: true, gemstone: true } }), db.catalogGroup.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } })]);
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
