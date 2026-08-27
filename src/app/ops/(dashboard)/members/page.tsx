import { db } from "@/lib/db";
import { OpsPageHeader } from "@/components/ops-shell";
import { MemberAction } from "@/components/ops-actions";
import { StatusPill } from "@/components/status-pill";
import { requireStaff } from "@/lib/access";

export default async function OpsMembersPage() {
  await requireStaff();
  const members = await db.user.findMany({ orderBy: { createdAt: "desc" }, include: { orders: { where: { paymentStatus: "PAID" } }, points: true }, take: 100 });
  return <><OpsPageHeader eyebrow="CLIENTELING" title="會員管理" description="檢視會員級別、狀態、訂單及積分，支援客戶服務跟進。" action={<span className="ops-page-count">{members.length} 位會員</span>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>會員</th><th>角色</th><th>級別</th><th>狀態</th><th>訂單</th><th>積分</th><th>操作</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td>{member.name}<br /><span className="muted">{member.email}</span></td><td>{member.role}</td><td>{member.membershipTier}</td><td><StatusPill value={member.status} /></td><td>{member.orders.length}</td><td>{member.points.reduce((sum, row) => sum + row.points, 0)}</td><td><MemberAction id={member.id} tier={member.membershipTier} status={member.status} /></td></tr>)}</tbody></table></div></section></>;
}
