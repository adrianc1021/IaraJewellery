import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-brand"><Link className="brand" href="/"><strong>IARA</strong><small>JEWELLERY</small></Link><p>Jewels shaped by light.</p></div><div className="footer-column"><h3>探索</h3><Link href="/shop?sort=newest">新品</Link><Link href="/shop">所有珠寶</Link><Link href="/shop?collection=ARIA+BRIDAL">婚嫁</Link></div><div className="footer-column"><h3>會員及服務</h3><Link href="/login">登入／申請會員</Link><Link href="/account">會員中心</Link><Link href="/appointment">預約鑑賞</Link><Link href="/cart">購物袋</Link></div><div className="footer-column"><h3>Iara</h3><Link href="/#story">品牌故事</Link><Link href="/journal">珠寶誌</Link><Link href="/faq">常見問題</Link><Link href="/privacy">私隱政策</Link></div><div className="footer-bottom"><span>© 2026 Iara Jewellery</span><span>香港 · HKD · 繁體中文</span></div></footer>;
}
