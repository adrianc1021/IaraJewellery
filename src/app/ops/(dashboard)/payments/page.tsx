import { db } from "@/lib/db";
import { OpsPageHeader } from "@/components/ops-shell";
import { PaymentSettingsForm } from "@/components/payment-settings-form";
import { requireStaff } from "@/lib/access";

export default async function OpsPaymentsPage() {
  await requireStaff();
  const methods = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
  return <><OpsPageHeader eyebrow="CHECKOUT" title="付款設定" description="控制結帳頁可選用的付款方式；實際收款仍需相應供應商帳戶及憑證。" action={<span className="ops-page-count">{methods.filter((method) => method.enabled).length} 種已啟用</span>} /><section className="ops-panel"><div className="ops-panel-head"><div><h2>可用付款方式</h2><p>信用卡及 Apple Pay 經 Stripe；其他本地方式顯示訂單後付款指示。</p></div></div><PaymentSettingsForm initial={methods} /></section></>;
}
