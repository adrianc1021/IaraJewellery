import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";
import { AppointmentAction } from "@/components/ops-actions";
import { StatusPill } from "@/components/status-pill";

export default async function OpsAppointmentsPage() {
  const appointments = await db.appointment.findMany({ orderBy: { appointmentDate: "asc" }, include: { store: true }, take: 100 });
  const open = appointments.filter((item) => ["NEW", "CONFIRMED"].includes(item.status)).length;
  return <><OpsPageHeader eyebrow="PRIVATE CLIENT" title="預約管理" description="安排私人鑑賞、分配珠寶顧問並記錄內部跟進資料。" action={<span className="ops-page-count">{open} 個開放預約</span>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>日期</th><th>客戶</th><th>聯絡</th><th>系列</th><th>門市</th><th>狀態</th><th>操作</th></tr></thead><tbody>{appointments.map((item) => <tr key={item.id}><td>{formatDate(item.appointmentDate)}<br /><span className="muted">{item.timeSlot}</span></td><td>{item.name}<br /><span className="muted">{item.email}</span></td><td>{item.phone}</td><td>{item.interest}</td><td>{item.store.name}</td><td><StatusPill value={item.status} /></td><td><AppointmentAction id={item.id} status={item.status} assignedTo={item.assignedTo} /></td></tr>)}</tbody></table></div></section></>;
}
