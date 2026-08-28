"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

type RailProduct = Parameters<typeof ProductCard>[0]["product"];

export function HomeProductRail({ products, locale }: { products: RailProduct[]; locale: Locale }) {
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const step = () => Math.min(360, Math.max(260, (railRef.current?.clientWidth || 1200) * 0.24));
  function move(direction: number) {
    setPaused(true);
    setIndex((current) => Math.max(0, Math.min(Math.max(0, products.length - 1), current + direction)));
    railRef.current?.scrollBy({ left: direction * step(), behavior: "smooth" });
  }
  useEffect(() => {
    if (!paused) return;
    const timer = window.setTimeout(() => setPaused(false), 7000);
    return () => window.clearTimeout(timer);
  }, [paused, index]);
  return <div className="home-product-rail-wrap"><button className="home-rail-nav home-rail-nav-prev" type="button" onClick={() => move(-1)} aria-label="上一件"><ChevronLeft size={20} /></button><div className={`home-product-rail ${paused ? "is-paused" : ""}`} ref={railRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><div className="home-product-track">{[0, 1].map((copy) => <div className="home-product-group" aria-hidden={copy === 1} inert={copy === 1} key={copy}>{products.slice(0, 8).map((product) => <ProductCard key={`${copy}-${product.id}`} product={product} locale={locale} />)}</div>)}</div></div><button className="home-rail-nav home-rail-nav-next" type="button" onClick={() => move(1)} aria-label="下一件"><ChevronRight size={20} /></button><div className="home-product-controls"><button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "繼續播放" : "暫停播放"}>{paused ? <Play size={13} /> : <Pause size={13} />}</button><span>{paused ? "PAUSED · " : "PLAYING · "}{String(index + 1).padStart(2, "0")} / {String(Math.max(products.length, 1)).padStart(2, "0")}</span></div></div>;
}
