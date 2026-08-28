"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

type RailProduct = Parameters<typeof ProductCard>[0]["product"];

export function HomeProductRail({ products, locale }: { products: RailProduct[]; locale: Locale }) {
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollToIndex = useCallback((next: number, behavior: ScrollBehavior = "smooth") => {
    const rail = railRef.current;
    if (!rail || !products.length) return;
    const cards = rail.querySelectorAll<HTMLElement>(".home-product-group > .product-card");
    const card = cards[next];
    if (!card) return;
    rail.scrollTo({ left: Math.max(0, card.offsetLeft - 4), behavior });
    setIndex(next);
  }, [products.length]);
  function move(direction: number) {
    setPaused(true);
    const next = index + direction < 0 ? products.length - 1 : index + direction >= products.length ? 0 : index + direction;
    scrollToIndex(next);
  }
  useEffect(() => {
    if (paused || products.length < 2) return;
    const timer = window.setInterval(() => {
      const next = index + 1 >= products.length ? 0 : index + 1;
      scrollToIndex(next);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, index, products.length, scrollToIndex]);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      const cards = [...rail.querySelectorAll<HTMLElement>(".home-product-group > .product-card")];
      if (!cards.length) return;
      let nearest = 0;
      cards.forEach((card, cardIndex) => { if (Math.abs(card.offsetLeft - rail.scrollLeft) < Math.abs(cards[nearest].offsetLeft - rail.scrollLeft)) nearest = cardIndex; });
      setIndex(nearest);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="home-product-rail-wrap"><button className="home-rail-nav home-rail-nav-prev" type="button" onClick={() => move(-1)} aria-label="上一件"><ChevronLeft size={20} /></button><div className={`home-product-rail ${paused ? "is-paused" : ""}`} ref={railRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><div className="home-product-track"><div className="home-product-group">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></div></div><button className="home-rail-nav home-rail-nav-next" type="button" onClick={() => move(1)} aria-label="下一件"><ChevronRight size={20} /></button><div className="home-product-controls"><button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "繼續播放" : "暫停播放"}>{paused ? <Play size={13} /> : <Pause size={13} />}</button><span>{paused ? "PAUSED · " : "PLAYING · "}{String(index + 1).padStart(2, "0")} / {String(Math.max(products.length, 1)).padStart(2, "0")}</span></div></div>;
}
