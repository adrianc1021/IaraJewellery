ALTER TABLE "Product" ADD COLUMN "audience" TEXT NOT NULL DEFAULT 'PEOPLE';
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'CREDIT_CARD';

CREATE INDEX IF NOT EXISTS "Product_audience_status_idx"
ON "Product"("audience", "status");

CREATE TABLE IF NOT EXISTS "CatalogGroup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nameZh" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "imageUrl" TEXT,
  "active" INTEGER NOT NULL DEFAULT 1,
  "featured" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CatalogGroup_kind_slug_key" UNIQUE ("kind", "slug")
);

CREATE INDEX IF NOT EXISTS "CatalogGroup_kind_active_sortOrder_idx"
ON "CatalogGroup"("kind", "active", "sortOrder");

CREATE TABLE IF NOT EXISTS "PaymentMethodSetting" (
  "code" TEXT NOT NULL PRIMARY KEY,
  "nameZh" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "enabled" INTEGER NOT NULL DEFAULT 0,
  "checkoutMode" TEXT NOT NULL DEFAULT 'MANUAL',
  "instructionsZh" TEXT,
  "instructionsEn" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedBy" TEXT,
  "updatedAt" DATETIME NOT NULL
);
