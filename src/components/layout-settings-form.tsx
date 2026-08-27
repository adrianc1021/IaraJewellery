"use client";

import { Eye, RotateCcw, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { DEFAULT_SITE_LAYOUT, type SiteLayoutValues } from "@/lib/site-layout-shared";

type NumericKey = Exclude<keyof SiteLayoutValues, "productImageRatio">;

function RangeControl({ label, value, min, max, step, unit = "px", onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (value: number) => void }) {
  return <label className="layout-range"><span><strong>{label}</strong><output>{value}{unit}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function LayoutSettingsForm({ initial }: { initial: SiteLayoutValues }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const updateNumber = (key: NumericKey, value: number) => setValues((current) => ({ ...current, [key]: value }));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/ops/layout", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(data.error || "暫時未能儲存版面設定。"); return; }
    setMessage("版面設定已發佈。");
    setTimeout(() => location.reload(), 700);
  }

  function reset() {
    setValues({ ...DEFAULT_SITE_LAYOUT });
    setMessage("已套用預設值，按「儲存並發佈」後生效。");
  }

  return <form className="layout-settings" onSubmit={save}>
    <div className="layout-controls">
      <RangeControl label="主視覺高度" value={values.heroHeight} min={560} max={920} step={20} onChange={(value) => updateNumber("heroHeight", value)} />
      <RangeControl label="分類格子高度" value={values.categoryTileHeight} min={220} max={520} step={20} onChange={(value) => updateNumber("categoryTileHeight", value)} />
      <RangeControl label="板塊上下留白" value={values.sectionSpacing} min={56} max={140} step={4} onChange={(value) => updateNumber("sectionSpacing", value)} />
      <RangeControl label="工藝故事高度" value={values.editorialHeight} min={460} max={820} step={20} onChange={(value) => updateNumber("editorialHeight", value)} />
      <RangeControl label="策展格子高度" value={values.curationTileHeight} min={300} max={620} step={20} onChange={(value) => updateNumber("curationTileHeight", value)} />
    </div>
    <div className="layout-choice-grid">
      <fieldset><legend>本季新作：每行格數</legend><div className="layout-segments">{[2, 3, 4, 5].map((columns) => <button key={columns} type="button" aria-pressed={values.newArrivalsColumns === columns} onClick={() => updateNumber("newArrivalsColumns", columns)}>{columns}</button>)}</div></fieldset>
      <fieldset><legend>商品圖片比例</legend><div className="layout-segments">{[["1 / 1", "正方"], ["3 / 4", "修長"], ["4 / 5", "經典"]].map(([ratio, label]) => <button key={ratio} type="button" aria-pressed={values.productImageRatio === ratio} onClick={() => setValues((current) => ({ ...current, productImageRatio: ratio }))}>{label}</button>)}</div></fieldset>
    </div>
    <div className="layout-preview" aria-label="本季新作格子預覽"><div style={{ gridTemplateColumns: `repeat(${values.newArrivalsColumns}, 1fr)` }}>{Array.from({ length: values.newArrivalsColumns }).map((_, index) => <span key={index} style={{ aspectRatio: values.productImageRatio }} />)}</div></div>
    <div className="layout-actions"><button type="button" className="button button-secondary" onClick={reset}><RotateCcw size={15} />回復預設</button><a className="button button-secondary" href="/" target="_blank" rel="noreferrer"><Eye size={15} />預覽首頁</a><button className="button button-primary" disabled={busy}><Save size={15} />{busy ? "正在發佈…" : "儲存並發佈"}</button>{message && <span className={message.includes("未能") ? "form-error" : "form-success"} role="status">{message}</span>}</div>
  </form>;
}
