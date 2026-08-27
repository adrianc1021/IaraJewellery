import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/lib/i18n";

export default async function RegisterPage() { const locale = await getLocale(); const en = locale === "en"; return <main id="main" className="split-page"><div className="split-image"><Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=88" alt={en ? "Iara gold necklace" : "Iara 金色項鏈"} fill priority sizes="50vw" /></div><div className="split-content"><div className="form-shell"><p className="eyebrow">JOIN IARA</p><h1>{en ? "Become a member" : "申請成為會員"}</h1><p>{en ? "Save favourite pieces, manage appointments and collect member points." : "收藏心儀作品、管理預約及累積會員積分。"}</p><Suspense><AuthForm mode="register" locale={locale} /></Suspense><div className="auth-links"><span>{en ? "Already a member?" : "已有帳戶？"}</span><Link href="/login">{en ? "Sign in" : "立即登入"} →</Link></div></div></div></main>; }
