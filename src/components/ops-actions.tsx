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
export function InventoryAction({ id, stock }: { id:string; stock:number }) { return <Action endpoint={`/api/ops/inventory/${id}`} fields={[{name:"stockOnHand",type:"number"},{name:"reason",placeholder:"調整原因"}]} initial={{stockOnHand:stock,reason:"定期盤點"}} />; }
export function AppointmentAction({ id, status, assignedTo }: { id:string; status:string; assignedTo:string|null }) { return <Action endpoint={`/api/ops/appointments/${id}`} fields={[{name:"status",options:["NEW","CONFIRMED","COMPLETED","NO_SHOW","CANCELLED"]},{name:"assignedTo",placeholder:"顧問"},{name:"internalNote",placeholder:"內部備註"}]} initial={{status,assignedTo:assignedTo||"",internalNote:""}} />; }
export function MemberAction({ id, tier, status }: { id:string; tier:string; status:string }) { return <Action endpoint={`/api/ops/members/${id}`} fields={[{name:"membershipTier",options:["MEMBER","GOLD","DIAMOND","VIP"]},{name:"status",options:["ACTIVE","SUSPENDED"]},{name:"reason",placeholder:"修改原因"}]} initial={{membershipTier:tier,status,reason:"會員服務調整"}} />; }
