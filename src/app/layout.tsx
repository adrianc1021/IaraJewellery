import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteAnnouncementPopup } from "@/components/site-announcement-popup";
import { JsonLd } from "@/components/json-ld";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { getLocale } from "@/lib/i18n";
import { absoluteUrl, organizationGraph, seoConfig, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Iara Jewellery | 香港高級珠寶", template: "%s | Iara Jewellery" },
  description: seoConfig.descriptionZh,
  keywords: ["Iara Jewellery", "香港珠寶", "香港高級珠寶", "鑽石珠寶", "訂製珠寶", "寵物印記珠寶", "Hong Kong fine jewellery"],
  authors: [{ name: seoConfig.name, url: siteUrl }],
  creator: seoConfig.name,
  publisher: seoConfig.name,
  category: "Fine jewellery",
  openGraph: { title: "Iara Jewellery", description: seoConfig.descriptionEn, type: "website", locale: "zh_HK", alternateLocale: ["en_HK"], url: siteUrl, siteName: seoConfig.name, images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "Iara Jewellery" }] },
  twitter: { card: "summary_large_image", title: "Iara Jewellery", description: seoConfig.descriptionEn, images: [absoluteUrl("/opengraph-image")] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale(); const en = locale === "en";
  return <html lang={locale}><body><JsonLd data={organizationGraph()} /><WebVitalsReporter /><a className="skip-link" href="#main">{en ? "Skip to content" : "跳至主要內容"}</a><div className="announcement"><span>{en ? "Complimentary Hong Kong delivery and returns" : "香港地區免費配送及退換"}</span><a href="/appointment">{en ? "Private appointment" : "預約私人鑑賞"}</a></div><SiteHeader locale={locale} />{children}<SiteFooter locale={locale} /><SiteAnnouncementPopup locale={locale} /></body></html>;
}
