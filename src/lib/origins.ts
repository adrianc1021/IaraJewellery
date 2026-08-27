export function getTrustedOrigins() {
  return Array.from(new Set([
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    "https://iara-jewellery-web.onrender.com",
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"])
  ].filter((origin): origin is string => Boolean(origin)).map((origin) => new URL(origin).origin)));
}
