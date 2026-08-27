"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

type ProductCardProps = { product: { id: string; slug: string; nameZh: string; collection: string; badge: string | null; imagesJson: string; variants: { id: string; priceMinor: number; optionName: string; active: boolean }[] } };

export function ProductCard({ product }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [message, setMessage] = useState("");
  const images = JSON.parse(product.imagesJson) as string[];
  const activeVariants = product.variants.filter((variant) => variant.active);
  const first = activeVariants[0];
  async function wishlist() {
    const response = await fetch("/api/wishlist", { method: wished ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    if (response.status === 401) { location.href = `/login?next=/product/${product.slug}`; return; }
    if (response.ok) setWished(!wished);
  }
  async function quickAdd() {
    if (activeVariants.length !== 1) { location.href = `/product/${product.slug}`; return; }
    const response = await fetch("/api/cart/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: first.id, quantity: 1 }) });
    setMessage(response.ok ? "已加入購物袋" : "暫時未能加入");
    setTimeout(() => setMessage(""), 1800);
  }
  return <article className="product-card reveal-item"><div className="product-media"><Link href={`/product/${product.slug}`}><Image src={images[0]} alt={product.nameZh} fill sizes="(max-width: 680px) 50vw, 25vw" /></Link>{product.badge && <span className="badge">{product.badge}</span>}<button className={`product-wish ${wished ? "active" : ""}`} aria-label={wished ? "取消收藏" : "加入願望清單"} aria-pressed={wished} onClick={wishlist}><Heart size={18} fill={wished ? "currentColor" : "none"} /></button><button className="quick-action" onClick={quickAdd}>{activeVariants.length === 1 ? "加入購物袋" : "選擇尺寸"}</button></div><div className="product-meta"><small>{product.collection}</small><h3><Link href={`/product/${product.slug}`}>{product.nameZh}</Link></h3><p>{first ? formatMoney(first.priceMinor) : "價格待定"}</p>{message && <span className="form-success" role="status">{message}</span>}</div></article>;
}
