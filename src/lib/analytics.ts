"use client";

const forbidden = /email|phone|name|address|password|card|message|note/i;
export function track(event: string, properties: Record<string, string | number | boolean> = {}) {
  for (const key of Object.keys(properties)) if (forbidden.test(key)) throw new Error(`Analytics property '${key}' may contain PII.`);
  window.dispatchEvent(new CustomEvent("iara:analytics", { detail: { event, properties } }));
  const posthog = (window as unknown as { posthog?: { capture: (name: string, props: typeof properties) => void } }).posthog;
  posthog?.capture(event, properties);
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", event, properties);
}
