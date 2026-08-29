"use client";

import { ProductCard } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

type RailProduct = Parameters<typeof ProductCard>[0]["product"];

export function HomeProductRail({ products, locale }: { products: RailProduct[]; locale: Locale }) {
  return <div className="home-product-rail"><div className="home-product-track">{[0, 1].map((copy) => <div className="home-product-group" aria-hidden={copy === 1} inert={copy === 1} key={copy}>{products.map((product) => <ProductCard key={`${copy}-${product.id}`} product={product} locale={locale} />)}</div>)}</div></div>;
}
