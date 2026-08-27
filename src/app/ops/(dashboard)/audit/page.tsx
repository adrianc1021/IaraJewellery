import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { OpsPageHeader } from "@/components/ops-shell";

export default async function OpsAuditPage() {
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, include: { actor: true }, take: 150 });
  return <><OpsPageHeader eyebrow="GOVERNANCE" title="審計紀錄" description="不可由介面修改的後台操作歷史，用於追蹤重要資料變更。" action={<span className="ops-page-count">最近 {logs.length} 筆</span>} /><section className="ops-section"><div className="data-table-wrap ops-table"><table className="data-table"><thead><tr><th>時間</th><th>操作者</th><th>操作</th><th>資料類型</th><th>目標</th><th>原因</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{formatDate(log.createdAt)}</td><td>{log.actor?.email || "SYSTEM"}</td><td>{log.action}</td><td>{log.entityType}</td><td>{log.entityId.slice(-12)}</td><td>{log.reason || "—"}</td></tr>)}</tbody></table></div></section></>;
}
