"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type Announcement = { id: string; eyebrow: string | null; title: string; body: string; ctaLabel: string | null; ctaHref: string | null; imageUrl: string | null; showOnce: boolean; updatedAt: string };

export function SiteAnnouncementPopup({ locale = "zh-HK" }: { locale?: Locale }) {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);
  const en = locale === "en";

  useEffect(() => {
    if (pathname.startsWith("/ops") || pathname === "/login" || pathname === "/register") return;
    let cancelled = false;
    fetch("/api/announcement", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => {
      if (cancelled || !data?.announcement) return;
      const item = data.announcement as Announcement;
      const key = `iara.popup.${item.id}.${item.updatedAt}`;
      const storage = item.showOnce ? localStorage : sessionStorage;
      if (storage.getItem(key)) return;
      setAnnouncement(item);
      window.setTimeout(() => { if (!cancelled) setVisible(true); }, 900);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    document.body.classList.add("popup-open");
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.classList.remove("popup-open"); window.removeEventListener("keydown", closeOnEscape); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    if (announcement) {
      const key = `iara.popup.${announcement.id}.${announcement.updatedAt}`;
      (announcement.showOnce ? localStorage : sessionStorage).setItem(key, "dismissed");
    }
    setVisible(false);
  }

  if (!announcement) return null;
  return <div className={`site-popup ${visible ? "visible" : ""}`} aria-hidden={!visible}>
    <button className="site-popup-backdrop" aria-label={en ? "Close notice" : "關閉通告"} onClick={dismiss} tabIndex={visible ? 0 : -1} />
    <section className={`site-popup-dialog ${announcement.imageUrl ? "with-image" : ""}`} role="dialog" aria-modal="true" aria-labelledby="site-popup-title">
      {announcement.imageUrl && <div className="site-popup-image" style={{ backgroundImage: `url(${announcement.imageUrl})` }} role="img" aria-label={en ? "Iara notice image" : "Iara 通告圖片"} />}
      <div className="site-popup-copy"><button className="icon-button site-popup-close" onClick={dismiss} aria-label={en ? "Close notice" : "關閉通告"}><X size={18} /></button><p className="eyebrow">{announcement.eyebrow || "IARA PRIVATE NOTICE"}</p><h2 id="site-popup-title">{announcement.title}</h2><p>{announcement.body}</p>{announcement.ctaLabel && announcement.ctaHref && <Link className="button button-primary" href={announcement.ctaHref} onClick={dismiss}>{announcement.ctaLabel}<ArrowRight size={15} /></Link>}<button className="site-popup-dismiss" onClick={dismiss}>{en ? "Not now" : "暫時不用"}</button></div>
    </section>
  </div>;
}
