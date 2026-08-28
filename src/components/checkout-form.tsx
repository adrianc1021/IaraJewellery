"use client";

import Link from "next/link";
import { Banknote, CreditCard, MapPin, Smartphone, Store } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type PaymentMethod = { code: string; nameZh: string; nameEn: string; instructionsZh: string | null; instructionsEn: string | null };
type DeliveryMethod = "DELIVERY" | "PICKUP";
type RegionCode = keyof typeof regions;

const regions = {
  HK_ISLAND: {
    zh: "香港島",
    en: "Hong Kong Island",
    districts: [
      ["中西區", "Central and Western"], ["灣仔區", "Wan Chai"], ["東區", "Eastern"], ["南區", "Southern"]
    ]
  },
  KOWLOON: {
    zh: "九龍",
    en: "Kowloon",
    districts: [
      ["油尖旺區", "Yau Tsim Mong"], ["深水埗區", "Sham Shui Po"], ["九龍城區", "Kowloon City"], ["黃大仙區", "Wong Tai Sin"], ["觀塘區", "Kwun Tong"]
    ]
  },
  NEW_TERRITORIES: {
    zh: "新界",
    en: "New Territories",
    districts: [
      ["葵青區", "Kwai Tsing"], ["荃灣區", "Tsuen Wan"], ["屯門區", "Tuen Mun"], ["元朗區", "Yuen Long"], ["北區", "North"], ["大埔區", "Tai Po"], ["沙田區", "Sha Tin"], ["西貢區", "Sai Kung"]
    ]
  },
  ISLANDS: {
    zh: "離島區",
    en: "Islands",
    districts: [["離島區", "Islands"]]
  }
} as const;

type AddressState = { region: RegionCode | ""; district: string; addressLine: string; building: string; floor: string; unit: string };
const emptyAddress: AddressState = { region: "", district: "", addressLine: "", building: "", floor: "", unit: "" };

