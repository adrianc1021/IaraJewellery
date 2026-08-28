"use client";

import { CalendarDays, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Variant = { id: string; optionName: string; stockOnHand: number; stockReserved: number; active: boolean };
export function ProductPurchase({ productId, slug, variants, locale = "zh-HK" }: { productId: string; slug: string; variants: Variant[]; locale?: Locale }) {
  const [selected, setSelected] = useState(variants.length === 1 ? variants[0]?.id || "" : "");
  const [wished, setWished] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const en = locale === "en";
  const availableStock = variants.reduce((total, variant) => total + Math.max(0, variant.stockOnHand - variant.stockReserved), 0);
  async function add() {
    if (!selected) { setMessage(en ? "Please select a size." : "請先選擇尺寸。" ); return; }
    setBusy(true);
    const response = await fetch("/api/cart/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: selected, quantity: 1 }) });
    const data = await response.json();
    setMessage(response.ok ? (en ? "Added to your shopping bag." : "作品已加入購物袋。") : data.error);
    setBusy(false);
  }
  async function wish() {
    const response = await fetch("/api/wishlist", { method: wished ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId }) });
    if (response.status === 401) { location.href = `/login?next=/product/${slug}`; return; }
    if (response.ok) setWished(!wished);
  }
  return <div className="product-purchase"><p className="variant-label">{en ? "Select size / length" : "選擇尺寸／鏈長"}</p><div className="variant-grid" role="radiogroup" aria-label={en ? "Size or length" : "尺寸或鏈長"}>{variants.map((variant) => { const available = variant.active && variant.stockOnHand - variant.stockReserved > 0; return <button key={variant.id} className={`variant-button ${selected === variant.id ? "selected" : ""}`} role="radio" aria-checked={selected === variant.id} disabled={!available} onClick={() => { setSelected(variant.id); setMessage(""); }}>{variant.optionName}</button>; })}</div><p className="availability">{availableStock > 0 ? (en ? `In stock (${availableStock}) · Delivery in 2–3 business days` : `現貨（${availableStock} 件）· 預計 2–3 個工作天送達`) : (en ? "Made to order · Delivery date confirmed by our consultant" : "訂製製作 · 送達日期由珠寶顧問確認")}</p>{message && <p className={message.includes("已加入") || message.includes("Added") ? "form-success" : "form-error"} role="status">{message}</p>}<div className="purchase-row"><button className="button button-primary" disabled={busy} onClick={add}><ShoppingBag size={16} />{busy ? (en ? "Adding…" : "加入中…") : (en ? "Add to bag" : "加入購物袋")}</button><button className={`purchase-wish ${wished ? "active" : ""}`} aria-label={en ? "Add to wishlist" : "加入願望清單"} aria-pressed={wished} onClick={wish}><Heart size={19} fill={wished ? "currentColor" : "none"} /></button></div><div className="purchase-secondary-actions"><a className="text-link" href="/appointment"><CalendarDays size={14} />{en ? "Book a private viewing" : "預約私人鑑賞"}</a><a className="text-link" href={`https://wa.me/85221808208?text=${encodeURIComponent(en ? `Hello, I would like to ask about ${slug}.` : `你好，我想查詢 ${slug}。`)}`} target="_blank" rel="noreferrer">{en ? "WhatsApp a jewellery consultant" : "WhatsApp 珠寶顧問"}</a></div></div>;
}
