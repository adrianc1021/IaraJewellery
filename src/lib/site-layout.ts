import { db } from "@/lib/db";
import { DEFAULT_SITE_LAYOUT, type SiteLayoutValues } from "@/lib/site-layout-shared";

export const SITE_LAYOUT_ID = "homepage";

export async function getSiteLayout(): Promise<SiteLayoutValues> {
  const settings = await db.siteLayoutSetting.findUnique({ where: { id: SITE_LAYOUT_ID } });
  if (!settings) return { ...DEFAULT_SITE_LAYOUT };
  return {
    heroHeight: settings.heroHeight,
    categoryTileHeight: settings.categoryTileHeight,
    sectionSpacing: settings.sectionSpacing,
    newArrivalsColumns: settings.newArrivalsColumns,
    productImageRatio: settings.productImageRatio,
    editorialHeight: settings.editorialHeight,
    curationTileHeight: settings.curationTileHeight,
    categoryColumns: settings.categoryColumns ?? DEFAULT_SITE_LAYOUT.categoryColumns,
    heroContentPosition: (settings.heroContentPosition ?? DEFAULT_SITE_LAYOUT.heroContentPosition) as SiteLayoutValues["heroContentPosition"],
    showNewArrivals: settings.showNewArrivals ?? true,
    showCategories: settings.showCategories ?? true,
    showSignature: settings.showSignature ?? true,
    showCuration: settings.showCuration ?? true,
    showPet: settings.showPet ?? true,
    showCraft: settings.showCraft ?? true,
    showServices: settings.showServices ?? true
  };
}
