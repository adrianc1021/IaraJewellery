import { db } from "@/lib/db";
import { OpsPageHeader } from "@/components/ops-shell";
import { requireStaff } from "@/lib/access";

export default async function OpsIntegrationsPage() {
  await requireStaff();
  const integrations = [
    { name: "Stripe", ready: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET), copy: "信用卡、Apple Pay 及付款確認 webhook" },
    { name: "Email", ready: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), copy: "Resend 訂單及付款通知" },
    { name: "Sanity", ready: Boolean(process.env.SANITY_PROJECT_ID && process.env.SANITY_WEBHOOK_SECRET), copy: "正式內容資料及簽名 webhook" }
  ];
  const enabledMethods = await db.paymentMethodSetting.count({ where: { enabled: true } });
  return <><OpsPageHeader eyebrow="SYSTEM" title="整合及設定" description="檢查正式服務連接狀態；所有私密憑證均在 Render Environment 管理。" action={<span className="ops-page-count">{enabledMethods} 種付款方式</span>} /><section className="ops-panel"><div className="ops-panel-head"><div><h2>服務整合狀態</h2><p>連接狀態只顯示是否已設定，不會在後台展示任何密鑰。</p></div></div><div className="integration-status-grid">{integrations.map((item) => <article className={item.ready ? "ready" : "pending"} key={item.name}><span>{item.ready ? "已連接" : "待設定"}</span><strong>{item.name}</strong><p>{item.copy}</p></article>)}</div></section><section className="ops-panel integration-help"><div className="ops-panel-head"><div><h2>設定位置</h2><p>在 Render → Environment 更新正式憑證後，重新部署服務即可。</p></div></div><ol><li>Stripe：Secret Key 及 Webhook Secret</li><li>Email：Resend API Key 及寄件者地址</li><li>Sanity：Project ID、Dataset 及 Webhook Secret</li></ol></section></>;
}
