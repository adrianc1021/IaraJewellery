"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")), password = String(form.get("password"));
    if (mode === "login") {
      const next = params.get("next") || "/account";
      sessionStorage.setItem("iara.auth.next", next);
      const result = await signIn.email({ email, password });
      if (result.error) { setError(result.error.message || "登入資料不正確。" ); setBusy(false); return; }
      if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) return;
    } else {
      const confirm = String(form.get("confirm"));
      if (password !== confirm) { setError("兩次輸入的密碼不一致。" ); setBusy(false); return; }
      const result = await signUp.email({ name: String(form.get("name")), email, password, phone: String(form.get("phone")), marketingConsent: form.get("marketingConsent") === "on" });
      if (result.error) { setError(result.error.message || "暫時未能建立帳戶。" ); setBusy(false); return; }
    }
    const destination = params.get("next") || "/account";
    sessionStorage.removeItem("iara.auth.next");
    location.href = destination;
  }
  return <form onSubmit={submit} className="form-grid">{mode === "register" && <><div className="field full"><label htmlFor="name">姓名</label><input id="name" name="name" autoComplete="name" required minLength={2} /></div><div className="field full"><label htmlFor="phone">電話</label><input id="phone" name="phone" type="tel" autoComplete="tel" required /></div></>}<div className="field full"><label htmlFor="email">電郵</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field full"><label htmlFor="password">密碼</label><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} required /></div>{mode === "register" && <><div className="field full"><label htmlFor="confirm">確認密碼</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required /></div><label className="checkbox-field field full"><input name="marketingConsent" type="checkbox" />我願意接收 Iara 新作、活動及會員禮遇通訊。我可隨時取消訂閱。</label></>}{error && <p className="form-error field full" role="alert">{error}</p>}<button className="button button-primary field full" disabled={busy}>{busy ? "處理中…" : mode === "login" ? "登入" : "建立會員帳戶"}</button></form>;
}
