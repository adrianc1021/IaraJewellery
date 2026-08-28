"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";

export type UploadedProductImage = {
  url: string;
  name: string;
  originalBytes: number;
  optimizedBytes: number;
};

const maxImages = 6;
const maxSourceBytes = 25 * 1024 * 1024;
const maxOutputBytes = 1_600_000;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("未能壓縮圖片。")), "image/webp", quality));
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`未能讀取 ${file.name}。`)); };
    image.src = url;
  });
}

async function compressImage(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error(`${file.name} 不是支援的 JPG、PNG 或 WebP 圖片。`);
  if (file.size > maxSourceBytes) throw new Error(`${file.name} 超過 25 MB。`);
  const image = await loadImage(file);
  const baseScale = Math.min(1, 2000 / Math.max(image.naturalWidth, image.naturalHeight));
  const attempts = [
    { scale: baseScale, quality: .84 },
    { scale: baseScale, quality: .76 },
    { scale: baseScale * .85, quality: .72 },
    { scale: baseScale * .72, quality: .68 }
  ];
  let lastBlob: Blob | null = null;
  for (const attempt of attempts) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * attempt.scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * attempt.scale));
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("瀏覽器未能處理圖片。" );
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    lastBlob = await canvasBlob(canvas, attempt.quality);
    if (lastBlob.size <= maxOutputBytes) break;
  }
  if (!lastBlob || lastBlob.size > maxOutputBytes) throw new Error(`${file.name} 壓縮後仍超過 1.6 MB，請先裁剪圖片。`);
  const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60) || "iara-product";
  return new File([lastBlob], `${cleanName}.webp`, { type: "image/webp" });
}

export function ProductImageUploader({ value, onChange, disabled = false, onBusyChange }: { value: UploadedProductImage[]; onChange: (images: UploadedProductImage[]) => void; disabled?: boolean; onBusyChange?: (busy: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  async function processFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).slice(0, maxImages - value.length);
    if (!files.length) { setError(value.length >= maxImages ? `最多可上載 ${maxImages} 張圖片。` : "請選擇圖片。" ); return; }
    setProcessing(true); onBusyChange?.(true); setError("");
    try {
      const compressed: { original: File; optimized: File }[] = [];
      for (const file of files) compressed.push({ original: file, optimized: await compressImage(file) });
      const body = new FormData();
      compressed.forEach(({ optimized }) => body.append("files", optimized));
      const response = await fetch("/api/ops/media", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "未能上載圖片。" );
      const additions = data.files.map((uploaded: { url: string }, index: number) => ({
        url: uploaded.url,
        name: compressed[index].original.name,
        originalBytes: compressed[index].original.size,
        optimizedBytes: compressed[index].optimized.size
      }));
      onChange([...value, ...additions]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "未能上載圖片。" );
    } finally {
      setProcessing(false); onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void processFiles(event.target.files);
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDragging(false);
    if (!disabled && !processing) void processFiles(event.dataTransfer.files);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }

  async function remove(index: number) {
    const image = value[index];
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
    await fetch("/api/ops/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: image.url }) }).catch(() => undefined);
  }

  return <section className="product-image-uploader full" aria-labelledby="product-images-title">
    <div className="product-image-uploader-head"><div><h3 id="product-images-title">商品圖片</h3><p>{value.length}／{maxImages} 張</p></div>{value.length > 0 && <span>首張為封面</span>}</div>
    <div className={`product-image-dropzone ${dragging ? "dragging" : ""}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={dropFiles}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseFiles} disabled={disabled || processing || value.length >= maxImages} />
      {processing ? <LoaderCircle className="upload-spinner" size={25} /> : <ImagePlus size={25} />}
      <strong>{processing ? "正在壓縮及上載…" : "選取商品圖片"}</strong>
      <span>JPG、PNG、WebP · 最多 6 張</span>
      <button type="button" className="button button-secondary" onClick={() => inputRef.current?.click()} disabled={disabled || processing || value.length >= maxImages}><Upload size={14} />選擇圖片</button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {value.length > 0 && <div className="product-image-list">{value.map((image, index) => {
      const saving = Math.max(0, Math.round((1 - image.optimizedBytes / image.originalBytes) * 100));
      return <article key={image.url}>
        <div className="product-image-preview"><Image src={image.url} alt={`商品圖片 ${index + 1}`} fill sizes="140px" />{index === 0 && <span>封面</span>}</div>
        <div className="product-image-meta"><strong>{image.name}</strong><span>{formatBytes(image.originalBytes)} → {formatBytes(image.optimizedBytes)}</span><small>節省 {saving}%</small></div>
        <div className="product-image-actions">
          <button className="icon-button" type="button" disabled={index === 0} onClick={() => move(index, -1)} title="向前移" aria-label={`將圖片 ${index + 1} 向前移`}><ArrowLeft size={15} /></button>
          <button className="icon-button" type="button" disabled={index === value.length - 1} onClick={() => move(index, 1)} title="向後移" aria-label={`將圖片 ${index + 1} 向後移`}><ArrowRight size={15} /></button>
          <button className="icon-button image-remove" type="button" onClick={() => void remove(index)} title="移除" aria-label={`移除圖片 ${index + 1}`}><Trash2 size={15} /></button>
        </div>
      </article>;
    })}</div>}
  </section>;
}
