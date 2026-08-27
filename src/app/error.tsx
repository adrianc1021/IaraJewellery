"use client";
import { useEffect, useState } from "react";
export default function ErrorPage({ reset }: { reset: () => void }) { const [en, setEn] = useState(false); useEffect(() => setEn(document.documentElement.lang === "en"), []); return <main id="main" className="empty-state"><h1>{en ? "This content is temporarily unavailable" : "暫時未能顯示內容"}</h1><p>{en ? "Try again in a moment or return to the previous page." : "請稍後再試，或返回上一頁。"}</p><button className="button button-primary" onClick={reset}>{en ? "Reload" : "重新載入"}</button></main>; }
