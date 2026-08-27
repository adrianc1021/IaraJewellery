"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, LayoutDashboard, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const staff = session && session.user.role !== "CUSTOMER";
  useEffect(() => { fetch("/api/cart").then((response) => response.ok ? response.json() : null).then((data) => data && setCartCount(data.itemCount)).catch(() => undefined); }, []);
  useEffect(() => { document.body.classList.toggle("no-scroll", open); return () => document.body.classList.remove("no-scroll"); }, [open]);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 18); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  const links = [["新品", "/shop?sort=newest"], ["珠寶", "/shop"], ["系列", "/shop?view=collections"], ["婚嫁", "/shop?collection=ARIA+BRIDAL"], ["品牌故事", "/#story"], ["門市", "/appointment"]];
  return <header className={`site-header ${scrolled ? "scrolled" : ""} ${pathname === "/" ? "home-header" : ""}`}><div className="header-inner container">
    <button className="icon-button menu-button" aria-label={open ? "關閉選單" : "開啟選單"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={19} /> : <Menu size={18} />}</button>
    <Link className="brand" href="/"><strong>IARA</strong><small>JEWELLERY</small></Link>
    <nav className="desktop-nav" aria-label="主要導覽">{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
    <div className="header-tools">
      <Link className="icon-link" href="/shop?search=1" aria-label="搜尋"><Search size={18} /></Link>
      <Link className="icon-link" href="/account#wishlist" aria-label="願望清單"><Heart size={18} /></Link>
      <Link className="icon-link account-link" href={session ? "/account" : "/login"} aria-label={session ? "會員中心" : "登入或註冊"}><UserRound size={18} /><span>{session ? "會員" : "登入"}</span></Link>
      {staff && <Link className="icon-link" href="/ops" aria-label="公司後台" title="公司後台"><LayoutDashboard size={18} /></Link>}
      <Link className="icon-link" href="/cart" aria-label={`購物袋，${cartCount} 件商品`}><ShoppingBag size={19} /><span className="tool-badge" data-zero={cartCount === 0}>{cartCount}</span></Link>
    </div>
  </div><nav className={`mobile-nav ${open ? "open" : ""}`} aria-hidden={!open}>{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}{staff && <Link href="/ops" onClick={() => setOpen(false)}>公司後台</Link>}<Link href={session ? "/account" : "/login"} onClick={() => setOpen(false)}>{session ? "會員中心" : "登入／申請會員"}</Link></nav></header>;
}
