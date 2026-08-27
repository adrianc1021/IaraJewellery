import { getLocale } from "@/lib/i18n";

export default async function PrivacyPage() {
  const en = await getLocale() === "en";
  return <main id="main" className="form-shell wide"><p className="eyebrow">PRIVACY</p><h1>{en ? "Privacy policy" : "私隱政策"}</h1><p>{en ? "Iara Jewellery collects only the personal information required to fulfil orders, provide member services, manage appointments and send marketing that you have agreed to receive. Payment card details are never stored in our website database." : "Iara Jewellery 僅為訂單、會員服務、預約及經同意的直接促銷收集必要個人資料。我們不會把付款卡資料儲存在網站資料庫。"}</p><h2>{en ? "Your rights" : "你的權利"}</h2><p>{en ? "You may request access to, correction of or deletion of your personal information, and withdraw direct marketing consent at any time. Before commercial launch, Iara must publish the data protection contact and final retention periods." : "你可要求查閱、更正或刪除個人資料，亦可隨時撤回直接促銷同意。正式商用前，公司須填寫資料保障聯絡方式與最終保留期限。"}</p></main>;
}
