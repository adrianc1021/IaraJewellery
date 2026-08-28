"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Gift, MapPin, Minus, Plus, RefreshCcw, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

type CartItem = {
  id: string;
  quantity: number;
  sku: string;
  optionName: string;
  unitPriceMinor: number;
  lineTotalMinor: number;
  available: number;
  product: {
    slug: string;
    name: string;
    collection: string;
    material: string;
    gemstone: string;
    image: string;
  };
};

type Cart = { itemCount: number; subtotalMinor: number; items: CartItem[] };
type PaymentMethod = { code: string; nameZh: string; nameEn: string };

export function CartClient({ locale = "zh-HK", paymentMethods }: { locale?: Locale; paymentMethods: PaymentMethod[] }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const en = locale === "en";

  async function load() {
    const response = await fetch("/api/cart");
    if (!response.ok) throw new Error("cart");
    setCart(await response.json());
  }

  useEffect(() => {
    load().catch(() => setError(en ? "Unable to load your shopping bag." : "暫時未能載入購物袋。"));
  }, [en]);

  async function update(id: string, quantity: number) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/cart/items/${id}`, {
        method: quantity < 1 ? "DELETE" : "PATCH",
        headers: { "content-type": "application/json" },
        ...(quantity < 1 ? {} : { body: JSON.stringify({ quantity }) })
      });
      const data = await response.json();
      if (response.ok) setCart(data);
      else setError(data.error || (en ? "Unable to update this piece." : "暫時未能更新作品。"));
    } catch {
      setError(en ? "Unable to update this piece." : "暫時未能更新作品。");
    } finally {
      setUpdatingId("");
    }
  }

  const paymentNames = paymentMethods.map((method) => en ? method.nameEn : method.nameZh).join(" · ");

  if (!cart) return <div className="loading-state"><div className="spinner" /></div>;

  if (!cart.items.length) return <div className="cart-empty-wrap container"><div className="empty-state cart-empty"><ShoppingEmpty /><p className="eyebrow">IARA SHOPPING BAG</p><h1>{en ? "Your shopping bag is empty" : "你的購物袋仍是空的"}</h1><p>{en ? "Discover jewellery shaped by light, crafted to stay with you." : "探索由光塑造、值得長久相伴的珠寶作品。"}</p><Link className="button button-primary" href="/shop">{en ? "Explore all jewellery" : "探索所有珠寶"}</Link></div><CartExperience locale={locale} paymentNames={paymentNames} /></div>;

  return <>
    <div className="cart-layout container">
      <section className="cart-main">
        <header className="cart-heading">
          <div><p className="eyebrow">IARA SHOPPING BAG</p><h1>{en ? "Shopping bag" : "購物袋"}</h1></div>
          <span>{cart.itemCount} {en ? (cart.itemCount === 1 ? "piece" : "pieces") : "件作品"}</span>
        </header>

        <div className="cart-notice"><RefreshCcw size={16} /><span>{en ? "Complimentary Hong Kong delivery and 14-day returns on eligible pieces." : "合資格作品可享香港免費配送及 14 天退換服務。"}</span></div>
        <p className="cart-detail-note">{en ? "Stone weight, dimensions and appearance may vary slightly between individual pieces. Product details are confirmed before dispatch." : "天然寶石重量、尺寸及外觀或因每件作品略有不同；出貨前會再次確認產品資料。"}</p>
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="cart-lines">
          {cart.items.map((item) => {
            const busy = updatingId === item.id;
            const details = [item.product.material, item.product.gemstone].filter((value) => value && value !== "無寶石" && value !== "No gemstone").join(" · ");
            return <article className={`cart-line ${busy ? "updating" : ""}`} key={item.id}>
              <Link className="cart-line-image" href={`/product/${item.product.slug}`}><Image src={item.product.image} alt={item.product.name} fill sizes="(max-width: 680px) 112px, 180px" /></Link>
              <div className="cart-line-content">
                <div className="cart-line-top"><div><p className="cart-line-collection">{item.product.collection}</p><h2><Link href={`/product/${item.product.slug}`}>{item.product.name}</Link></h2></div><strong>{formatMoney(item.lineTotalMinor)}</strong></div>
                {details && <p className="cart-line-material">{details}</p>}
                <dl className="cart-line-specs"><div><dt>{en ? "Selection" : "款式／尺寸"}</dt><dd>{item.optionName}</dd></div><div><dt>{en ? "Reference" : "產品編號"}</dt><dd>{item.sku}</dd></div></dl>
                <p className="cart-availability"><Check size={13} />{en ? "Available for complimentary Hong Kong delivery" : "現貨可享香港免費配送"}</p>
                <div className="cart-line-actions">
                  <div className="quantity-control" aria-label={en ? "Quantity" : "數量"}>
                    <button aria-label={en ? "Decrease quantity" : "減少數量"} disabled={busy} onClick={() => update(item.id, item.quantity - 1)}><Minus size={13} /></button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button aria-label={en ? "Increase quantity" : "增加數量"} disabled={busy || item.quantity >= item.available} onClick={() => update(item.id, item.quantity + 1)}><Plus size={13} /></button>
                  </div>
                  <button className="cart-remove" disabled={busy} onClick={() => update(item.id, 0)}><Trash2 size={14} />{en ? "Remove" : "移除"}</button>
                </div>
                <div className="cart-gift-service"><Gift size={15} /><span><strong>{en ? "Iara signature gift packaging included" : "已包括 Iara 專屬禮盒包裝"}</strong><small>{en ? "You can add a personal gift message during checkout." : "可於結帳時加入個人禮物訊息。"}</small></span></div>
              </div>
            </article>;
          })}
        </div>
        <Link className="cart-continue" href="/shop"><ArrowLeft size={14} />{en ? "Continue shopping" : "繼續選購"}</Link>
      </section>

      <aside className="order-summary">
        <p className="eyebrow">ORDER SUMMARY</p><h2>{en ? "Order summary" : "訂單摘要"}</h2>
        <div className="summary-row"><span>{en ? `Subtotal (${cart.itemCount})` : `小計（${cart.itemCount}）`}</span><span>{formatMoney(cart.subtotalMinor)}</span></div>
        <div className="summary-row"><span>{en ? "Hong Kong delivery" : "香港配送"}</span><span>{en ? "Complimentary" : "免費"}</span></div>
        <div className="summary-row total"><span>{en ? "Total" : "總額"}</span><span>{formatMoney(cart.subtotalMinor)}</span></div>
        <Link className="button button-primary" href="/checkout"><ShieldCheck size={16} />{en ? "Proceed to secure checkout" : "前往安全結帳"}</Link>
        <p className="summary-note">{en ? "Price, promotion and availability are securely verified at checkout." : "價格、優惠及庫存會於結帳時安全地重新驗證。"}</p>
        <div className="summary-assurances"><span><ShieldCheck size={15} />{en ? "Secure payment" : "安全付款"}</span><span><RefreshCcw size={15} />{en ? "14-day returns" : "14 天退換"}</span><span><Truck size={15} />{en ? "Complimentary delivery" : "免費配送"}</span></div>
        <div className="summary-help"><strong>{en ? "Need personal assistance?" : "需要專人協助？"}</strong><p>{en ? "Our jewellery consultants can advise on sizing, gifting and delivery." : "珠寶顧問可協助處理尺寸、送禮及配送安排。"}</p><Link href="/appointment">{en ? "Speak with a consultant" : "聯絡珠寶顧問"}</Link></div>
      </aside>
    </div>
    <CartExperience locale={locale} paymentNames={paymentNames} />
  </>;
}

function CartExperience({ locale, paymentNames }: { locale: Locale; paymentNames: string }) {
  const en = locale === "en";
  const items = [
    { Icon: Truck, title: en ? "Delivery and returns" : "配送及退換", copy: en ? "Complimentary Hong Kong delivery and 14-day returns on eligible pieces." : "合資格作品可享香港免費配送及 14 天退換。" },
    { Icon: MapPin, title: en ? "Central atelier collection" : "中環工作室領取", copy: en ? "Arrange a considered handover with our jewellery team." : "可預約由珠寶團隊於工作室親自交付。" },
    { Icon: CreditCard, title: en ? "Secure payment" : "安全付款", copy: paymentNames || (en ? "Secure payment options are shown at checkout." : "可用付款方式將於結帳時顯示。") },
    { Icon: ShieldCheck, title: en ? "Authenticity assured" : "真品保證", copy: en ? "Every piece is inspected and documented before delivery." : "每件作品出貨前均經品質檢查及資料記錄。" }
  ];
  return <section className="cart-experience" aria-label={en ? "The Iara experience" : "The Iara Experience"}>{items.map(({ Icon, title, copy }) => <article key={title}><Icon size={21} /><div><h3>{title}</h3><p>{copy}</p></div></article>)}</section>;
}

function ShoppingEmpty() { return <span className="cart-empty-icon" aria-hidden="true"><ShoppingBag size={30} /></span>; }
