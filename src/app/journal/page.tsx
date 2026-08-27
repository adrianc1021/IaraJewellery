import { getLocale } from "@/lib/i18n";

export default async function JournalPage() {
  const en = await getLocale() === "en";
  return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">IARA JOURNAL</p><h1>{en ? "The journal" : "珠寶誌"}</h1><p>{en ? "Stories of craft, gemstones and considered ways to wear fine jewellery. Editorial publishing will be managed by the Iara team once the Sanity workspace is connected." : "工藝、寶石知識與佩戴靈感。連接 Sanity 工作空間後，內容將由 Iara 編輯團隊管理。"}</p></header></main>;
}
