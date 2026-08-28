import { db } from "@/lib/db";
import { OpsPageHeader } from "@/components/ops-shell";
import { PaymentSettingsForm } from "@/components/payment-settings-form";
import { requireStaff } from "@/lib/access";

export default async function OpsPaymentsPage() {
  await requireStaff();
  const methods = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
  const integrations = [{ name: "Stripe", ready: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET), copy: "信用卡、Apple Pay 及付款確認 webhook" }, { name: "Email", ready: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), copy: "Resend 訂單及付款通知" }, { name: "Sanity", ready: Boolean(process.env.SANITY_PROJECT_ID && process.env.SANITY_WEBHOOK_SECRET), copy: "正式內容資料及簽名 webhook" }];
  return <><OpsPageHeader eyebrow="CHECKOUT" title="付款及整合" description="控制付款方式，並檢查正式服務憑證是否已完成。" action={<span className="ops-page-count">{methods.filter((method) => method.enabled).length} 種已啟用</span>} /><section className="ops-panel"><div className="ops-panel-head"><div><h2>整合狀態</h2><p>憑證只可在 Render Environment 設定，不會顯示或儲存在網站資料庫。</p></div></div><div className="integration-status-grid">{integrations.map((item) => <article className={item.ready ? "ready" : "pending"} key={item.name}><span>{item.ready ? "已連接" : "待設定"}</span><strong>{item.name}</strong><p>{item.copy}</p></article>)}</div></section><section className="ops-panel"><div className="ops-panel-head"><div><h2>可用付款方式</h2><p>信用卡及 Apple Pay 經 Stripe；其他本地方式顯示訂單後付款指示。</p></div></div><PaymentSettingsForm initial={methods} /></section></>;
}
