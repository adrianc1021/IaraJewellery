PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT, "role" TEXT NOT NULL DEFAULT 'CUSTOMER', "status" TEXT NOT NULL DEFAULT 'ACTIVE', "membershipTier" TEXT NOT NULL DEFAULT 'MEMBER',
  "phone" TEXT, "locale" TEXT NOT NULL DEFAULT 'zh-HK', "marketingConsent" INTEGER NOT NULL DEFAULT 0, "twoFactorEnabled" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY, "expiresAt" DATETIME NOT NULL, "token" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL, "ipAddress" TEXT, "userAgent" TEXT, "userId" TEXT NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL, "issuer" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT, "accessTokenExpiresAt" DATETIME, "refreshTokenExpiresAt" DATETIME,
  "scope" TEXT, "password" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

CREATE TABLE IF NOT EXISTS "Verification" (
  "id" TEXT NOT NULL PRIMARY KEY, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME
);
CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "Verification"("identifier");

CREATE TABLE IF NOT EXISTS "TwoFactor" (
  "id" TEXT NOT NULL PRIMARY KEY, "secret" TEXT NOT NULL, "backupCodes" TEXT NOT NULL, "verified" INTEGER NOT NULL DEFAULT 1,
  "failedVerificationCount" INTEGER NOT NULL DEFAULT 0, "lockedUntil" DATETIME, "userId" TEXT NOT NULL,
  CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactor_userId_key" ON "TwoFactor"("userId");

CREATE TABLE IF NOT EXISTS "Address" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "label" TEXT NOT NULL DEFAULT '主要地址', "recipient" TEXT NOT NULL,
  "phone" TEXT NOT NULL, "line1" TEXT NOT NULL, "line2" TEXT, "district" TEXT NOT NULL, "region" TEXT NOT NULL DEFAULT '香港',
  "postalCode" TEXT, "isDefault" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL PRIMARY KEY, "sanityProductId" TEXT NOT NULL, "slug" TEXT NOT NULL, "nameZh" TEXT NOT NULL, "nameEn" TEXT NOT NULL,
  "descriptionZh" TEXT NOT NULL, "descriptionEn" TEXT NOT NULL, "storyZh" TEXT NOT NULL, "category" TEXT NOT NULL, "collection" TEXT NOT NULL,
  "material" TEXT NOT NULL, "gemstone" TEXT NOT NULL, "badge" TEXT, "imagesJson" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "featured" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sanityProductId_key" ON "Product"("sanityProductId");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Product_category_status_idx" ON "Product"("category", "status");
CREATE INDEX IF NOT EXISTS "Product_collection_status_idx" ON "Product"("collection", "status");

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT NOT NULL PRIMARY KEY, "productId" TEXT NOT NULL, "sku" TEXT NOT NULL, "optionName" TEXT NOT NULL, "priceMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'HKD', "barcode" TEXT, "stockOnHand" INTEGER NOT NULL DEFAULT 0, "stockReserved" INTEGER NOT NULL DEFAULT 0,
  "lowStockAt" INTEGER NOT NULL DEFAULT 3, "active" INTEGER NOT NULL DEFAULT 1, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_active_idx" ON "ProductVariant"("productId", "active");

CREATE TABLE IF NOT EXISTS "InventoryMovement" (
  "id" TEXT NOT NULL PRIMARY KEY, "variantId" TEXT NOT NULL, "type" TEXT NOT NULL, "quantity" INTEGER NOT NULL, "reason" TEXT NOT NULL,
  "orderId" TEXT, "actorId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "InventoryMovement_variantId_createdAt_idx" ON "InventoryMovement"("variantId", "createdAt");

CREATE TABLE IF NOT EXISTS "Cart" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "guestToken" TEXT, "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_userId_key" ON "Cart"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_guestToken_key" ON "Cart"("guestToken");

CREATE TABLE IF NOT EXISTS "CartItem" (
  "id" TEXT NOT NULL PRIMARY KEY, "cartId" TEXT NOT NULL, "variantId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_variantId_key" ON "CartItem"("cartId", "variantId");

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "productId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL PRIMARY KEY, "orderNumber" TEXT NOT NULL, "userId" TEXT, "email" TEXT NOT NULL, "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL, "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING', "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
  "orderStatus" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT', "currency" TEXT NOT NULL DEFAULT 'HKD', "subtotalMinor" INTEGER NOT NULL,
  "discountMinor" INTEGER NOT NULL DEFAULT 0, "shippingMinor" INTEGER NOT NULL DEFAULT 0, "totalMinor" INTEGER NOT NULL,
  "deliveryMethod" TEXT NOT NULL DEFAULT 'DELIVERY', "shippingAddress" TEXT, "giftMessage" TEXT, "promotionCode" TEXT,
  "stripePaymentId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripePaymentId_key" ON "Order"("stripePaymentId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_orderStatus_idx" ON "Order"("createdAt", "orderStatus");
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "variantId" TEXT NOT NULL,
  "productName" TEXT NOT NULL, "sku" TEXT NOT NULL, "optionName" TEXT NOT NULL, "unitPriceMinor" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL, "lineTotalMinor" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE TABLE IF NOT EXISTS "InventoryReservation" (
  "id" TEXT NOT NULL PRIMARY KEY, "variantId" TEXT NOT NULL, "orderId" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE', "expiresAt" DATETIME NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryReservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InventoryReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryReservation_orderId_variantId_key" ON "InventoryReservation"("orderId", "variantId");
CREATE INDEX IF NOT EXISTS "InventoryReservation_expiresAt_status_idx" ON "InventoryReservation"("expiresAt", "status");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "provider" TEXT NOT NULL DEFAULT 'STRIPE', "providerIntent" TEXT,
  "status" TEXT NOT NULL, "amountMinor" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'HKD',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerIntent_key" ON "Payment"("providerIntent");

CREATE TABLE IF NOT EXISTS "Refund" (
  "id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "providerRefundId" TEXT, "amountMinor" INTEGER NOT NULL,
  "reason" TEXT NOT NULL, "status" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Refund_providerRefundId_key" ON "Refund"("providerRefundId");

CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  "id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "status" TEXT NOT NULL, "note" TEXT, "actorId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

CREATE TABLE IF NOT EXISTS "PointsTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "points" INTEGER NOT NULL, "orderId" TEXT,
  "reason" TEXT NOT NULL, "expiresAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PointsTransaction_userId_createdAt_idx" ON "PointsTransaction"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "Store" (
  "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "address" TEXT NOT NULL, "hours" TEXT NOT NULL, "phone" TEXT NOT NULL,
  "active" INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "storeId" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL, "preferredContact" TEXT NOT NULL, "appointmentDate" DATETIME NOT NULL, "timeSlot" TEXT NOT NULL,
  "interest" TEXT NOT NULL, "budgetRange" TEXT, "notes" TEXT, "marketingConsent" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'NEW', "assignedTo" TEXT, "internalNote" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Appointment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Appointment_appointmentDate_status_idx" ON "Appointment"("appointmentDate", "status");
CREATE INDEX IF NOT EXISTS "Appointment_userId_idx" ON "Appointment"("userId");

CREATE TABLE IF NOT EXISTS "Promotion" (
  "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "code" TEXT NOT NULL, "type" TEXT NOT NULL, "value" INTEGER NOT NULL,
  "minimumMinor" INTEGER NOT NULL DEFAULT 0, "usageLimit" INTEGER, "usageCount" INTEGER NOT NULL DEFAULT 0,
  "startsAt" DATETIME NOT NULL, "endsAt" DATETIME NOT NULL, "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Promotion_code_key" ON "Promotion"("code");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY, "actorId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL,
  "oldValue" TEXT, "newValue" TEXT, "reason" TEXT, "ipAddress" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY, "provider" TEXT NOT NULL, "eventType" TEXT NOT NULL, "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payloadHash" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "IdempotencyKey" (
  "id" TEXT NOT NULL PRIMARY KEY, "scope" TEXT NOT NULL, "response" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "IdempotencyKey_scope_id_key" ON "IdempotencyKey"("scope", "id");
