"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function MemberProfileForm({ initial, locale = "zh-HK" }: { initial: { name: string; phone: string | null; locale: string; marketingConsent: boolean }; locale?: Locale }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const en = locale === "en";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: raw.name, phone: raw.phone, locale: raw.locale, marketingConsent: raw.marketingConsent === "on" }) });
    const data = await response.json(); setBusy(false); setMessage(response.ok ? (en ? "Member profile updated." : "會員資料已更新。") : (en ? "The profile could not be updated." : data.error || "未能更新資料。"));
  }
  return <form className="member-profile-form" onSubmit={submit}><div className="field"><label htmlFor="member-name">{en ? "Name" : "姓名"}</label><input id="member-name" name="name" defaultValue={initial.name} required /></div><div className="field"><label htmlFor="member-phone">{en ? "Phone" : "電話"}</label><input id="member-phone" name="phone" defaultValue={initial.phone || ""} /></div><div className="field"><label htmlFor="member-locale">{en ? "Communication language" : "通訊語言"}</label><select id="member-locale" name="locale" defaultValue={initial.locale}><option value="zh-HK">繁體中文</option><option value="en">English</option></select></div><label className="checkbox-field"><input name="marketingConsent" type="checkbox" defaultChecked={initial.marketingConsent} />{en ? "Receive new collection, private event and member privilege updates" : "接收新品、私人活動及會員禮遇"}</label><button className="button button-primary" disabled={busy}><Save size={15} />{busy ? (en ? "Saving..." : "正在儲存…") : (en ? "Save profile" : "儲存個人資料")}</button>{message && <span className={message.includes("could not") || message.includes("未能") ? "form-error" : "form-success"} role="status">{message}</span>}</form>;
}
