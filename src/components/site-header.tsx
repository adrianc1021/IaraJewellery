"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, LayoutDashboard, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { SearchOverlay } from "@/components/search-overlay";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const staff = session && session.user.role !== "CUSTOMER";
  const en = locale === "en";
  useEffect(() => { fetch("/api/cart").then((response) => response.ok ? response.json() : null).then((data) => data && setCartCount(data.itemCount)).catch(() => undefined); }, []);
  useEffect(() => { document.body.classList.toggle("no-scroll", open || searchOpen); return () => document.body.classList.remove("no-scroll"); }, [open, searchOpen]);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 18); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  const links = en ? [["New", "/shop?sort=newest"], ["Jewellery", "/shop"], ["Collections", "/shop?view=collections"], ["Bridal", "/shop?collection=ARIA+BRIDAL"], ["Pets", "/pets"], ["Book a viewing", "/appointment"]] : [["新品", "/shop?sort=newest"], ["珠寶", "/shop"], ["系列", "/shop?view=collections"], ["婚嫁", "/shop?collection=ARIA+BRIDAL"], ["寵物飾品", "/pets"], ["預約鑑賞", "/appointment"]];
  async function switchLocale() { await fetch("/api/locale", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale: en ? "zh-HK" : "en" }) }); router.refresh(); }
  return <header className={`site-header ${scrolled ? "scrolled" : ""} ${pathname === "/" ? "home-header" : ""}`}><div className="header-inner container">
    <button className="icon-button menu-button" aria-label={open ? (en ? "Close menu" : "關閉選單") : (en ? "Open menu" : "開啟選單")} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={19} /> : <Menu size={18} />}</button>
    <Link className="brand" href="/"><strong>IARA</strong><small>JEWELLERY</small></Link>
    <nav className="desktop-nav" aria-label={en ? "Main navigation" : "主要導覽"}>{links.map(([label, href]) => <Link className={href === "/appointment" ? "nav-appointment" : ""} key={label} href={href}>{label}</Link>)}</nav>
    <div className="header-tools"><button className="locale-toggle" onClick={switchLocale} aria-label={en ? "切換至繁體中文" : "Switch to English"}>{en ? "中" : "EN"}</button><button className="icon-button" onClick={() => setSearchOpen(true)} aria-label={en ? "Search" : "搜尋"}><Search size={18} /></button><Link className="icon-link wishlist-link" href="/account#wishlist" aria-label={en ? "Wishlist" : "願望清單"}><Heart size={18} /></Link><Link className="icon-link account-link" href={session ? "/account" : "/login"} aria-label={session ? (en ? "My account" : "會員中心") : (en ? "Sign in or register" : "登入或註冊")}><UserRound size={18} /><span>{session ? (en ? "Account" : "會員") : (en ? "Sign in" : "登入")}</span></Link>{staff && <Link className="icon-link ops-link" href="/ops" aria-label={en ? "Operations" : "公司後台"} title={en ? "Operations" : "公司後台"}><LayoutDashboard size={18} /></Link>}<Link className="icon-link cart-link" href="/cart" aria-label={en ? `Shopping bag, ${cartCount} items` : `購物袋，${cartCount} 件商品`}><ShoppingBag size={19} /><span className="tool-badge" data-zero={cartCount === 0}>{cartCount}</span></Link></div>
  </div><nav className={`mobile-nav ${open ? "open" : ""}`} aria-hidden={!open}>{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}{staff && <Link href="/ops" onClick={() => setOpen(false)}>{en ? "Operations" : "公司後台"}</Link>}<Link href={session ? "/account" : "/login"} onClick={() => setOpen(false)}>{session ? (en ? "My account" : "會員中心") : (en ? "Sign in / Join" : "登入／申請會員")}</Link></nav><SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} /></header>;
}
