"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, Boxes, CalendarDays, ClipboardList, ContactRound, CreditCard, FileClock, Gem, LayoutTemplate, Megaphone, Search, Settings2, Store, X } from "lucide-react";

const items = [
  { href: "/ops", label: "營運總覽", icon: BarChart3, exact: true },
  { href: "/ops/layout", label: "首頁版面", icon: LayoutTemplate },
  { href: "/ops/catalog", label: "商品目錄", icon: Gem },
  { href: "/ops/orders", label: "訂單", icon: ClipboardList },
  { href: "/ops/inventory", label: "庫存", icon: Boxes },
  { href: "/ops/members", label: "會員", icon: ContactRound },
  { href: "/ops/appointments", label: "預約", icon: CalendarDays },
  { href: "/ops/marketing", label: "推廣及通告", icon: Megaphone },
  { href: "/ops/payments", label: "付款設定", icon: CreditCard },
  { href: "/ops/integrations", label: "系統整合", icon: Settings2 },
  { href: "/ops/audit", label: "審計紀錄", icon: FileClock }
];

export function OpsShell({ user, children }: { user: { name: string; role: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { document.body.classList.add("ops-mode"); return () => document.body.classList.remove("ops-mode"); }, []);
  return <main id="main" className="ops-shell">
    <aside className="ops-sidebar">
      <div className="ops-sidebar-header"><Link href="/ops"><strong>Iara</strong><span>OPERATIONS</span></Link><div><span>{user.name}</span><small>{user.role}</small></div></div>
      <nav aria-label="後台導覽">{items.map(({ href, label, icon: Icon, exact }) => { const active = exact ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={16} />{label}</Link>; })}</nav>
      <div className="ops-sidebar-tools"><Link href="/ops/catalog?focus=search"><Search size={15} />快速搜尋商品</Link><Link href="/ops/integrations"><Settings2 size={15} />整合及設定</Link></div>
      <div className="ops-sidebar-footer"><Link href="/"><Store size={16} />查看前台</Link><Link href="/account"><X size={16} />離開後台</Link></div>
    </aside>
    <div className="ops-content">{children}</div>
  </main>;
}

export function OpsPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="ops-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}
