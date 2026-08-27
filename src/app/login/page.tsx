import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const staffLogin = next === "/ops";
  return <main id="main" className="split-page"><div className="split-image"><Image src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=88" alt="Iara 珠寶佩戴細節" fill priority sizes="50vw" /></div><div className="split-content"><div className="form-shell"><p className="eyebrow">{staffLogin ? "IARA OPERATIONS" : "IARA MEMBERSHIP"}</p><h1>{staffLogin ? "公司後台登入" : "歡迎回來"}</h1><p>{staffLogin ? "供已授權的 Iara 團隊成員使用。首次登入會引導你設定雙重驗證。" : "查看訂單、願望清單、積分與專屬預約。"}</p><Suspense><AuthForm mode="login" /></Suspense><div className="auth-links"><Link href="/forgot-password">忘記密碼</Link>{staffLogin ? <Link href="/">返回前台 →</Link> : <Link href="/register">申請成為會員 →</Link>}</div></div></div></main>;
}
