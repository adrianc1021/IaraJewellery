export const DEFAULT_SITE_LAYOUT = {
  heroHeight: 760,
  categoryTileHeight: 320,
  sectionSpacing: 96,
  newArrivalsColumns: 4,
  productImageRatio: "4 / 5",
  editorialHeight: 660,
  curationTileHeight: 460,
  categoryColumns: 4,
  heroContentPosition: "left",
  showNewArrivals: true,
  showCategories: true,
  showSignature: true,
  showCuration: true,
  showPet: true,
  showCraft: true,
  showServices: true
} as const;

export type SiteLayoutValues = {
  heroHeight: number;
  categoryTileHeight: number;
  sectionSpacing: number;
  newArrivalsColumns: number;
  productImageRatio: string;
  editorialHeight: number;
  curationTileHeight: number;
  categoryColumns: number;
  heroContentPosition: "left" | "center";
  showNewArrivals: boolean;
  showCategories: boolean;
  showSignature: boolean;
  showCuration: boolean;
  showPet: boolean;
  showCraft: boolean;
  showServices: boolean;
};
