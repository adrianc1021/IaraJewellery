const baseUrl = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const failures = [];

function check(condition, message) {
  if (condition) console.log(`PASS ${message}`);
  else { console.error(`FAIL ${message}`); failures.push(message); }
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
  const text = await response.text();
  check(response.ok, `${path} returns ${response.status}`);
  return { response, text };
}

function canonical(html) {
  return html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1] || "";
}

function description(html) {
  return html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] || html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)?.[1] || "";
}

function normalizedUrl(value) {
  return value.replace(/\/$/, "");
}

function schemas(html) {
  return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
    try {
      const value = JSON.parse(match[1].replaceAll("&quot;", "\"").replaceAll("&amp;", "&"));
      return value["@graph"] ? value["@graph"] : [value];
    } catch { return []; }
  });
}

function hasType(items, expected) {
  return items.some((item) => {
    const types = Array.isArray(item?.["@type"]) ? item["@type"] : [item?.["@type"]];
    return types.includes(expected);
  });
}

const robots = await get("/robots.txt");
check(robots.text.includes("Sitemap:") && robots.text.includes("/sitemap.xml"), "robots.txt declares the sitemap");
for (const bot of ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "PerplexityBot"]) check(robots.text.includes(`User-Agent: ${bot}`) || robots.text.includes(`User-agent: ${bot}`), `robots.txt includes ${bot}`);
check(robots.text.includes("Disallow: /account") && robots.text.includes("Disallow: /ops"), "robots.txt protects private routes");

const sitemap = await get("/sitemap.xml");
check(sitemap.text.includes(`${baseUrl}/shop`) || sitemap.text.includes("https://iarahk.com/shop"), "sitemap contains the shop");
check(!sitemap.text.includes("/account") && !sitemap.text.includes("/checkout") && !sitemap.text.includes("/ops"), "sitemap excludes private routes");
const productPath = sitemap.text.match(/<loc>https?:\/\/[^<]+(\/product\/[^<]+)<\/loc>/)?.[1];
check(Boolean(productPath), "sitemap contains at least one product");

const llms = await get("/llms.txt");
check(llms.response.headers.get("content-type")?.includes("text/plain"), "llms.txt is plain text");
check(llms.text.includes("# Iara Jewellery") && llms.text.includes("## Primary sources") && llms.text.includes("## Citation guidance"), "llms.txt exposes source and citation guidance");

const pages = [{ path: "/", canonical: "/", schemas: ["Organization", "LocalBusiness", "WebSite"] }, { path: "/shop", canonical: "/shop", schemas: [] }, { path: "/faq", canonical: "/faq", schemas: ["FAQPage"] }, { path: "/journal", canonical: "/journal", schemas: ["Article"] }];
if (productPath) pages.push({ path: productPath, canonical: productPath, schemas: ["Product", "BreadcrumbList"] });

for (const page of pages) {
  const { response, text } = await get(page.path);
  const expectedCanonical = `${baseUrl}${page.canonical}`;
  const actualCanonical = canonical(text);
  check(normalizedUrl(actualCanonical) === normalizedUrl(expectedCanonical) || normalizedUrl(actualCanonical) === normalizedUrl(`https://iarahk.com${page.canonical}`), `${page.path} has the expected canonical`);
  check(/<title>[^<]{8,}<\/title>/i.test(text), `${page.path} has a descriptive title`);
  check(description(text).length >= 20, `${page.path} has a meta description`);
  const structured = schemas(text);
  for (const type of page.schemas) check(hasType(structured, type) || (type === "LocalBusiness" && hasType(structured, "JewelryStore")), `${page.path} exposes ${type} structured data`);
  if (page.path === "/") {
    for (const header of ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "content-security-policy"]) check(Boolean(response.headers.get(header)), `responses include ${header}`);
  }
}

if (failures.length) {
  console.error(`\nSEO/GEO audit failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log("\nSEO/GEO audit passed.");
