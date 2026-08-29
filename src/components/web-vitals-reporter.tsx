"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, id: metric.id, path: window.location.pathname, navigationType: metric.navigationType });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/vitals", new Blob([payload], { type: "application/json" }));
    else void fetch("/api/vitals", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true });
  });
  return null;
}
