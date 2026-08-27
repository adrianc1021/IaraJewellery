"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Megaphone, Plus } from "lucide-react";

type AnnouncementRow = { id: string; eyebrow: string | null; title: string; body: string; startsAt: string; endsAt: string; startsAtLabel: string; endsAtLabel: string; active: boolean; showOnce: boolean };

export function AnnouncementManager({ announcements }: { announcements: AnnouncementRow[] }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const body = { ...raw, startsAt: new Date(String(raw.startsAt)).toISOString(), endsAt: new Date(String(raw.endsAt)).toISOString(), active: raw.active === "on", showOnce: raw.showOnce === "on" };
    const response = await fetch("/api/ops/announcements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setBusy(false); setMessage(response.ok ? "通告已建立並按排期發佈。" : data.error || "未能建立通告。");
    if (response.ok) setTimeout(() => location.reload(), 700);
  }

  async function toggle(item: AnnouncementRow) {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/ops/announcements/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active: !item.active }) });
    const data = await response.json();
    setBusy(false); setMessage(response.ok ? `通告已${item.active ? "停用" : "啟用"}。` : data.error || "未能更新通告。");
    if (response.ok) setTimeout(() => location.reload(), 500);
  }

  return <div className="announcement-manager">
    <section className="ops-panel"><div className="ops-panel-head"><div><h2>建立彈出通告</h2><p>同一時間只顯示最近更新且在有效期內的通告。</p></div><Megaphone size={20} /></div><form className="announcement-form" onSubmit={create}>
      <div className="field"><label htmlFor="announce-eyebrow">小標題</label><input id="announce-eyebrow" name="eyebrow" placeholder="PRIVATE EVENT" maxLength={60} /></div>
      <div className="field"><label htmlFor="announce-title">主標題</label><input id="announce-title" name="title" required maxLength={80} /></div>
      <div className="field full"><label htmlFor="announce-body">通告內容</label><textarea id="announce-body" name="body" required maxLength={500} /></div>
      <div className="field"><label htmlFor="announce-cta">按鈕文字</label><input id="announce-cta" name="ctaLabel" placeholder="立即探索" maxLength={40} /></div>
      <div className="field"><label htmlFor="announce-link">按鈕連結</label><input id="announce-link" name="ctaHref" placeholder="/shop" /></div>
      <div className="field full"><label htmlFor="announce-image">圖片網址（HTTPS）</label><input id="announce-image" name="imageUrl" type="url" placeholder="https://images.unsplash.com/..." /></div>
      <div className="field"><label htmlFor="announce-start">開始時間</label><input id="announce-start" name="startsAt" type="datetime-local" required /></div>
      <div className="field"><label htmlFor="announce-end">結束時間</label><input id="announce-end" name="endsAt" type="datetime-local" required /></div>
      <label className="checkbox-field"><input name="active" type="checkbox" defaultChecked />立即啟用</label><label className="checkbox-field"><input name="showOnce" type="checkbox" defaultChecked />每位訪客只顯示一次</label>
      <button className="button button-primary full" disabled={busy}><Plus size={15} />{busy ? "正在建立…" : "建立通告"}</button>
    </form></section>
    <section className="ops-panel"><div className="ops-panel-head"><div><h2>通告紀錄</h2><p>{announcements.length} 個已建立通告</p></div></div><div className="announcement-list">{announcements.map((item) => <article key={item.id}><div className="announcement-status-icon">{item.active ? <Eye size={17} /> : <EyeOff size={17} />}</div><div><small>{item.eyebrow || "IARA NOTICE"}</small><h3>{item.title}</h3><p>{item.body}</p><span>{item.startsAtLabel} 至 {item.endsAtLabel}</span></div><button className="button button-secondary" type="button" onClick={() => toggle(item)} disabled={busy}>{item.active ? "停用" : "啟用"}</button></article>)}{!announcements.length && <div className="empty-state"><h2>尚未建立通告</h2><p>新通告會顯示在這裡。</p></div>}</div></section>
    {message && <p className={message.includes("未能") ? "form-error" : "form-success"} role="status">{message}</p>}
  </div>;
}
