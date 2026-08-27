import { requireStaff } from "@/lib/access";
import { OpsShell } from "@/components/ops-shell";

export default async function OpsDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return <OpsShell user={{ name: session.user.name || "Iara Staff", role: session.user.role || "STAFF" }}>{children}</OpsShell>;
}
