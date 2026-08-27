"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type SearchProduct = { id: string; slug: string; nameZh: string; nameEn: string; collection: string };

export function SearchOverlay({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: Locale }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  useEffect(() => {
    if (!open || term.trim().length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => fetch(`/api/products?q=${encodeURIComponent(term.trim())}`, { signal: controller.signal }).then((response) => response.json()).then((data) => setResults((data.products || []).slice(0, 6))).catch(() => undefined), 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, term]);
  useEffect(() => { if (!open) { setTerm(""); setResults([]); } }, [open]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (term.trim()) location.href = `/shop?q=${encodeURIComponent(term.trim())}`; }
  if (!open) return null;
  const en = locale === "en";
  return <div className="search-overlay" role="dialog" aria-modal="true" aria-label={en ? "Search Iara" : "搜尋 Iara"}><button className="search-backdrop" aria-label={en ? "Close search" : "關閉搜尋"} onClick={onClose} /><section><div className="search-overlay-head"><p className="eyebrow">IARA SEARCH</p><button className="icon-button" aria-label={en ? "Close search" : "關閉搜尋"} onClick={onClose}><X size={20} /></button></div><form onSubmit={submit}><Search size={24} /><input autoFocus value={term} onChange={(event) => setTerm(event.target.value)} placeholder={en ? "Search jewellery, collections or gemstones" : "搜尋珠寶、系列或寶石"} aria-label={en ? "Search" : "搜尋"} /><button className="icon-button" aria-label={en ? "Submit search" : "提交搜尋"}><ArrowRight size={20} /></button></form><div className="search-suggestions">{results.map((product) => <Link href={`/product/${product.slug}`} key={product.id} onClick={onClose}><span><small>{product.collection}</small><strong>{en ? product.nameEn : product.nameZh}</strong></span><ArrowRight size={15} /></Link>)}{term.length >= 2 && !results.length && <p>{en ? "No matching pieces yet." : "暫時找不到相符作品。"}</p>}{term.length < 2 && <div className="search-quick-links"><span>{en ? "Popular" : "熱門搜尋"}</span><Link href="/shop?sort=newest" onClick={onClose}>{en ? "New arrivals" : "本季新作"}</Link><Link href="/shop?collection=ARIA+BRIDAL" onClick={onClose}>{en ? "Bridal" : "婚嫁珠寶"}</Link><Link href="/pets" onClick={onClose}>{en ? "Pet jewellery" : "寵物飾品"}</Link></div>}</div></section></div>;
}
