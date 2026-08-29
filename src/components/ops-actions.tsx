"use client";
import { useState } from "react";

function Action({ endpoint, method = "PATCH", fields, initial }: { endpoint: string; method?: string; fields: Array<{name:string;options?:string[];type?:string;placeholder?:string}>; initial: Record<string,string|number> }) {
  const [values, setValues] = useState(initial); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMessage("");
    try {
      const body = Object.fromEntries(fields.map((field) => [field.name, field.type === "number" ? Number(values[field.name]) : values[field.name]]));
      const response = await fetch(endpoint, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      setMessage(response.ok ? "已儲存" : data.error || "未能儲存，請稍後再試。");
      if (response.ok) setTimeout(() => location.reload(), 400);
    } catch { setMessage("網絡連線失敗，請稍後再試。"); }
    finally { setBusy(false); }
  }
  return <div className="inline-action">{fields.map((field) => field.options ? <select key={field.name} aria-label={field.placeholder || field.name} disabled={busy} value={values[field.name]} onChange={(event) => setValues({...values,[field.name]:event.target.value})}>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input key={field.name} aria-label={field.placeholder || field.name} disabled={busy} type={field.type || "text"} placeholder={field.placeholder} value={values[field.name]} onChange={(event) => setValues({...values,[field.name]:event.target.value})} />)}<button type="button" onClick={save} disabled={busy}>{busy ? "儲存中…" : "儲存"}</button>{message && <span role="status">{message}</span>}</div>;
}
export function OrderAction({ id, status }: { id:string; status:string }) { return <Action endpoint={`/api/ops/orders/${id}`} fields={[{name:"orderStatus",options:["PROCESSING","READY_FOR_PICKUP","SHIPPED","DELIVERED","CANCELLED"]},{name:"note",placeholder:"備註"}]} initial={{orderStatus:status === "PENDING_PAYMENT" ? "PROCESSING" : status,note:""}} />; }
export function OrderPaymentAction({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function markPaid() {
    if (!window.confirm("確認已收到這張訂單的付款？")) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/ops/orders/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ paymentStatus: "PAID", note: "已核對收款" }) }); const data = await response.json().catch(() => ({})); if (!response.ok) { setMessage(data.error || "未能更新付款狀態。"); return; } setMessage("付款已確認"); setTimeout(() => location.reload(), 500); } catch { setMessage("網絡連線失敗。"); } finally { setBusy(false); }
  }
  if (status === "PAID") return null;
  return <div className="inline-action"><button type="button" onClick={markPaid} disabled={busy} className="inline-action-primary">{busy ? "處理中…" : "確認收款"}</button>{message && <span role="status">{message}</span>}</div>;
}
export function OrderDetailActions({ id, orderStatus, paymentStatus }: { id: string; orderStatus: string; paymentStatus: string }) { return <div className="order-detail-actions"><div><strong>付款</strong>{paymentStatus === "PAID" ? <span className="order-paid-label">已確認</span> : <OrderPaymentAction id={id} status={paymentStatus} />}</div>{paymentStatus === "PAID" && <div><strong>履行狀態</strong><OrderAction id={id} status={orderStatus} /></div>}</div>; }
export function InventoryAction({ id, stock }: { id:string; stock:number }) { return <Action endpoint={`/api/ops/inventory/${id}`} fields={[{name:"stockOnHand",type:"number"},{name:"reason",placeholder:"調整原因"}]} initial={{stockOnHand:stock,reason:"定期盤點"}} />; }
export function AppointmentAction({ id, status, assignedTo }: { id:string; status:string; assignedTo:string|null }) { return <Action endpoint={`/api/ops/appointments/${id}`} fields={[{name:"status",options:["NEW","CONFIRMED","COMPLETED","NO_SHOW","CANCELLED"]},{name:"assignedTo",placeholder:"顧問"},{name:"internalNote",placeholder:"內部備註"}]} initial={{status,assignedTo:assignedTo||"",internalNote:""}} />; }
export function MemberAction({ id, tier, status }: { id:string; tier:string; status:string }) { return <Action endpoint={`/api/ops/members/${id}`} fields={[{name:"membershipTier",options:["MEMBER","GOLD","DIAMOND","VIP"]},{name:"status",options:["ACTIVE","SUSPENDED"]},{name:"reason",placeholder:"修改原因"}]} initial={{membershipTier:tier,status,reason:"會員服務調整"}} />; }
