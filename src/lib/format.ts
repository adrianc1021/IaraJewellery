export function formatMoney(minor: number, currency = "HKD") {
  return new Intl.NumberFormat("zh-HK", { style: "currency", currency, minimumFractionDigits: 0 }).format(minor / 100);
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium" }).format(new Date(value));
}

export function parseImages(imagesJson: string): string[] {
  try {
    const images = JSON.parse(imagesJson);
    return Array.isArray(images) ? images.filter((value): value is string => typeof value === "string") : [];
  } catch { return []; }
}
