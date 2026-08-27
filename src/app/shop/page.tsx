import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "所有珠寶", description: "探索 Iara Jewellery 全部珠寶作品。" };
export const dynamic = "force-dynamic";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const array = (value: string | string[] | undefined) => value ? (Array.isArray(value) ? value : [value]) : [];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [query, locale] = await Promise.all([searchParams, getLocale()]);
  const en = locale === "en";
  const categories = array(query.category), collections = array(query.collection), materials = array(query.material);
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const audience = query.audience === "PET" ? "PET" : "PEOPLE";
  const products = await db.product.findMany({ where: { status: "ACTIVE", audience, ...(categories.length ? { category: { in: categories } } : {}), ...(collections.length ? { collection: { in: collections } } : {}), ...(materials.length ? { material: { in: materials } } : {}), ...(term ? { OR: [{ nameZh: { contains: term } }, { nameEn: { contains: term } }, { collection: { contains: term } }, { category: { contains: term } }, { material: { contains: term } }, { gemstone: { contains: term } }] } : {}) }, include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } });
  if (query.sort === "price-asc") products.sort((a, b) => (a.variants[0]?.priceMinor || 0) - (b.variants[0]?.priceMinor || 0));
  if (query.sort === "price-desc") products.sort((a, b) => (b.variants[0]?.priceMinor || 0) - (a.variants[0]?.priceMinor || 0));
  const [filterData, catalogGroups] = await Promise.all([db.product.findMany({ where: { status: "ACTIVE", audience }, select: { category: true, collection: true, material: true } }), db.catalogGroup.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } })]);
  const unique = (key: keyof typeof filterData[number]) => [...new Set(filterData.map((item) => item[key]))].sort();
  const chips = [...categories.map((value) => ["category", value]), ...collections.map((value) => ["collection", value]), ...materials.map((value) => ["material", value])];
  const categoryOptions = catalogGroups.filter((group) => group.kind === "CATEGORY" && filterData.some((item) => item.category === group.nameZh));
  const collectionOptions = catalogGroups.filter((group) => group.kind === "COLLECTION" && filterData.some((item) => item.collection === group.nameZh));
  const filters = [{ key: "category", label: en ? "Category" : "珠寶分類", options: categoryOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "collection", label: en ? "Collection" : "系列", options: collectionOptions.map((group) => ({ value: group.nameZh, label: en ? group.nameEn : group.nameZh })) }, { key: "material", label: en ? "Material" : "材質", options: unique("material").map((value) => ({ value, label: value })) }];
  return <main id="main" className="page-shell"><div className="breadcrumb container"><Link href="/">{en ? "Home" : "首頁"}</Link><span>/</span><span>{en ? "Jewellery" : "所有珠寶"}</span></div><header className="page-heading container"><p className="eyebrow">THE IARA COLLECTION</p><h1>{en ? "All jewellery" : "所有珠寶"}</h1><p>{en ? "Discover pieces shaped by light, from everyday signatures to remarkable moments." : "由日常微光到珍貴時刻，探索 Iara 以寶石與手工線條雕琢的完整系列。"}</p></header><div className="shop-toolbar"><div className="shop-toolbar-inner container"><strong>{en ? `${products.length} pieces` : `${products.length} 件作品`}</strong><form className="shop-search" action="/shop"><Search size={16} /><input name="q" defaultValue={term} placeholder={en ? "Search pieces, gemstones or collections" : "搜尋作品、寶石或系列"} aria-label={en ? "Search jewellery" : "搜尋作品"} /><select name="sort" defaultValue={typeof query.sort === "string" ? query.sort : "newest"} aria-label={en ? "Sort" : "排序"}><option value="newest">{en ? "Newest" : "最新上架"}</option><option value="price-asc">{en ? "Price: low to high" : "價格由低至高"}</option><option value="price-desc">{en ? "Price: high to low" : "價格由高至低"}</option></select><button className="button button-primary">{en ? "Apply" : "套用"}</button></form></div></div><div className="shop-layout container"><form className="filter-sidebar" action="/shop">{filters.map((filter) => <fieldset key={filter.key}><legend>{filter.label}</legend>{filter.options.map((option) => <label key={option.value}><input type="checkbox" name={filter.key} value={option.value} defaultChecked={array(query[filter.key]).includes(option.value)} />{option.label}</label>)}</fieldset>)}<button className="button button-primary">{en ? "Update filters" : "更新篩選"}</button></form><section className="shop-results"><div className="active-filter-row">{chips.map(([key,value]) => <span className="filter-chip" key={`${key}-${value}`}>{value}</span>)}</div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : <div className="empty-state"><h2>{en ? "No matching pieces" : "未找到相符作品"}</h2><p>{en ? "Try another search or adjust your filters." : "請調整篩選條件或搜尋其他字詞。"}</p><Link className="button button-primary" href="/shop">{en ? "View all jewellery" : "查看所有珠寶"}</Link></div>}</section></div></main>;
}