export function CheckoutForm({ methods, locale = "zh-HK" }: { methods: PaymentMethod[]; locale?: Locale }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY");
  const [address, setAddress] = useState<AddressState>(emptyAddress);
  const en = locale === "en";
  const districtOptions = address.region ? regions[address.region].districts : [];
  const shippingAddress = useMemo(() => formatAddress(address, locale), [address, locale]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    raw.shippingAddress = deliveryMethod === "DELIVERY" ? shippingAddress : "";
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify(raw)
    });
    const data = await response.json();
    if (response.ok) {
      setOrder(data);
      setMessage(data.message || (en ? "Complete payment in the secure payment form." : "請在安全付款元件完成付款。"));
    } else {
      setMessage(en ? "We could not create your order. Check the delivery and payment details, then try again." : data.error);
    }
    setBusy(false);
  }

  if (order) return <div className="empty-state"><h2>{en ? `Order ${order.orderNumber} created` : `訂單 ${order.orderNumber} 已建立`}</h2><p>{message}</p><Link className="button button-primary" href={`/order-confirmation/${order.orderId}`}>{en ? "View order status" : "查看訂單狀態"}</Link></div>;

  return <form className="form-grid" onSubmit={submit}>
    <div className="field"><label htmlFor="customerName">{en ? "Name" : "姓名"}</label><input id="customerName" name="customerName" autoComplete="name" required /></div>
    <div className="field"><label htmlFor="checkout-phone">{en ? "Phone" : "電話"}</label><input id="checkout-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required /></div>
    <div className="field full"><label htmlFor="checkout-email">{en ? "Email" : "電郵"}</label><input id="checkout-email" name="email" type="email" autoComplete="email" required /></div>
    <div className="field full"><label htmlFor="deliveryMethod">{en ? "Delivery method" : "取貨方式"}</label><select id="deliveryMethod" name="deliveryMethod" value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value as DeliveryMethod)}><option value="DELIVERY">{en ? "Hong Kong delivery" : "香港配送"}</option><option value="PICKUP">{en ? "Collect from Central atelier" : "中環工作室自取"}</option></select></div>

    {deliveryMethod === "DELIVERY" ? <fieldset className="checkout-address full">
      <legend>{en ? "Delivery address" : "配送地址"}</legend>
      <div className="checkout-address-heading"><MapPin size={19} /><div><strong>{en ? "Enter a Hong Kong address" : "輸入香港地址"}</strong><p>{en ? "Choose the area first, then add the building details." : "先選擇地區及分區，再填寫大廈資料。"}</p></div></div>
      <div className="checkout-address-grid">
        <div className="field"><label htmlFor="address-region">{en ? "Area" : "地區"}</label><select id="address-region" value={address.region} onChange={(event) => setAddress((current) => ({ ...current, region: event.target.value as RegionCode | "", district: "" }))} required><option value="">{en ? "Select area" : "選擇地區"}</option>{Object.entries(regions).map(([code, region]) => <option value={code} key={code}>{en ? region.en : region.zh}</option>)}</select></div>
        <div className="field"><label htmlFor="address-district">{en ? "District" : "分區"}</label><select id="address-district" value={address.district} onChange={(event) => setAddress((current) => ({ ...current, district: event.target.value }))} disabled={!address.region} required><option value="">{en ? "Select district" : "選擇分區"}</option>{districtOptions.map(([zh, districtEn]) => <option value={en ? districtEn : zh} key={zh}>{en ? districtEn : zh}</option>)}</select></div>
        <div className="field full"><label htmlFor="address-line">{en ? "Street, estate or village" : "街道、屋苑或鄉村"}</label><input id="address-line" value={address.addressLine} onChange={(event) => setAddress((current) => ({ ...current, addressLine: event.target.value }))} placeholder={en ? "e.g. 8 Queen's Road Central" : "例如：皇后大道中 8 號"} autoComplete="address-line1" required /></div>
        <div className="field full"><label htmlFor="address-building">{en ? "Building and block" : "大廈及座數"}<span>{en ? "Optional" : "選填"}</span></label><input id="address-building" value={address.building} onChange={(event) => setAddress((current) => ({ ...current, building: event.target.value }))} placeholder={en ? "Building name, block or tower" : "大廈名稱、座數或期數"} autoComplete="address-line2" /></div>
        <div className="field"><label htmlFor="address-floor">{en ? "Floor" : "樓層"}<span>{en ? "Optional" : "選填"}</span></label><input id="address-floor" value={address.floor} onChange={(event) => setAddress((current) => ({ ...current, floor: event.target.value }))} placeholder={en ? "e.g. 12" : "例如：12"} /></div>
        <div className="field"><label htmlFor="address-unit">{en ? "Flat / unit" : "室／單位"}<span>{en ? "Optional" : "選填"}</span></label><input id="address-unit" value={address.unit} onChange={(event) => setAddress((current) => ({ ...current, unit: event.target.value }))} placeholder={en ? "e.g. A" : "例如：A"} /></div>
      </div>
      <div className="address-preview" aria-live="polite"><span>{en ? "Address preview" : "地址預覽"}</span><strong>{shippingAddress || (en ? "Your complete delivery address will appear here." : "完整配送地址會顯示在這裡。")}</strong></div>
      <input type="hidden" name="shippingAddress" value={shippingAddress} />
    </fieldset> : <div className="pickup-note full"><Store size={20} /><div><strong>{en ? "Collect from our Central atelier" : "中環工作室自取"}</strong><p>{en ? "Our team will contact you when your order is ready. No delivery address is required." : "作品準備好後，團隊會聯絡你安排領取，毋須填寫配送地址。"}</p></div></div>}

    <fieldset className="checkout-payment full"><legend>{en ? "Payment method" : "付款方式"}</legend><div>{methods.map((method, index) => { const Icon = method.code === "CASH" ? Banknote : method.code === "CREDIT_CARD" ? CreditCard : Smartphone; return <label key={method.code}><input type="radio" name="paymentMethod" value={method.code} defaultChecked={index === 0} /><span><Icon size={18} /><strong>{en ? method.nameEn : method.nameZh}</strong><small>{en ? method.instructionsEn : method.instructionsZh}</small></span></label>; })}</div></fieldset>
    <div className="field"><label htmlFor="promotionCode">{en ? "Promotion code" : "優惠碼"}</label><input id="promotionCode" name="promotionCode" placeholder="WELCOME10" /></div>
    <div className="field"><label htmlFor="giftMessage">{en ? "Gift message" : "禮物訊息"}</label><input id="giftMessage" name="giftMessage" /></div>
    {message && <p className="form-error field full">{message}</p>}
    <button className="button button-primary field full" disabled={busy || !methods.length}>{busy ? (en ? "Verifying price and availability…" : "驗證價格及庫存…") : (en ? "Continue securely" : "建立安全付款")}</button>
    <p className="muted field full" style={{ fontSize: 9 }}>{en ? "Price, promotion and availability are verified again before the order is created. Online payment is confirmed only by a signed provider notification." : "送出後系統會重新驗證價格、優惠與庫存。網上付款成功只以供應商簽名通知為準。"}</p>
  </form>;
}

function formatAddress(address: AddressState, locale: Locale) {
  if (!address.region || !address.district || !address.addressLine.trim()) return "";
  const region = regions[address.region];
  if (locale === "en") {
    const floorUnit = [address.unit && `Flat ${address.unit}`, address.floor && `${address.floor}/F`].filter(Boolean).join(", ");
    return [floorUnit, address.building, address.addressLine, address.district, region.en, "Hong Kong"].filter(Boolean).join(", ");
  }
  const floorUnit = [address.floor && `${address.floor}樓`, address.unit && `${address.unit}室`].filter(Boolean).join("");
  return ["香港", region.zh, address.district, address.addressLine, address.building, floorUnit].filter(Boolean).join(" ");
}
