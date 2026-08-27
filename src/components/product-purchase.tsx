"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

type Variant = { id: string; optionName: string; stockOnHand: number; stockReserved: number; active: boolean };
export function ProductPurchase({ productId, slug, variants }: { productId: string; slug: string; variants: Variant[] }) {
  const [selected, setSelected] = useState(variants.length === 1 ? variants[0]?.id || "" : "");
  const [wished, setWished] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function add() {
    if (!selected) { setMessage("請先選擇尺寸。" ); return; }
    setBusy(true);
    const response = await fetch("/api/cart/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: selected, quantity: 1 }) });
    const data = await response.json();
    setMessage(response.ok ? "作品已加入購物袋。" : data.error);
    setBusy(false);
  }
  async function wish() {
    const response = await fetch("/api/wishlist", { method: wished ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId }) });
    if (response.status === 401) { location.href = `/login?next=/product/${slug}`; return; }
    if (response.ok) setWished(!wished);
  }
  return <><p className="variant-label">選擇尺寸</p><div className="variant-grid" role="radiogroup" aria-label="尺寸">{variants.map((variant) => { const available = variant.active && variant.stockOnHand - variant.stockReserved > 0; return <button key={variant.id} className={`variant-button ${selected === variant.id ? "selected" : ""}`} role="radio" aria-checked={selected === variant.id} disabled={!available} onClick={() => { setSelected(variant.id); setMessage(""); }}>{variant.optionName}</button>; })}</div><p className="availability">現貨 · 預計 2–3 個工作天送達</p>{message && <p className={message.includes("已加入") ? "form-success" : "form-error"} role="status">{message}</p>}<div className="purchase-row"><button className="button button-primary" disabled={busy} onClick={add}><ShoppingBag size={16} />{busy ? "加入中…" : "加入購物袋"}</button><button className={`purchase-wish ${wished ? "active" : ""}`} aria-label="加入願望清單" aria-pressed={wished} onClick={wish}><Heart size={19} fill={wished ? "currentColor" : "none"} /></button></div></>;
}
