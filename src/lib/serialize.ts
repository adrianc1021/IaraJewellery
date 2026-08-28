import { parseImages } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { localizeProductValue } from "@/lib/product-i18n";

type CartWithItems = { id: string; items: Array<{ id: string; quantity: number; variant: { id: string; sku: string; optionName: string; priceMinor: number; currency: string; stockOnHand: number; stockReserved: number; product: { id: string; slug: string; nameZh: string; nameEn: string; imagesJson: string } } }> };
export function serializeCart(cart: CartWithItems, locale: Locale = "zh-HK") {
  const items = cart.items.map((item) => ({ id: item.id, quantity: item.quantity, variantId: item.variant.id, sku: item.variant.sku, optionName: localizeProductValue(item.variant.optionName, locale), unitPriceMinor: item.variant.priceMinor, currency: item.variant.currency, available: Math.max(0, item.variant.stockOnHand - item.variant.stockReserved), product: { id: item.variant.product.id, slug: item.variant.product.slug, name: locale === "en" ? item.variant.product.nameEn : item.variant.product.nameZh, image: parseImages(item.variant.product.imagesJson)[0] }, lineTotalMinor: item.variant.priceMinor * item.quantity }));
  return { id: cart.id, items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotalMinor: items.reduce((sum, item) => sum + item.lineTotalMinor, 0) };
}
