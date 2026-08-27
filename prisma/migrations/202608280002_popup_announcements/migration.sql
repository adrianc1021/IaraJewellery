CREATE TABLE IF NOT EXISTS "PopupAnnouncement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eyebrow" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "ctaLabel" TEXT,
  "ctaHref" TEXT,
  "imageUrl" TEXT,
  "startsAt" DATETIME NOT NULL,
  "endsAt" DATETIME NOT NULL,
  "active" INTEGER NOT NULL DEFAULT 1,
  "showOnce" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "PopupAnnouncement_active_startsAt_endsAt_idx"
ON "PopupAnnouncement"("active", "startsAt", "endsAt");
