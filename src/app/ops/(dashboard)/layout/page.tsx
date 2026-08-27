import { getSiteLayout } from "@/lib/site-layout";
import { LayoutSettingsForm } from "@/components/layout-settings-form";
import { OpsPageHeader } from "@/components/ops-shell";

export default async function OpsLayoutPage() {
  const settings = await getSiteLayout();
  return <><OpsPageHeader eyebrow="STOREFRONT" title="首頁版面" description="調整前台各板塊的比例與商品陳列密度，手機版會按螢幕自動適配。" /><section className="ops-panel"><LayoutSettingsForm initial={settings} /></section></>;
}
