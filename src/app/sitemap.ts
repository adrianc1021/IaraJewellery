import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

const staticPages = [
  ["/", "daily", 1],
  ["/shop", "daily", .9],
  ["/pets", "weekly", .8],
  ["/appointment", "monthly", .7],
  ["/journal", "monthly", .7],
  ["/faq", "monthly", .6],
  ["/privacy", "yearly", .2]
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } });
  const staticModified = new Date("2026-08-29T00:00:00.000Z");
  return [
    ...staticPages.map(([path, changeFrequency, priority]) => ({ url: absoluteUrl(path), lastModified: staticModified, changeFrequency, priority })),
    ...products.map((product) => ({ url: absoluteUrl(`/product/${product.slug}`), lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: .8 }))
  ];
}
