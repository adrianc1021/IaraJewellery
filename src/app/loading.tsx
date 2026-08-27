import { getLocale } from "@/lib/i18n";
export default async function Loading() { const en = await getLocale() === "en"; return <main id="main" className="loading-state"><div><div className="spinner" aria-hidden="true" /><p>{en ? "Preparing your Iara experience..." : "正在準備 Iara 體驗…"}</p></div></main>; }
