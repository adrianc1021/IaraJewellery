"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/lib/i18n";

export function TwoFactorChallenge({ locale = "zh-HK" }: { locale?: Locale }) {
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const en = locale === "en";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const code = String(new FormData(event.currentTarget).get("code"));
    const result = mode === "totp"
      ? await authClient.twoFactor.verifyTotp({ code, trustDevice: true })
      : await authClient.twoFactor.verifyBackupCode({ code, trustDevice: true });
    if (result.error) { setError(result.error.message || (en ? "The verification code is incorrect." : "驗證碼不正確。")); setBusy(false); return; }
    const destination = sessionStorage.getItem("iara.auth.next") || "/account";
    sessionStorage.removeItem("iara.auth.next");
    location.href = destination;
  }

  return <>
    <div className="segmented-control" role="group" aria-label={en ? "Verification method" : "驗證方式"}>
      <button type="button" aria-pressed={mode === "totp"} onClick={() => setMode("totp")}>{en ? "Authenticator" : "驗證器"}</button>
      <button type="button" aria-pressed={mode === "backup"} onClick={() => setMode("backup")}>{en ? "Backup code" : "後備碼"}</button>
    </div>
    <form className="form-grid" onSubmit={submit}>
      <div className="field full"><label htmlFor="two-factor-code">{mode === "totp" ? (en ? "6-digit code" : "6 位驗證碼") : (en ? "Backup code" : "後備碼")}</label><input id="two-factor-code" name="code" inputMode={mode === "totp" ? "numeric" : "text"} autoComplete="one-time-code" required autoFocus /></div>
      {error && <p className="form-error field full" role="alert">{error}</p>}
      <button className="button button-primary field full" disabled={busy}>{busy ? (en ? "Verifying..." : "驗證中…") : (en ? "Complete sign in" : "完成登入")}</button>
    </form>
  </>;
}
