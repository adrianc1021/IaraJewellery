import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { requireStaffIdentity } from "@/lib/access";
import { StaffMfaSetup } from "@/components/staff-mfa-setup";

export default async function OpsSecurityPage() {
  const session = await requireStaffIdentity();
  if (session.user.twoFactorEnabled) redirect("/ops");
  return <main id="main" className="ops-security-page">
    <div className="ops-security-shell">
      <div className="ops-security-heading"><span><LockKeyhole size={22} /></span><p className="eyebrow">IARA OPERATIONS SECURITY</p><h1>保護公司後台</h1><p>首次進入營運後台前，請連接驗證器應用程式。完成後會立即返回營運總覽。</p></div>
      <StaffMfaSetup returnTo="/ops" />
    </div>
  </main>;
}
