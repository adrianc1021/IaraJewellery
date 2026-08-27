import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "所有珠寶", description: "探索 Iara Jewellery 全部珠寶作品。" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const array = (value: string | string[] | undefined) => value ? (Array.isArray(value) ? value : [value]) : [];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const categories = array(query.category), collections = array(query.collection), materials = array(query.material);
  const term = typeof query.q === "string" ? query.q : "";
  const products = await db.product.findMany({ where: { status: "ACTIVE", ...(categories.length ? { category: { in: categories } } : {}), ...(collections.length ? { collection: { in: collections } } : {}), ...(materials.length ? { material: { in: materials } } : {}), ...(term ? { OR: [{ nameZh: { contains: term } }, { nameEn: { contains: term } }, { collection: { contains: term } }] } : {}) }, include: { variants: { orderBy: { priceMinor: "asc" } } }, orderBy: { createdAt: "desc" } });
  if (query.sort === "price-asc") products.sort((a, b) => (a.variants[0]?.priceMinor || 0) - (b.variants[0]?.priceMinor || 0));
  if (query.sort === "price-desc") products.sort((a, b) => (b.variants[0]?.priceMinor || 0) - (a.variants[0]?.priceMinor || 0));
  const filterData = await db.product.findMany({ where: { status: "ACTIVE" }, select: { category: true, collection: true, material: true } });
  const unique = (key: keyof typeof filterData[number]) => [...new Set(filterData.map((item) => item[key]))].sort();
  const chips = [...categories.map((value) => ["category", value]), ...collections.map((value) => ["collection", value]), ...materials.map((value) => ["material", value])];
  return <main id="main" className="page-shell"><div className="breadcrumb container"><Link href="/">首頁</Link><span>/</span><span>所有珠寶</span></div><header className="page-heading container"><p className="eyebrow">THE IARA COLLECTION</p><h1>所有珠寶</h1><p>由日常微光到珍貴時刻，探索 Iara 以寶石與手工線條雕琢的完整系列。</p></header><div className="shop-toolbar"><div className="shop-toolbar-inner container"><strong>{products.length} 件作品</strong><form className="shop-search" action="/shop"><input name="q" defaultValue={term} placeholder="搜尋作品或系列" aria-label="搜尋作品" /><select name="sort" defaultValue={typeof query.sort === "string" ? query.sort : "newest"} aria-label="排序"><option value="newest">最新上架</option><option value="price-asc">價格由低至高</option><option value="price-desc">價格由高至低</option></select><button className="button button-primary">套用</button></form></div></div><div className="shop-layout container"><form className="filter-sidebar" action="/shop">{[["category","珠寶分類",unique("category")],["collection","系列",unique("collection")],["material","材質",unique("material")]].map(([key,label,values]) => <fieldset key={String(key)}><legend>{String(label)}</legend>{(values as string[]).map((value) => <label key={value}><input type="checkbox" name={String(key)} value={value} defaultChecked={array(query[String(key)]).includes(value)} />{value}</label>)}</fieldset>)}<button className="button button-primary">更新篩選</button></form><section className="shop-results"><div className="active-filter-row">{chips.map(([key,value]) => <span className="filter-chip" key={`${key}-${value}`}>{value}</span>)}</div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>未找到相符作品</h2><p>請調整篩選條件或搜尋其他字詞。</p><Link className="button button-primary" href="/shop">查看所有珠寶</Link></div>}</section></div></main>;
}
