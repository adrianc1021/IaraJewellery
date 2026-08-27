import Link from "next/link";
import { getLocale } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  const en = await getLocale() === "en";
  return <main id="main" className="form-shell"><p className="eyebrow">ACCOUNT ACCESS</p><h1>{en ? "Reset your password" : "重設密碼"}</h1><p>{en ? "Enter your member email. A secure reset link will be sent once the email service is configured." : "輸入會員電郵。當電郵服務完成設定後，系統會發送安全重設連結。"}</p><form className="form-grid"><div className="field full"><label htmlFor="email">{en ? "Email" : "電郵"}</label><input id="email" type="email" required /></div><p className="form-error field full">{en ? "The email provider is not configured, so reset emails cannot be sent yet." : "郵件供應商尚未設定，暫時不會發送重設郵件。"}</p><button className="button button-primary field full" disabled>{en ? "Send reset link" : "發送重設連結"}</button></form><div className="auth-links"><Link href="/login">{en ? "Back to sign in" : "返回登入"}</Link></div></main>;
}
