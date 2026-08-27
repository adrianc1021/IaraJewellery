"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="empty-state"><h1>暫時未能顯示內容</h1><p>請稍後再試，或返回上一頁。</p><button className="button button-primary" onClick={reset}>重新載入</button></main>; }
