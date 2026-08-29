import { describe, expect, it } from "vitest";
import { filenameFromProductMediaUrl, isSafeMediaFilename, isSafePaymentFilename, isWebp, paymentMediaUrl, productMediaUrl } from "@/lib/media-storage";

const filename = "1756384400000-123e4567-e89b-12d3-a456-426614174000.webp";

describe("media storage", () => {
  it("accepts generated product filenames", () => {
    expect(isSafeMediaFilename(filename)).toBe(true);
    expect(productMediaUrl(filename)).toBe(`/api/media/products/${filename}`);
    expect(filenameFromProductMediaUrl(`/api/media/products/${filename}`)).toBe(filename);
  });

  it("rejects traversal paths", () => {
    expect(isSafeMediaFilename("../secret.webp")).toBe(false);
    expect(filenameFromProductMediaUrl("/api/media/products/../secret.webp")).toBeNull();
  });

  it("creates safe payment QR paths", () => {
    expect(isSafePaymentFilename(filename)).toBe(true);
    expect(paymentMediaUrl(filename)).toBe(`/api/media/payment/${filename}`);
    expect(isSafePaymentFilename("../payment.webp")).toBe(false);
  });

  it("checks the WebP signature", () => {
    expect(isWebp(new TextEncoder().encode("RIFF1234WEBP"))).toBe(true);
    expect(isWebp(new TextEncoder().encode("not-a-webp"))).toBe(false);
  });
});
