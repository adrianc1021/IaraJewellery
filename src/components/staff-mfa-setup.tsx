"use client";

import { Check, Copy, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Setup = { totpURI: string; backupCodes: string[] };

export function StaffMfaSetup({ returnTo }: { returnTo: string }) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
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
    if (result.error) setMessage(result.error.message || "未能開始設定，請確認密碼後再試。");
    else if (result.data.method === "totp") setSetup({ totpURI: result.data.totpURI, backupCodes: result.data.backupCodes });
    setBusy(false);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const code = String(new FormData(event.currentTarget).get("code"));
    const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: true });
    if (result.error) {
      setMessage(result.error.message || "驗證碼不正確，請使用驗證器顯示的最新代碼。");
      setBusy(false);
      return;
    }
    location.href = returnTo;
  }

  async function copySecret() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return <div className="staff-mfa-card">
    <ol className="security-steps" aria-label="雙重驗證設定步驟">
      <li className={!setup ? "active" : "complete"}><span>{setup ? <Check size={15} /> : "1"}</span><div><strong>確認公司帳戶</strong><p>輸入目前登入密碼。</p></div></li>
      <li className={setup ? "active" : ""}><span>2</span><div><strong>連接驗證器</strong><p>加入 Iara Jewellery 帳戶。</p></div></li>
      <li><span>3</span><div><strong>完成登入</strong><p>輸入 6 位動態代碼。</p></div></li>
    </ol>
    {!setup ? <form className="mfa-gate-form" onSubmit={enable}>
      <div className="field full"><label htmlFor="staff-password">公司帳戶密碼</label><input id="staff-password" name="password" type="password" autoComplete="current-password" required autoFocus /></div>
      <button className="button button-primary" disabled={busy}><ShieldCheck size={16} />{busy ? "正在確認…" : "開始安全設定"}</button>
    </form> : <div className="mfa-enrolment">
      <div className="mfa-secret-panel"><div><span>驗證器設定金鑰</span><code>{secret}</code></div><button type="button" className="icon-button" onClick={copySecret} aria-label="複製設定金鑰" title="複製設定金鑰">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
      <a className="button button-secondary" href={setup.totpURI}><ExternalLink size={15} />在驗證器開啟</a>
      <form className="mfa-gate-form" onSubmit={verify}>
        <div className="field full"><label htmlFor="staff-code">6 位驗證碼</label><input id="staff-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></div>
        <button className="button button-primary" disabled={busy}><KeyRound size={16} />{busy ? "正在驗證…" : "驗證並進入後台"}</button>
      </form>
      <details className="backup-code-panel"><summary>查看及保存後備碼</summary><div>{setup.backupCodes.map((code) => <code key={code}>{code}</code>)}</div></details>
    </div>}
    {message && <p className="form-error" role="alert">{message}</p>}
  </div>;
}
