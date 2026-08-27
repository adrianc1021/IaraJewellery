import Link from "next/link";
export default function NotFound() { return <main id="main" className="empty-state"><h1>找不到這一頁</h1><p>作品可能已移動，請返回瀏覽所有珠寶。</p><Link className="button button-primary" href="/shop">探索所有珠寶</Link></main>; }
