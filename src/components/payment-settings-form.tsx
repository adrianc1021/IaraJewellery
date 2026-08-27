"use client";

import { useState } from "react";
import { Banknote, CreditCard, Save, Smartphone } from "lucide-react";

type PaymentRow = { code: string; nameZh: string; nameEn: string; enabled: boolean; checkoutMode: string; instructionsZh: string | null };

export function PaymentSettingsForm({ initial }: { initial: PaymentRow[] }) {
  const [methods, setMethods] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/ops/payment-methods", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ methods: methods.map(({ code, enabled }) => ({ code, enabled })) }) });
    const data = await response.json(); setBusy(false); setMessage(response.ok ? "付款方式已發佈至結帳頁。" : data.error || "未能儲存設定。");
  }
  return <div className="payment-settings"><div className="payment-method-list">{methods.map((method, index) => { const Icon = method.code === "CASH" ? Banknote : method.code === "CREDIT_CARD" ? CreditCard : Smartphone; return <label key={method.code} className={method.enabled ? "enabled" : ""}><span className="payment-method-icon"><Icon size={19} /></span><span><strong>{method.nameZh}</strong><small>{method.nameEn} · {method.checkoutMode === "STRIPE" ? "網上即時付款" : "訂單後付款指示"}</small><em>{method.instructionsZh}</em></span><input type="checkbox" checked={method.enabled} onChange={(event) => setMethods((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: event.target.checked } : item))} /></label>; })}</div>
    <div className="layout-actions"><button className="button button-primary" onClick={save} disabled={busy}><Save size={15} />{busy ? "正在發佈…" : "儲存付款設定"}</button>{message && <span className={message.includes("未能") ? "form-error" : "form-success"} role="status">{message}</span>}</div>
  </div>;
}
