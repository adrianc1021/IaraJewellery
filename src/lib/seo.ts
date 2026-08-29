export const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://iarahk.com").replace(/\/$/, "");

export const seoConfig = {
  name: "Iara Jewellery",
  legalName: "Iara Jewellery",
  alternateName: "IARA Atelier",
  descriptionZh: "香港高級珠寶品牌，以當代設計、寶石甄選及細緻工藝創作可日常佩戴與訂製的珠寶作品。",
  descriptionEn: "A Hong Kong fine jewellery brand creating contemporary pieces through considered design, gemstone selection and detailed craftsmanship.",
  telephone: "+852 2180 8208",
  email: "concierge@iara-jewellery.com",
  address: {
    streetAddress: "皇后大道中 80 號",
    addressLocality: "中環",
    addressRegion: "香港",
    addressCountry: "HK"
  },
  openingHours: ["Mo-Su 11:00-20:00"],
  currency: "HKD"
} as const;

export const organizationId = `${siteUrl}/#organization`;
export const storeId = `${siteUrl}/#jewellery-store`;
export const websiteId = `${siteUrl}/#website`;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: seoConfig.name,
        legalName: seoConfig.legalName,
        alternateName: seoConfig.alternateName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: absoluteUrl("/icon"), width: 512, height: 512 },
        email: seoConfig.email,
        telephone: seoConfig.telephone,
        description: seoConfig.descriptionZh,
        areaServed: { "@type": "AdministrativeArea", name: "Hong Kong" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: seoConfig.telephone,
          email: seoConfig.email,
          availableLanguage: ["zh-Hant", "en"]
        }
      },
      {
        "@type": ["JewelryStore", "LocalBusiness"],
        "@id": storeId,
        name: seoConfig.name,
        url: siteUrl,
        parentOrganization: { "@id": organizationId },
        telephone: seoConfig.telephone,
        email: seoConfig.email,
        priceRange: "$$$$",
        currenciesAccepted: seoConfig.currency,
        paymentAccepted: "FPS, PayMe, AlipayHK",
        address: { "@type": "PostalAddress", ...seoConfig.address },
        openingHours: seoConfig.openingHours,
        areaServed: "Hong Kong"
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: seoConfig.name,
        publisher: { "@id": organizationId },
        inLanguage: ["zh-HK", "en-HK"],
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/shop?q={search_term_string}` },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}
