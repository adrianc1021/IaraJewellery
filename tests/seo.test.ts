import { describe, expect, it } from "vitest";
import { absoluteUrl, normalizeSiteUrl, organizationGraph, safeJsonLd, seoConfig } from "@/lib/seo";

describe("SEO and GEO helpers", () => {
  it("builds absolute official URLs", () => {
    expect(absoluteUrl("/shop")).toMatch(/^https?:\/\/[^/]+\/shop$/);
  });

  it("normalizes legacy and www domains to the official domain", () => {
    expect(normalizeSiteUrl("https://irarhk.com/")).toBe("https://iarahk.com");
    expect(normalizeSiteUrl("https://www.iarahk.com")).toBe("https://iarahk.com");
    expect(normalizeSiteUrl("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
  });

  it("exposes organization, local business and website schema", () => {
    const graph = organizationGraph()["@graph"];
    const types = graph.flatMap((item) => Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]);
    expect(types).toContain("Organization");
    expect(types).toContain("LocalBusiness");
    expect(types).toContain("JewelryStore");
    expect(types).toContain("WebSite");
    expect(graph.some((item) => item.name === seoConfig.name)).toBe(true);
  });

  it("escapes markup in JSON-LD", () => {
    expect(safeJsonLd({ value: "</script><script>" })).not.toContain("</script>");
  });
});
