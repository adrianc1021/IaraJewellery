"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Archive, Eye, PackagePlus, Plus, Save } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { ProductImageUploader, type UploadedProductImage } from "@/components/product-image-uploader";

type GroupRow = { id: string; kind: string; slug: string; nameZh: string; nameEn: string; imageUrl: string | null; active: boolean; featured: boolean; sortOrder: number };
type ProductRow = { id: string; slug: string; nameZh: string; nameEn: string; category: string; collection: string; audience: string; status: string; featured: boolean; imageUrl: string; priceMinor: number; stock: number };

export function CatalogManager({ products, groups }: { products: ProductRow[]; groups: GroupRow[] }) {
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [productImages, setProductImages] = useState<UploadedProductImage[]>([]);
  const [message, setMessage] = useState("");
  const categories = groups.filter((group) => group.kind === "CATEGORY" && group.active);
  const collections = groups.filter((group) => group.kind === "COLLECTION" && group.active);

  async function request(url: string, method: "POST" | "PATCH", body: unknown, success: string) {
    setBusy(true); setMessage("");
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setBusy(false); setMessage(response.ok ? success : data.error || "未能完成操作。");
    if (response.ok) setTimeout(() => location.reload(), 650);
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const fallbackImage = String(raw.imageUrl || "").trim();
    if (!productImages.length && !fallbackImage) { setMessage("未能建立商品：請先上載至少一張商品圖片。"); return; }
    await request("/api/ops/products", "POST", {
      ...raw,
      imageUrl: fallbackImage || productImages[0]?.url,
      imageUrls: productImages.length ? productImages.map((image) => image.url) : undefined,
      priceMinor: Math.round(Number(raw.priceHkd) * 100),
      stockOnHand: Number(raw.stockOnHand),
      warrantyYears: Number(raw.warrantyYears || 1),
      featured: raw.featured === "on",
      hasCertificate: raw.hasCertificate === "on",
      isNaturalDiamond: raw.isNaturalDiamond === "on",
      engravingAvailable: raw.engravingAvailable === "on",
      chainLengthAdjustable: raw.chainLengthAdjustable === "on"
    }, "商品已建立並上架。");
  }

  async function createGroup(event: FormEvent<HTMLFormElement>, kind: "CATEGORY" | "COLLECTION") {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    await request("/api/ops/catalog-groups", "POST", { ...raw, kind, active: true, featured: raw.featured === "on", sortOrder: Number(raw.sortOrder || 0) }, `${kind === "CATEGORY" ? "分類" : "系列"}已建立。`);
  }

  async function updateGroup(event: FormEvent<HTMLFormElement>, group: GroupRow) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    await request(`/api/ops/catalog-groups/${group.id}`, "PATCH", { nameZh: raw.nameZh, nameEn: raw.nameEn, imageUrl: raw.imageUrl, active: raw.active === "on", featured: raw.featured === "on", sortOrder: Number(raw.sortOrder) }, "分類資料已更新，相關商品亦已同步。");
  }

  return <div className="catalog-manager">
    {message && <p className={message.includes("未能") ? "form-error" : "form-success"} role="status">{message}</p>}
    <section className="ops-panel"><div className="ops-panel-head"><div><h2>新增商品</h2><p>建立中英文商品資料、首個 SKU、價格與庫存。</p></div><PackagePlus size={20} /></div>
      <form className="catalog-product-form" onSubmit={createProduct}>
        <div className="field"><label htmlFor="product-name-zh">中文名稱</label><input id="product-name-zh" name="nameZh" required /></div>
        <div className="field"><label htmlFor="product-name-en">英文名稱</label><input id="product-name-en" name="nameEn" required /></div>
        <div className="field"><label htmlFor="product-slug">網址代號</label><input id="product-slug" name="slug" required placeholder="lumea-diamond-necklace" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div>
        <div className="field"><label htmlFor="product-audience">專區</label><select id="product-audience" name="audience"><option value="PEOPLE">珠寶</option><option value="PET">寵物飾品</option></select></div>
        <div className="field"><label htmlFor="product-category">分類</label><select id="product-category" name="category" required>{categories.map((group) => <option key={group.id}>{group.nameZh}</option>)}</select></div>
        <div className="field"><label htmlFor="product-collection">系列</label><select id="product-collection" name="collection" required>{collections.map((group) => <option key={group.id}>{group.nameZh}</option>)}</select></div>
        <div className="field"><label htmlFor="product-material">材質</label><input id="product-material" name="material" required placeholder="18K 黃金" /></div>
        <div className="field"><label htmlFor="product-gemstone">寶石</label><input id="product-gemstone" name="gemstone" required placeholder="鑽石" /></div>
        <div className="field"><label htmlFor="product-sku">首個 SKU</label><input id="product-sku" name="sku" required placeholder="IARA-011-01" /></div>
        <div className="field"><label htmlFor="product-option">尺寸／款式</label><input id="product-option" name="optionName" required placeholder="單一尺寸" /></div>
        <div className="field"><label htmlFor="product-price">價格 HK$</label><input id="product-price" name="priceHkd" type="number" min="1" step="0.01" required /></div>
        <div className="field"><label htmlFor="product-stock">現貨</label><input id="product-stock" name="stockOnHand" type="number" min="0" required /></div>
        <div className="field"><label htmlFor="product-badge">標籤</label><input id="product-badge" name="badge" placeholder="NEW" /></div>
        <ProductImageUploader value={productImages} onChange={setProductImages} disabled={busy} onBusyChange={setImageBusy} />
        <details className="product-image-url-fallback full"><summary>改用現有 HTTPS 圖片網址</summary><div className="field"><label htmlFor="product-image">商品圖片網址</label><input id="product-image" name="imageUrl" type="url" placeholder="https://..." /></div></details>
        <div className="field full"><label htmlFor="product-description-zh">中文描述</label><textarea id="product-description-zh" name="descriptionZh" required /></div>
        <div className="field full"><label htmlFor="product-description-en">英文描述</label><textarea id="product-description-en" name="descriptionEn" required /></div>
        <fieldset className="catalog-spec-group full"><legend>產品規格及售後資料</legend><div className="catalog-spec-grid">
          <div className="field"><label htmlFor="diamond-weight">鑽石總重量</label><input id="diamond-weight" name="diamondWeight" placeholder="例如 0.35 ct" /></div>
          <div className="field"><label htmlFor="diamond-colour">鑽石顏色及淨度</label><input id="diamond-colour" name="diamondColorClarity" placeholder="例如 F / VS1" /></div>
          <div className="field"><label htmlFor="pendant-dimensions">吊墜實際尺寸</label><input id="pendant-dimensions" name="pendantDimensions" placeholder="例如 12 × 8 mm" /></div>
          <div className="field"><label htmlFor="chain-length">鏈長及可調節長度</label><input id="chain-length" name="chainLength" placeholder="例如 40–45 cm" /></div>
          <div className="field"><label htmlFor="product-weight">產品重量</label><input id="product-weight" name="productWeight" placeholder="例如 2.8 g" /></div>
          <div className="field"><label htmlFor="clasp-type">扣件類型</label><input id="clasp-type" name="claspType" placeholder="例如 Spring ring" /></div>
          <div className="field"><label htmlFor="origin">產地／製作地</label><input id="origin" name="origin" placeholder="例如 香港工房" /></div>
          <div className="field"><label htmlFor="warranty-years">保養及維修年期</label><input id="warranty-years" name="warrantyYears" type="number" min="0" max="99" defaultValue="1" /> <small className="field-hint">年</small></div>
          <div className="field full"><label htmlFor="care-repair">保養及維修說明</label><textarea id="care-repair" name="careRepair" placeholder="例如 終身免費清潔檢查；保養期內享基本維修服務。" /></div>
          <div className="catalog-checks full">
            <label className="checkbox-field"><input name="hasCertificate" type="checkbox" />有證書</label>
            <label className="checkbox-field"><input name="isNaturalDiamond" type="checkbox" />天然鑽石</label>
            <label className="checkbox-field"><input name="engravingAvailable" type="checkbox" />可刻字</label>
            <label className="checkbox-field"><input name="chainLengthAdjustable" type="checkbox" />可改鏈長</label>
          </div>
        </div></fieldset>
        <label className="checkbox-field"><input name="featured" type="checkbox" />於首頁精選</label>
        <button className="button button-primary full" disabled={busy || imageBusy}><Plus size={15} />{busy ? "正在建立…" : imageBusy ? "正在處理圖片…" : "建立商品"}</button>
      </form>
    </section>

    <section className="ops-section"><div className="ops-section-head"><div><h2>商品目錄</h2><p className="muted">{products.length} 件商品</p></div></div><div className="catalog-product-list">{products.map((product) => <article key={product.id}>
      <Image src={product.imageUrl} alt="" width={68} height={82} />
      <div><small>{product.audience === "PET" ? "PET ATELIER" : product.collection}</small><h3>{product.nameZh}</h3><p>{product.category} · {formatMoney(product.priceMinor)} · 現貨 {product.stock}</p><div className="catalog-assign"><select aria-label={`${product.nameZh} 分類`} value={product.category} onChange={(event) => request(`/api/ops/products/${product.id}`, "PATCH", { category: event.target.value }, "商品分類已更新。")}>{categories.map((group) => <option key={group.id}>{group.nameZh}</option>)}</select><select aria-label={`${product.nameZh} 系列`} value={product.collection} onChange={(event) => request(`/api/ops/products/${product.id}`, "PATCH", { collection: event.target.value }, "商品系列已更新。")}>{collections.map((group) => <option key={group.id}>{group.nameZh}</option>)}</select><label><input type="checkbox" checked={product.featured} onChange={(event) => request(`/api/ops/products/${product.id}`, "PATCH", { featured: event.target.checked }, "首頁精選狀態已更新。")}/>首頁精選</label></div></div>
      <span className={`catalog-status ${product.status === "ACTIVE" ? "active" : ""}`}>{product.status === "ACTIVE" ? "已上架" : "已封存"}</span>
      <button className="icon-button catalog-toggle" type="button" title={product.status === "ACTIVE" ? "封存商品" : "重新上架"} aria-label={product.status === "ACTIVE" ? `封存 ${product.nameZh}` : `重新上架 ${product.nameZh}`} disabled={busy} onClick={() => request(`/api/ops/products/${product.id}`, "PATCH", { status: product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" }, product.status === "ACTIVE" ? "商品已封存。" : "商品已重新上架。")}>
        {product.status === "ACTIVE" ? <Archive size={17} /> : <Eye size={17} />}
      </button>
    </article>)}</div></section>

    <div className="catalog-group-columns">{(["CATEGORY", "COLLECTION"] as const).map((kind) => <section className="ops-panel" key={kind}><div className="ops-panel-head"><div><h2>{kind === "CATEGORY" ? "珠寶分類" : "品牌系列"}</h2><p>改名時會同步更新現有商品。</p></div></div>
      <form className="catalog-group-create" onSubmit={(event) => createGroup(event, kind)}><input name="nameZh" required placeholder={kind === "CATEGORY" ? "中文分類" : "系列名稱"} aria-label="中文名稱" /><input name="nameEn" required placeholder="English name" aria-label="英文名稱" /><input name="slug" required placeholder="url-slug" aria-label="網址代號" /><input name="sortOrder" type="number" defaultValue="100" aria-label="排序" /><input name="imageUrl" type="url" placeholder="圖片網址（可選）" aria-label="圖片網址" /><label className="checkbox-field"><input name="featured" type="checkbox" />精選</label><button className="button button-primary" disabled={busy}><Plus size={14} />新增</button></form>
      <div className="catalog-group-list">{groups.filter((group) => group.kind === kind).map((group) => <form key={group.id} onSubmit={(event) => updateGroup(event, group)}><div><strong>{group.slug}</strong><small>{group.active ? "顯示中" : "已隱藏"}</small></div><input name="nameZh" defaultValue={group.nameZh} aria-label={`${group.nameZh} 中文名稱`} /><input name="nameEn" defaultValue={group.nameEn} aria-label={`${group.nameZh} 英文名稱`} /><input name="imageUrl" defaultValue={group.imageUrl || ""} placeholder="圖片網址" aria-label={`${group.nameZh} 圖片網址`} /><input name="sortOrder" type="number" defaultValue={group.sortOrder} aria-label={`${group.nameZh} 排序`} /><label title="顯示"><input name="active" type="checkbox" defaultChecked={group.active} />顯示</label><label title="精選"><input name="featured" type="checkbox" defaultChecked={group.featured} />精選</label><button className="icon-button" disabled={busy} title="儲存" aria-label={`儲存 ${group.nameZh}`}><Save size={16} /></button></form>)}</div>
    </section>)}</div>
  </div>;
}
