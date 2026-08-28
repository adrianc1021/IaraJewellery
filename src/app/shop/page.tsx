import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { localizeProductValue } from "@/lib/product-i18n";

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
  const chips = [...categories.map((value) => ["category", value]), ...collections.map((value) => ["collection", value]), ...materials.map((value) => ["material", value]), ...gemstones.map((value) => ["gemstone", value]), ...(priceMax ? [["priceMax", `HK$${priceMax.toLocaleString()}`]] : [])];
  const categoryOptions = catalogGroups.filter((group) => group.kind === "CATEGORY" && filterData.some((item) => item.category === group.nameZh));
  const collectionOptions = catalogGroups.filter((group) => group.kind === "COLLECTION" && filterData.some((item) => item.collection === group.nameZh));
  const filters = [{ key: "category", label: en ? "Category" : "珠寶分類", options: categoryOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "collection", label: en ? "Collection" : "系列", options: collectionOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "material", label: en ? "Material" : "材質", options: unique("material").map((value) => ({ value, label: localizeProductValue(value, locale) })) }, { key: "gemstone", label: en ? "Gemstone" : "寶石", options: unique("gemstone").map((value) => ({ value, label: localizeProductValue(value, locale) })) }];
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
        <select id="shop-sort" name="sort" defaultValue={typeof query.sort === "string" ? query.sort : "newest"} aria-label={en ? "Sort" : "排序"}><option value="newest">{en ? "Newest" : "最新上架"}</option><option value="price-asc">{en ? "Price: low to high" : "價格由低至高"}</option><option value="price-desc">{en ? "Price: high to low" : "價格由高至低"}</option></select>
        <button className="button button-primary">{en ? "Show results" : "顯示結果"}</button>
      </form>
    </div></div>
    <div className="mobile-shop-actions"><a href="#shop-filters">{en ? "Filter" : "篩選"}</a><a href="#shop-sort">{en ? "Sort" : "排序"}</a></div>
    <div className="shop-layout container">
      <form className="filter-sidebar" id="shop-filters" action="/shop">
        {term && <input type="hidden" name="q" value={term} />}
        {typeof query.sort === "string" && <input type="hidden" name="sort" value={query.sort} />}
        {audience === "PET" && <input type="hidden" name="audience" value="PET" />}
        {filters.map((filter) => <fieldset key={filter.key}><legend>{filter.label}</legend>{filter.options.map((option) => <label key={option.value}><input type="checkbox" name={filter.key} value={option.value} defaultChecked={array(query[filter.key]).includes(option.value)} />{option.label}</label>)}</fieldset>)}
        <fieldset><legend>{en ? "Price" : "價格"}</legend><label><input type="radio" name="priceMax" value="10000" defaultChecked={priceMax === 10000} />{en ? "Under HK$10,000" : "HK$10,000 以下"}</label><label><input type="radio" name="priceMax" value="30000" defaultChecked={priceMax === 30000} />{en ? "Under HK$30,000" : "HK$30,000 以下"}</label><label><input type="radio" name="priceMax" value="60000" defaultChecked={priceMax === 60000} />{en ? "Under HK$60,000" : "HK$60,000 以下"}</label></fieldset>
        <div className="filter-actions"><button className="button button-primary">{en ? "Show matching pieces" : "顯示相符作品"}</button><Link className="text-link" href="/shop">{en ? "Clear all" : "清除全部"}</Link></div>
      </form>
      <section className="shop-results"><div className="active-filter-row">{chips.map(([key,value]) => <span className="filter-chip" key={`${key}-${value}`}>{key === "priceMax" ? value : localizeProductValue(value, locale)}</span>)}</div>{visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : <div className="empty-state"><h2>{en ? "No matching pieces" : "未找到相符作品"}</h2><p>{en ? "Try another search or adjust your filters." : "請調整篩選條件或搜尋其他字詞。"}</p><Link className="button button-primary" href="/shop">{en ? "View all jewellery" : "查看所有珠寶"}</Link></div>}</section>
    </div>
  </main>;
}
