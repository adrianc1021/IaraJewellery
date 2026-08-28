"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { localizeProductValue } from "@/lib/product-i18n";

type ProductCardProps = { locale?: Locale; product: { id: string; slug: string; nameZh: string; nameEn?: string; collection: string; material?: string; gemstone?: string; badge: string | null; imagesJson: string; variants: { id: string; priceMinor: number; optionName: string; active: boolean; stockOnHand?: number; stockReserved?: number }[] } };

export function ProductCard({ product, locale = "zh-HK" }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [message, setMessage] = useState("");
  const images = JSON.parse(product.imagesJson) as string[];
  const activeVariants = product.variants.filter((variant) => variant.active);
  const first = activeVariants[0];
  const available = activeVariants.reduce((total, variant) => total + Math.max(0, (variant.stockOnHand || 0) - (variant.stockReserved || 0)), 0);
  const en = locale === "en";
  const name = en && product.nameEn ? product.nameEn : product.nameZh;
  async function wishlist() {
    const response = await fetch("/api/wishlist", { method: wished ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    if (response.status === 401) { location.href = `/login?next=/product/${product.slug}`; return; }
    if (response.ok) setWished(!wished);
  }
  async function quickAdd() {
    if (activeVariants.length !== 1) { location.href = `/product/${product.slug}`; return; }
    const response = await fetch("/api/cart/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: first.id, quantity: 1 }) });
    setMessage(response.ok ? (en ? "Added to bag" : "已加入購物袋") : (en ? "Unable to add" : "暫時未能加入"));
    setTimeout(() => setMessage(""), 1800);
  }
  return <article className="product-card reveal-item"><div className="product-media"><Link href={`/product/${product.slug}`}><Image src={images[0]} alt={name} fill sizes="(max-width: 680px) 50vw, 25vw" /></Link>{product.badge && <span className="badge">{product.badge}</span>}<button className={`product-wish ${wished ? "active" : ""}`} aria-label={wished ? (en ? "Remove from wishlist" : "取消收藏") : (en ? "Add to wishlist" : "加入願望清單")} aria-pressed={wished} onClick={wishlist}><Heart size={18} fill={wished ? "currentColor" : "none"} /></button><button className="quick-action" onClick={quickAdd}>{activeVariants.length === 1 ? (en ? "Add to bag" : "加入購物袋") : (en ? "Choose options" : "選擇款式" )}</button></div><div className="product-meta"><small>{product.collection}</small><h3><Link href={`/product/${product.slug}`}>{name}</Link></h3>{product.material && <span className="product-card-material">{localizeProductValue(product.material, locale)}{product.gemstone ? ` · ${localizeProductValue(product.gemstone, locale)}` : ""}</span>}<div className="product-card-purchase"><p>{first ? formatMoney(first.priceMinor) : (en ? "Price on request" : "價格待定")}</p><span className={available > 0 ? "in-stock" : "made-to-order"}>{available > 0 ? (en ? "Available" : "現貨") : (en ? "Made to order" : "預訂製作")}</span></div>{message && <span className="form-success" role="status">{message}</span>}</div></article>;
}
