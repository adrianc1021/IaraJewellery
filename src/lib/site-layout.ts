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
    curationTileHeight: settings.curationTileHeight
  };
}
