import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/lib/i18n";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, locale] = await Promise.all([searchParams, getLocale()]); const en = locale === "en";
  const staffLogin = next === "/ops";
  return <main id="main" className="split-page"><div className="split-image"><Image src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=88" alt={en ? "Iara jewellery detail" : "Iara 珠寶佩戴細節"} fill priority sizes="50vw" /></div><div className="split-content"><div className="form-shell"><p className="eyebrow">{staffLogin ? "IARA OPERATIONS" : "IARA MEMBERSHIP"}</p><h1>{staffLogin ? (en ? "Operations sign in" : "公司後台登入") : (en ? "Welcome back" : "歡迎回來")}</h1><p>{staffLogin ? (en ? "For authorised Iara team members. Two-factor setup is required on first sign-in." : "供已授權的 Iara 團隊成員使用。首次登入會引導你設定雙重驗證。") : (en ? "View orders, saved pieces, points and private appointments." : "查看訂單、願望清單、積分與專屬預約。")}</p><Suspense><AuthForm mode="login" locale={locale} /></Suspense><div className="auth-links"><Link href="/forgot-password">{en ? "Forgot password" : "忘記密碼"}</Link>{staffLogin ? <Link href="/">{en ? "Return to store" : "返回前台"} →</Link> : <Link href="/register">{en ? "Join Iara" : "申請成為會員"} →</Link>}</div></div></div></main>;
}
