ALTER TABLE "PaymentMethodSetting" ADD COLUMN "accountReference" TEXT;
ALTER TABLE "PaymentMethodSetting" ADD COLUMN "qrCodeUrl" TEXT;

UPDATE "PaymentMethodSetting"
SET "enabled" = CASE WHEN "code" IN ('FPS', 'PAYME', 'ALIPAY') THEN 1 ELSE 0 END;
