import { describe, expect, it } from "vitest";
import { localizeProductCopy, localizeProductValue } from "../src/lib/product-i18n";

describe("product localisation", () => {
  it("translates controlled product values for English pages", () => {
    expect(localizeProductValue("18K 黃金", "en")).toBe("18K Yellow Gold");
    expect(localizeProductValue("藍寶石", "en")).toBe("Sapphire");
    expect(localizeProductValue("單一尺寸", "en")).toBe("One size");
  });

  it("preserves Chinese values on the Traditional Chinese site", () => {
    expect(localizeProductValue("18K 黃金", "zh-HK")).toBe("18K 黃金");
  });

  it("uses English fallback copy when an untranslated long value is Chinese", () => {
    expect(localizeProductCopy("尚未翻譯的保養說明", "en", "English care copy")).toBe("English care copy");
  });
});
