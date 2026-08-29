import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const privatePaths = ["/account", "/cart", "/checkout", "/login", "/register", "/forgot-password", "/two-factor", "/order-confirmation", "/ops", "/api"];
const aiCrawlers = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended"];
const publicPaths = ["/", "/llms.txt", "/sitemap.xml", "/api/media/products/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: publicPaths, disallow: privatePaths },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: publicPaths, disallow: privatePaths }))
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
