import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() { return <main id="main" className="split-page"><div className="split-image"><Image src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=88" alt="Iara 珠寶佩戴細節" fill priority sizes="50vw" /></div><div className="split-content"><div className="form-shell"><p className="eyebrow">IARA MEMBERSHIP</p><h1>歡迎回來</h1><p>查看訂單、願望清單、積分與專屬預約。</p><Suspense><AuthForm mode="login" /></Suspense><div className="auth-links"><Link href="/forgot-password">忘記密碼</Link><Link href="/register">申請成為會員 →</Link></div><p className="muted" style={{marginTop:28,fontSize:10}}>示範會員：member@iara.local / Member123!<br />公司後台：admin@iara.local / ChangeMe123!</p></div></div></main>; }
