import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale } from "@/lib/i18n";

export default async function JournalPage() {
  const en = await getLocale() === "en";
  return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">IARA JOURNAL</p><h1>{en ? "The journal" : "珠寶誌"}</h1><p>{en ? "Stories of craft, gemstones and considered ways to wear fine jewellery." : "工藝、寶石知識與佩戴靈感，記錄每件作品背後的細節。"}</p></header><section className="journal-feature"><div><Image src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1400&q=88" alt={en ? "Iara atelier craft" : "Iara 工房工藝"} fill sizes="(max-width: 680px) 100vw, 58vw" /></div><article><p className="eyebrow">CRAFTED IN HONG KONG</p><h2>{en ? "The hands behind the light" : "光的背後，是一雙雙專注的手"}</h2><p>{en ? "Stone selection, hand setting, polishing and a final inspection come together in our Hong Kong atelier. We document the process so you can understand the time, materials and care behind each piece." : "寶石甄選、手工鑲嵌、拋光及最後品質檢查，在香港工房一一完成。我們記錄每個步驟，讓你了解每件作品所用的時間、物料與心思。"}</p><div className="journal-proof"><span><strong>01</strong>{en ? "Select" : "甄選"}</span><span><strong>02</strong>{en ? "Set" : "鑲嵌"}</span><span><strong>03</strong>{en ? "Inspect" : "檢查"}</span></div><Link className="text-link" href="/appointment">{en ? "Visit the atelier" : "預約參觀工房"}<ArrowRight size={13} /></Link></article></section></main>;
}
