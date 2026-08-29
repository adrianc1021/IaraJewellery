import type { NextConfig } from "next";

const secureDeployment = process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://");
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  ...(process.env.NODE_ENV === "production" ? [
    ...(secureDeployment ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
    { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://cdn.sanity.io; font-src 'self' data:; connect-src 'self' https://us.i.posthog.com; worker-src 'self' blob:; media-src 'self'${secureDeployment ? "; upgrade-insecure-requests" : ""}` }
  ] : [])
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Keep canonical and descriptive metadata in the initial document head for
  // search crawlers, AI answer engines and audit tools that do not execute JS.
  htmlLimitedBots: /.*/,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "cdn.sanity.io" }]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
