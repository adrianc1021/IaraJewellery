import { getLocale } from "@/lib/i18n";

const questions = {
  "zh-HK": [
    ["配送需要多久？", "香港現貨作品一般於 2 至 3 個工作天送達。"],
    ["可以退換嗎？", "未經刻字或訂製的作品可於收貨後 14 天內申請退換。"],
    ["如何預約到店？", "可使用網站預約表格選擇日期、時段與感興趣系列。"],
  ],
  en: [
    ["How long does delivery take?", "In-stock pieces are usually delivered within Hong Kong in 2 to 3 business days."],
    ["Can I return or exchange a piece?", "Pieces that have not been engraved or made to order may be returned or exchanged within 14 days of delivery."],
    ["How do I book an atelier appointment?", "Use our appointment form to choose a date, time and the collection you would like to discover."],
  ],
};

export default async function FaqPage() {
  const locale = await getLocale();
  return <main id="main" className="form-shell wide"><p className="eyebrow">CLIENT CARE</p><h1>{locale === "en" ? "Frequently asked questions" : "常見問題"}</h1>{questions[locale].map(([question, answer]) => <details className="detail-accordions" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</main>;
}
