"use client";

import { Download, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Setup = { totpURI: string; backupCodes: string[] };

export function AccountSecurity({
  twoFactorEnabled,
  deletionRequested
}: {
  twoFactorEnabled: boolean;
  deletionRequested: boolean;
}) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const secret = useMemo(() => {
    if (!setup) return "";
    try { return new URL(setup.totpURI).searchParams.get("secret") || ""; }
    catch { return ""; }
  }, [setup]);

  async function enable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const password = String(new FormData(event.currentTarget).get("password"));
    const result = await authClient.twoFactor.enable({ password, method: "totp", issuer: "Iara Jewellery" });
    if (result.error) setMessage(result.error.message || "未能啟用雙重驗證。");
    else if (result.data.method === "totp") setSetup({ totpURI: result.data.totpURI, backupCodes: result.data.backupCodes });
    setBusy(false);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const code = String(new FormData(event.currentTarget).get("code"));
    const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: true });
    if (result.error) { setMessage(result.error.message || "驗證碼不正確。"); setBusy(false); return; }
    location.reload();
  }

  async function disable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const password = String(new FormData(event.currentTarget).get("password"));
    const result = await authClient.twoFactor.disable({ password });
    if (result.error) { setMessage(result.error.message || "未能停用雙重驗證。"); setBusy(false); return; }
    location.reload();
  }

  async function requestDeletion() {
    if (!confirm("提交後，公司將按身份核實及資料保留政策處理帳戶刪除。確定繼續？")) return;
    setBusy(true);
    const response = await fetch("/api/account/deletion-request", { method: "POST" });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error);
    setBusy(false);
    if (response.ok) location.reload();
  }

  return <div className="security-stack">
    <div className="security-row">
      <div><strong>帳戶資料</strong><p>下載你的會員、訂單、地址、預約、收藏及積分紀錄。</p></div>
      <a className="button button-secondary" href="/api/account/export" download><Download size={15} />匯出資料</a>
    </div>
    <div className="security-row security-row-block">
      <div><strong>雙重驗證</strong><p>{twoFactorEnabled ? "帳戶已受驗證器應用程式保護。" : "使用驗證器應用程式保護登入及公司後台操作。"}</p></div>
      {twoFactorEnabled ? <form className="security-form" onSubmit={disable}>
        <input name="password" type="password" autoComplete="current-password" placeholder="輸入密碼以停用" required />
        <button className="button button-secondary" disabled={busy}><ShieldCheck size={15} />停用雙重驗證</button>
      </form> : setup ? <div className="mfa-setup">
        <p>在驗證器加入帳戶。可開啟設定連結，或手動輸入下方金鑰。</p>
        <a className="text-link" href={setup.totpURI}>在驗證器開啟</a>
        <code>{secret}</code>
        <form className="security-form" onSubmit={verify}>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="6 位驗證碼" required />
          <button className="button button-primary" disabled={busy}><KeyRound size={15} />確認啟用</button>
        </form>
        <details><summary>顯示後備碼</summary><div className="backup-codes">{setup.backupCodes.map((code) => <code key={code}>{code}</code>)}</div></details>
      </div> : <form className="security-form" onSubmit={enable}>
        <input name="password" type="password" autoComplete="current-password" placeholder="輸入密碼" required />
        <button className="button button-primary" disabled={busy}><ShieldCheck size={15} />啟用雙重驗證</button>
      </form>}
    </div>
    <div className="security-row">
      <div><strong>刪除帳戶申請</strong><p>{deletionRequested ? "申請已提交，公司人員將按資料保留政策跟進。" : "提交後會進入公司審核及身份核實流程。"}</p></div>
      <button className="button button-danger" onClick={requestDeletion} disabled={busy || deletionRequested}><Trash2 size={15} />{deletionRequested ? "已提交申請" : "申請刪除帳戶"}</button>
    </div>
    {message && <p className="form-message" role="status">{message}</p>}
  </div>;
}
