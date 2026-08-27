import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { PromotionForm } from "@/components/promotion-form";
import { AnnouncementManager } from "@/components/announcement-manager";
import { StatusPill } from "@/components/status-pill";

export default async function OpsMarketingPage() {
  const [promotions, announcements] = await Promise.all([
    db.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    db.popupAnnouncement.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  ]);
  const dateTime = new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Hong_Kong" });
  const rows = announcements.map((item) => ({ ...item, startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString(), startsAtLabel: dateTime.format(item.startsAt), endsAtLabel: dateTime.format(item.endsAt), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }));
  return <><OpsPageHeader eyebrow="CAMPAIGNS" title="推廣及通告" description="管理優惠碼與前台彈出通告，集中處理網站推廣活動。" />
    <AnnouncementManager announcements={rows} />
    <section className="ops-panel ops-marketing-section"><div className="ops-panel-head"><div><h2>建立優惠</h2><p>建立可在結帳時使用的百分比折扣碼。</p></div></div><PromotionForm /></section>
    <section className="ops-section"><div className="ops-section-head"><h2>優惠紀錄</h2><span>{promotions.length} 個</span></div><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>代碼</th><th>名稱</th><th>折扣</th><th>使用量</th><th>有效期</th><th>狀態</th></tr></thead><tbody>{promotions.map((promo) => <tr key={promo.id}><td>{promo.code}</td><td>{promo.name}</td><td>{promo.type === "PERCENT" ? `${promo.value}%` : formatMoney(promo.value)}</td><td>{promo.usageCount}/{promo.usageLimit || "∞"}</td><td>{formatDate(promo.startsAt)} 至 {formatDate(promo.endsAt)}</td><td><StatusPill value={promo.active ? "ACTIVE" : "INACTIVE"} /></td></tr>)}</tbody></table></div></section></>;
}
