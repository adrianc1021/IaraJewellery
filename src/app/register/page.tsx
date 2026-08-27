import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() { return <main id="main" className="split-page"><div className="split-image"><Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=88" alt="Iara 金色項鏈" fill priority sizes="50vw" /></div><div className="split-content"><div className="form-shell"><p className="eyebrow">JOIN IARA</p><h1>申請成為會員</h1><p>收藏心儀作品、管理預約及累積會員積分。</p><Suspense><AuthForm mode="register" /></Suspense><div className="auth-links"><span>已有帳戶？</span><Link href="/login">立即登入 →</Link></div></div></div></main>; }
