"use client";
import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";

export function AddressForm({ locale = "zh-HK" }: { locale?: Locale }) {
  const [message, setMessage] = useState("");
  const en = locale === "en";
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch("/api/account/addresses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); setMessage(response.ok ? (en ? "Address saved." : "地址已儲存。") : (en ? "The address could not be saved. Check the details and try again." : data.error)); if (response.ok) location.reload(); }
  return <form className="form-grid" onSubmit={submit}><div className="field"><label htmlFor="recipient">{en ? "Recipient" : "收件人"}</label><input id="recipient" name="recipient" required /></div><div className="field"><label htmlFor="address-phone">{en ? "Phone" : "電話"}</label><input id="address-phone" name="phone" required /></div><div className="field full"><label htmlFor="line1">{en ? "Address" : "地址"}</label><input id="line1" name="line1" required /></div><div className="field"><label htmlFor="district">{en ? "District" : "地區"}</label><input id="district" name="district" required /></div><div className="field"><label htmlFor="label">{en ? "Label" : "標籤"}</label><input id="label" name="label" defaultValue={en ? "Primary address" : "主要地址"} /></div><label className="checkbox-field field full"><input name="isDefault" type="checkbox" />{en ? "Set as default address" : "設為預設地址"}</label>{message && <p className={message.includes("saved") || message.includes("已儲存") ? "form-success field full" : "form-error field full"}>{message}</p>}<button className="button button-primary field full">{en ? "Save address" : "儲存地址"}</button></form>;
}
