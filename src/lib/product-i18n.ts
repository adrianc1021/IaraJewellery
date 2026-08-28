import type { Locale } from "@/lib/i18n";

const englishTerms: Record<string, string> = {
  "18K 黃金": "18K Yellow Gold",
  "18K 白金": "18K White Gold",
  "18K 玫瑰金": "18K Rose Gold",
  "18K 金": "18K Gold",
  "黃金": "Yellow Gold",
  "白金": "White Gold",
  "玫瑰金": "Rose Gold",
  "鉑金": "Platinum",
  "鑽石": "Diamond",
  "珍珠": "Pearl",
  "藍寶石": "Sapphire",
  "無寶石": "No gemstone",
  "戒指": "Rings",
  "項鏈": "Necklaces",
  "耳環": "Earrings",
  "手鏈": "Bracelets",
  "吊墜": "Pendants",
  "寵物吊牌": "Pet tags",
  "寵物頸鏈": "Pet collar jewellery",
  "單一尺寸": "One size",
  "小型": "Small",
  "中型": "Medium",
  "大型": "Large",
  "約 3 g": "Approx. 3 g",
  "安全環扣": "Safety ring clasp",
  "龍蝦扣": "Lobster clasp",
  "香港工房": "Hong Kong atelier",
  "香港工房／手工製作": "Handcrafted in our Hong Kong atelier",
  "一年保養及基本維修；提供終身清潔檢查。": "One-year care and basic repairs, with lifetime cleaning inspections.",
  "每件作品在香港工房經歷細緻鑲嵌、拋光與品質檢查。": "Every piece is set, polished and inspected in our Hong Kong atelier."
};

export function localizeProductValue(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  return locale === "en" ? englishTerms[value] || value : value;
}

export function localizeProductCopy(value: string | null | undefined, locale: Locale, englishFallback: string) {
  if (locale !== "en") return value || englishFallback;
  if (!value) return englishFallback;
  const translated = englishTerms[value];
  if (translated) return translated;
  return /[\u3400-\u9fff]/u.test(value) ? englishFallback : value;
}
