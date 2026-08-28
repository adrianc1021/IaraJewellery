import path from "node:path";

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_IMAGE_BYTES = 1_600_000;

export function getMediaRoot() {
  return path.resolve(process.env.MEDIA_ROOT || path.join(process.cwd(), "data", "uploads"));
}

export function isSafeMediaFilename(filename: string) {
  return /^[0-9]{13}-[0-9a-f-]{36}\.webp$/i.test(filename);
}

export function resolveProductMediaPath(filename: string) {
  if (!isSafeMediaFilename(filename)) throw new Error("Invalid media filename");
  return path.join(getMediaRoot(), "products", filename);
}

export function productMediaUrl(filename: string) {
  if (!isSafeMediaFilename(filename)) throw new Error("Invalid media filename");
  return `/api/media/products/${filename}`;
}

export function isWebp(bytes: Uint8Array) {
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

export function filenameFromProductMediaUrl(url: string) {
  const match = url.match(/^\/api\/media\/products\/([^/?#]+)$/);
  if (!match || !isSafeMediaFilename(match[1])) return null;
  return match[1];
}
