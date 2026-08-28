export function getTrustedOrigins() {
  return Array.from(new Set([
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    // Production custom domains. Keep both hosts trusted because Render
    // serves the www hostname as a redirecting custom domain and browsers
    // may still send the original origin during the transition.
    "https://iarahk.com",
    "https://www.iarahk.com",
    "https://iara-jewellery-web.onrender.com",
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"])
  ].filter((origin): origin is string => Boolean(origin)).map((origin) => new URL(origin).origin)));
}
