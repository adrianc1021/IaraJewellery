/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Check, QrCode, Save, Smartphone, Trash2, Upload } from "lucide-react";

type PaymentRow = { code: string; nameZh: string; nameEn: string; enabled: boolean; checkoutMode: string; instructionsZh: string | null; accountReference: string | null; qrCodeUrl: string | null };
const allowedCodes = new Set(["FPS", "PAYME", "ALIPAY"]);

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("未能讀取 QR Code 圖片。")); };
    image.src = url;
  });
}

async function compressQr(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("請選擇 JPG、PNG 或 WebP 圖片。");
  if (file.size > 10 * 1024 * 1024) throw new Error("圖片不可超過 10 MB。");
  const image = await readImage(file);
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  for (const quality of [.9, .8, .7, .6]) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("瀏覽器未能處理圖片。");
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= 900_000) return new File([blob], "payment-qr.webp", { type: "image/webp" });
  }
  throw new Error("圖片壓縮後仍然過大，請先裁剪 QR Code。");
}

export function PaymentSettingsForm({ initial }: { initial: PaymentRow[] }) {
  const [methods, setMethods] = useState(initial.filter((method) => allowedCodes.has(method.code)));
  const fps = initial.find((method) => method.code === "FPS");
  const [fpsNumber, setFpsNumber] = useState(fps?.accountReference || "");
  const [qrCodeUrl, setQrCodeUrl] = useState(fps?.qrCodeUrl || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function save() {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/ops/payment-methods", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ methods: methods.map(({ code, enabled }) => ({ code, enabled })), fpsNumber, qrCodeUrl }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "未能儲存設定。");
      setMessage("付款方式及收款資料已發佈至結帳頁。");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "未能儲存設定。"); }
    finally { setBusy(false); }
  }

  async function uploadQr(file: File) {
    setUploading(true); setError("");
    try {
      const compressed = await compressQr(file);
      const body = new FormData(); body.append("file", compressed);
      const response = await fetch("/api/ops/payment-qr", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "未能上載 QR Code。");
      setQrCodeUrl(data.qrCodeUrl); setMessage("QR Code 已更新；按儲存付款設定可同時發佈付款方式及 FPS 號碼。");
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "未能上載 QR Code。"); }
    finally { setUploading(false); }
  }

  async function removeQr() {
    setUploading(true); setError("");
    try {
      const response = await fetch("/api/ops/payment-qr", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "未能移除 QR Code。");
      setQrCodeUrl(""); setMessage("QR Code 已移除，請按儲存付款設定確認其他變更。");
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : "未能移除 QR Code。"); }
    finally { setUploading(false); }
  }

  return <div className="payment-settings">
    <div className="payment-settings-notice"><QrCode size={18} /><p>目前只會在結帳頁提供 <strong>FPS、PayMe 及 AlipayHK</strong>。信用卡、Apple Pay、現金及 WeChat Pay 暫時不會接受。</p></div>
    <div className="payment-method-list">{methods.map((method, index) => <label key={method.code} className={method.enabled ? "enabled" : ""}><span className="payment-method-icon"><Smartphone size={19} /></span><span><strong>{method.nameZh}</strong><small>{method.nameEn} · 訂單後付款指示</small><em>{method.instructionsZh}</em></span><input type="checkbox" checked={method.enabled} onChange={(event) => setMethods((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: event.target.checked } : item))} /></label>)}</div>
    <section className="payment-collection-settings" aria-labelledby="payment-collection-title"><div className="ops-panel-head"><div><h2 id="payment-collection-title">收款資料</h2><p>更新後會在選用 FPS 的訂單確認頁顯示，請確保資料與公司收款帳戶一致。</p></div></div><div className="payment-collection-grid"><div className="field"><label htmlFor="fps-number">FPS 收款號碼</label><input id="fps-number" value={fpsNumber} onChange={(event) => setFpsNumber(event.target.value)} placeholder="例如：9123 4567" inputMode="tel" /><small className="field-hint">可填手機號碼、電郵或 FPS 識別資料。</small></div><div className="field"><label htmlFor="payment-qr-upload">FPS 收款 QR Code</label><div className="payment-qr-upload"><input id="payment-qr-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadQr(file); event.currentTarget.value = ""; }} disabled={uploading} /><span className="button button-secondary"><Upload size={14} />{uploading ? "處理中…" : "上載 QR Code"}</span></div><small className="field-hint">圖片會在瀏覽器先壓縮為 WebP，最高 900 KB。</small></div></div>{qrCodeUrl && <div className="payment-qr-preview"><img src={qrCodeUrl} alt="FPS 收款 QR Code 預覽" /><div><strong>目前 FPS 收款 QR Code</strong><span>顧客會在 FPS 訂單指示中看到。</span></div><button type="button" className="icon-button" onClick={() => void removeQr()} disabled={uploading} title="移除 QR Code" aria-label="移除 QR Code"><Trash2 size={15} /></button></div>}</section>
    <div className="layout-actions"><button className="button button-primary" onClick={save} disabled={busy || uploading}><Save size={15} />{busy ? "正在發佈…" : "儲存付款設定"}</button>{message && <span className="form-success" role="status"><Check size={14} />{message}</span>}{error && <span className="form-error" role="alert">{error}</span>}</div>
  </div>;
}
