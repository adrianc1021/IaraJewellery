"use client";

import { FormEvent, useState } from "react";
import { Check, UserPlus } from "lucide-react";

const roles = [["ADMIN", "管理員"], ["MERCHANDISER", "商品及庫存"], ["MARKETING", "推廣及通告"], ["CUSTOMER_SERVICE", "客戶服務"], ["WAREHOUSE", "倉務"], ["ANALYST", "分析檢視"]] as const;

export function AdminCreateForm() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const form = event.currentTarget; const values = new FormData(form);
    if (values.get("password") !== values.get("confirmPassword")) { setError("兩次輸入的密碼不一致。"); setBusy(false); return; }
    try {
      const response = await fetch("/api/ops/admins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: values.get("name"), email: values.get("email"), password: values.get("password"), role: values.get("role") }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || "暫時未能建立管理員。"); return; }
      setMessage(`管理員已建立：${data.user.email}`); form.reset();
    } catch { setError("網絡連線失敗，請稍後再試。"); } finally { setBusy(false); }
  }
  return <form className="admin-create-form" onSubmit={submit}>
    <div className="admin-create-intro"><span className="admin-create-icon"><UserPlus size={19} /></span><div><h3>新增管理員</h3><p>建立可登入公司後台的內部帳戶。首次登入需要設定雙重驗證。</p></div></div>
    <div className="admin-create-fields"><div className="field"><label htmlFor="admin-name">姓名</label><input id="admin-name" name="name" autoComplete="name" required minLength={2} /></div><div className="field"><label htmlFor="admin-email">管理員電郵</label><input id="admin-email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="admin-password">初始密碼</label><input id="admin-password" name="password" type="password" autoComplete="new-password" required minLength={12} aria-describedby="admin-password-hint" /><small id="admin-password-hint" className="field-hint">至少 12 個字元，包含大寫、小寫及數字</small></div><div className="field"><label htmlFor="admin-confirm-password">確認密碼</label><input id="admin-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} /></div><div className="field"><label htmlFor="admin-role">後台角色</label><select id="admin-role" name="role" defaultValue="ADMIN">{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status"><Check size={14} />{message}</p>}<button className="button button-primary" disabled={busy}><UserPlus size={15} />{busy ? "建立中…" : "建立管理員"}</button>
  </form>;
}
