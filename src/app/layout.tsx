import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteAnnouncementPopup } from "@/components/site-announcement-popup";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Iara Jewellery | 香港高級珠寶", template: "%s | Iara Jewellery" },
  description: "Iara Jewellery 香港高級珠寶，以當代設計承載珍稀寶石與細緻工藝。",
  openGraph: { title: "Iara Jewellery", description: "Jewels shaped by light.", type: "website", locale: "zh_HK" },
  robots: { index: true, follow: true }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale(); const en = locale === "en";
  return <html lang={locale}><body><a className="skip-link" href="#main">{en ? "Skip to content" : "跳至主要內容"}</a><div className="announcement"><span>{en ? "Complimentary Hong Kong delivery and returns" : "香港地區免費配送及退換"}</span><a href="/appointment">{en ? "Private appointment" : "預約私人鑑賞"}</a></div><SiteHeader locale={locale} />{children}<SiteFooter locale={locale} /><SiteAnnouncementPopup locale={locale} /></body></html>;
}
