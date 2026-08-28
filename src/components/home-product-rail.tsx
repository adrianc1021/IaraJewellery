"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

type RailProduct = Parameters<typeof ProductCard>[0]["product"];

export function HomeProductRail({ products, locale }: { products: RailProduct[]; locale: Locale }) {
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const total = products.length;
  function move(direction: number) {
    setPaused(true);
    setIndex((current) => total ? (current + direction + total) % total : 0);
  }
  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), 4200);
    return () => window.clearInterval(timer);
  }, [paused, total]);
  return <div className="home-product-rail-wrap"><button className="home-rail-nav home-rail-nav-prev" type="button" onClick={() => move(-1)} aria-label="上一件"><ChevronLeft size={20} /></button><div className={`home-product-rail ${paused ? "is-paused" : ""}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><div className="home-product-track home-product-track-single" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>{products.map((product) => <div className="home-product-slide" key={product.id}><ProductCard product={product} locale={locale} /></div>)}</div></div><button className="home-rail-nav home-rail-nav-next" type="button" onClick={() => move(1)} aria-label="下一件"><ChevronRight size={20} /></button><div className="home-product-controls"><button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "繼續播放" : "暫停播放"}>{paused ? <Play size={13} /> : <Pause size={13} />}</button><span>{paused ? "PAUSED · " : "PLAYING · "}{String(index + 1).padStart(2, "0")} / {String(Math.max(total, 1)).padStart(2, "0")}</span></div></div>;
}
