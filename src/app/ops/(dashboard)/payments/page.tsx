import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OpsPageHeader } from "@/components/ops-shell";
import { PaymentSettingsForm } from "@/components/payment-settings-form";
import { requireStaff } from "@/lib/access";

export default async function OpsPaymentsPage() {
  const session = await requireStaff();
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role ?? "")) redirect("/ops");
  const methods = await db.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
  const enabledCount = methods.filter((method) => method.enabled && ["FPS", "PAYME", "ALIPAY"].includes(method.code)).length;
  return <><OpsPageHeader eyebrow="CHECKOUT" title="付款設定" description="管理結帳頁開放的本地付款方式、FPS 收款號碼及 QR Code。" action={<span className="ops-page-count">{enabledCount} 種已啟用</span>} /><section className="ops-panel"><div className="ops-panel-head"><div><h2>可用付款方式</h2><p>目前只接受 FPS、PayMe 及 AlipayHK，其他付款方式會保持停用。</p></div></div><PaymentSettingsForm initial={methods} /></section></>;
}
