"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
type Cart = { itemCount: number; subtotalMinor: number; items: Array<{ id: string; quantity: number; optionName: string; unitPriceMinor: number; lineTotalMinor: number; product: { slug: string; name: string; image: string } }> };
export function CartClient({ locale = "zh-HK" }: { locale?: Locale }) {
  const [cart, setCart] = useState<Cart | null>(null); const [error, setError] = useState("");
  const en = locale === "en";
  async function load() { const response = await fetch("/api/cart"); setCart(await response.json()); }
  useEffect(() => { load().catch(() => setError(en ? "Unable to load your shopping bag." : "暫時未能載入購物袋。")); }, [en]);
  async function update(id: string, quantity: number) { const response = await fetch(`/api/cart/items/${id}`, { method: quantity < 1 ? "DELETE" : "PATCH", headers: { "content-type": "application/json" }, ...(quantity < 1 ? {} : { body: JSON.stringify({ quantity }) }) }); const data = await response.json(); if (response.ok) setCart(data); else setError(data.error); }
  if (!cart) return <div className="loading-state"><div className="spinner" /></div>;
  if (!cart.items.length) return <div className="empty-state"><ShoppingEmpty /><h2>{en ? "Your shopping bag is empty" : "你的購物袋仍是空的"}</h2><p>{en ? "Discover a piece shaped to stay with you." : "讓一件閃耀新作陪你回家。"}</p><Link className="button button-primary" href="/shop">{en ? "Explore all jewellery" : "探索所有珠寶"}</Link></div>;
  return <div className="cart-layout container"><section><h1>{en ? "Shopping bag" : "購物袋"}</h1><p className="muted">{cart.itemCount} {en ? "pieces" : "件作品"}</p>{error && <p className="form-error">{error}</p>}{cart.items.map((item) => <article className="cart-line" key={item.id}><Link className="cart-line-image" href={`/product/${item.product.slug}`}><Image src={item.product.image} alt={item.product.name} fill sizes="110px" /></Link><div><h2><Link href={`/product/${item.product.slug}`}>{item.product.name}</Link></h2><p>{en ? "Size" : "尺寸"}：{item.optionName}</p><p>{formatMoney(item.unitPriceMinor)}</p><div className="quantity-control"><button aria-label={en ? "Decrease quantity" : "減少數量"} onClick={() => update(item.id, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={en ? "Increase quantity" : "增加數量"} onClick={() => update(item.id, item.quantity + 1)}><Plus size={13} /></button></div></div><button className="remove-button" aria-label={en ? "Remove item" : "移除商品"} onClick={() => update(item.id, 0)}><Trash2 size={17} /></button></article>)}</section><aside className="order-summary"><h2>{en ? "Order summary" : "訂單摘要"}</h2><div className="summary-row"><span>{en ? "Subtotal" : "小計"}</span><span>{formatMoney(cart.subtotalMinor)}</span></div><div className="summary-row"><span>{en ? "Hong Kong delivery" : "香港配送"}</span><span>{en ? "Complimentary" : "免費"}</span></div><div className="summary-row total"><span>{en ? "Total" : "總額"}</span><span>{formatMoney(cart.subtotalMinor)}</span></div><Link className="button button-primary" href="/checkout">{en ? "Secure checkout" : "前往安全結帳"}</Link><p className="muted" style={{fontSize:9,marginTop:12}}>{en ? "Price and availability are verified securely at checkout." : "價格及庫存將於結帳時由伺服器重新驗證。"}</p></aside></div>;
}
function ShoppingEmpty() { return <span aria-hidden="true" style={{fontFamily:"var(--serif)",fontSize:44,color:"var(--green)"}}>◇</span>; }
