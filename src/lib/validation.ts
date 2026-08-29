import { z } from "zod";

export const cartItemSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(5).default(1) });
export const cartUpdateSchema = z.object({ quantity: z.number().int().min(1).max(5) });

export const appointmentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().min(8).max(24),
  preferredContact: z.enum(["WHATSAPP", "PHONE", "EMAIL"]),
  storeId: z.string().min(1),
  appointmentDate: z.coerce.date(),
  timeSlot: z.string().min(1).max(30),
  interest: z.string().min(1).max(100),
  budgetRange: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  marketingConsent: z.boolean().default(false)
});

export const checkoutSchema = z.object({
  email: z.email(), customerName: z.string().min(2).max(80), phone: z.string().min(8).max(24),
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]), shippingAddress: z.string().max(500).optional(),
  giftMessage: z.string().max(300).optional(), promotionCode: z.string().max(30).optional(),
  paymentMethod: z.string().trim().min(2).max(40).default("CREDIT_CARD")
}).superRefine((value, ctx) => {
  if (value.deliveryMethod === "DELIVERY" && !value.shippingAddress?.trim()) ctx.addIssue({ code: "custom", path: ["shippingAddress"], message: "請填寫配送地址。" });
});

export const orderStatusSchema = z.object({ orderStatus: z.enum(["PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED", "CANCELLED"]), note: z.string().max(500).optional() });
export const inventorySchema = z.object({ stockOnHand: z.number().int().min(0).max(100000), reason: z.string().min(3).max(300) });
export const appointmentStatusSchema = z.object({ status: z.enum(["NEW", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"]), assignedTo: z.string().max(80).optional(), internalNote: z.string().max(500).optional() });

export const siteLayoutSchema = z.object({
  heroHeight: z.number().int().min(560).max(920),
  categoryTileHeight: z.number().int().min(220).max(520),
  sectionSpacing: z.number().int().min(56).max(140),
  newArrivalsColumns: z.number().int().min(2).max(5),
  productImageRatio: z.enum(["1 / 1", "3 / 4", "4 / 5"]),
  editorialHeight: z.number().int().min(460).max(820),
  curationTileHeight: z.number().int().min(300).max(620)
});

const optionalUrl = z.union([z.literal(""), z.url().refine((value) => value.startsWith("https://"), "只接受 HTTPS 網址。")]).optional();

const popupAnnouncementFields = z.object({
  eyebrow: z.string().trim().max(60).optional(),
  title: z.string().trim().min(2).max(80),
  body: z.string().trim().min(2).max(500),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaHref: z.union([z.literal(""), z.string().trim().regex(/^\/(?!\/)/, "連結必須是網站內的路徑。")]).optional(),
  imageUrl: optionalUrl,
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  active: z.boolean().default(true),
  showOnce: z.boolean().default(true)
});

export const popupAnnouncementSchema = popupAnnouncementFields.superRefine((value, ctx) => {
  if (value.endsAt <= value.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "結束時間必須遲於開始時間。" });
  if (Boolean(value.ctaLabel) !== Boolean(value.ctaHref)) ctx.addIssue({ code: "custom", path: ["ctaHref"], message: "按鈕文字與連結必須同時填寫。" });
});

export const popupAnnouncementUpdateSchema = popupAnnouncementFields.partial();

export const catalogGroupSchema = z.object({
  kind: z.enum(["CATEGORY", "COLLECTION"]),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameZh: z.string().trim().min(1).max(80),
  nameEn: z.string().trim().min(1).max(80),
  imageUrl: optionalUrl,
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(1000).default(0)
});

export const catalogGroupUpdateSchema = catalogGroupSchema.omit({ kind: true, slug: true }).partial();

const productImageReference = z.string().trim().refine((value) => {
  if (/^\/api\/media\/products\/[0-9]{13}-[0-9a-f-]{36}\.webp$/i.test(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "圖片網址無效。" );

export const productCreateSchema = z.object({
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameZh: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().min(2).max(120),
  descriptionZh: z.string().trim().min(2).max(1200),
  descriptionEn: z.string().trim().min(2).max(1200),
  category: z.string().trim().min(1).max(80),
  collection: z.string().trim().min(1).max(80),
  audience: z.enum(["PEOPLE", "PET"]),
  material: z.string().trim().min(1).max(100),
  gemstone: z.string().trim().min(1).max(100),
  diamondWeight: z.string().trim().max(80).optional(),
  diamondColorClarity: z.string().trim().max(120).optional(),
  pendantDimensions: z.string().trim().max(80).optional(),
  chainLength: z.string().trim().max(80).optional(),
  productWeight: z.string().trim().max(80).optional(),
  claspType: z.string().trim().max(80).optional(),
  origin: z.string().trim().max(120).optional(),
  hasCertificate: z.boolean().default(false),
  isNaturalDiamond: z.boolean().default(false),
  engravingAvailable: z.boolean().default(false),
  chainLengthAdjustable: z.boolean().default(false),
  warrantyYears: z.number().int().min(0).max(99).default(1),
  careRepair: z.string().trim().max(500).optional(),
  badge: z.string().trim().max(40).optional(),
  imageUrl: productImageReference.optional(),
  imageUrls: z.array(productImageReference).min(1).max(6).optional(),
  featured: z.boolean().default(false),
  sku: z.string().trim().min(3).max(80),
  optionName: z.string().trim().min(1).max(80),
  priceMinor: z.number().int().min(100).max(100_000_000),
  stockOnHand: z.number().int().min(0).max(100000)
}).superRefine((value, ctx) => {
  if (!value.imageUrl && !value.imageUrls?.length) ctx.addIssue({ code: "custom", path: ["imageUrls"], message: "請上載至少一張商品圖片。" });
});

export const productUpdateSchema = z.object({
  nameZh: z.string().trim().min(2).max(120).optional(),
  nameEn: z.string().trim().min(2).max(120).optional(),
  descriptionZh: z.string().trim().min(2).max(1200).optional(),
  descriptionEn: z.string().trim().min(2).max(1200).optional(),
  material: z.string().trim().min(1).max(100).optional(),
  gemstone: z.string().trim().min(1).max(100).optional(),
  badge: z.string().trim().max(40).optional(),
  imageUrl: productImageReference.optional(),
  imageUrls: z.array(productImageReference).min(1).max(6).optional(),
  sku: z.string().trim().min(3).max(80).optional(),
  optionName: z.string().trim().min(1).max(80).optional(),
  priceMinor: z.number().int().min(100).max(100_000_000).optional(),
  stockOnHand: z.number().int().min(0).max(100000).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  category: z.string().trim().min(1).max(80).optional(),
  collection: z.string().trim().min(1).max(80).optional(),
  audience: z.enum(["PEOPLE", "PET"]).optional(),
  diamondWeight: z.string().trim().max(80).optional(),
  diamondColorClarity: z.string().trim().max(120).optional(),
  pendantDimensions: z.string().trim().max(80).optional(),
  chainLength: z.string().trim().max(80).optional(),
  productWeight: z.string().trim().max(80).optional(),
  claspType: z.string().trim().max(80).optional(),
  origin: z.string().trim().max(120).optional(),
  hasCertificate: z.boolean().optional(),
  isNaturalDiamond: z.boolean().optional(),
  engravingAvailable: z.boolean().optional(),
  chainLengthAdjustable: z.boolean().optional(),
  warrantyYears: z.number().int().min(0).max(99).optional(),
  careRepair: z.string().trim().max(500).optional()
});

const paymentQrReference = z.union([
  z.literal(""),
  z.url().refine((value) => value.startsWith("https://"), "只接受 HTTPS 圖片網址。"),
  z.string().regex(/^\/api\/media\/payment\/[0-9]{13}-[0-9a-f-]{36}\.webp$/i, "QR Code 圖片網址無效。")
]).optional();

export const paymentSettingsSchema = z.object({
  methods: z.array(z.object({ code: z.string().min(2).max(40), enabled: z.boolean() })).min(1).max(20),
  fpsNumber: z.string().trim().max(80).optional(),
  qrCodeUrl: paymentQrReference
});

export const paymentMethodsSchema = paymentSettingsSchema.pick({ methods: true });

export const memberProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(24).optional(),
  locale: z.enum(["zh-HK", "en"]),
  marketingConsent: z.boolean()
});

export const adminCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(12).max(128),
  role: z.enum(["ANALYST", "MARKETING", "WAREHOUSE", "CUSTOMER_SERVICE", "MERCHANDISER", "ADMIN"])
}).superRefine((value, ctx) => {
  if (!/[A-Z]/.test(value.password) || !/[a-z]/.test(value.password) || !/[0-9]/.test(value.password)) {
    ctx.addIssue({ code: "custom", path: ["password"], message: "密碼必須包含大寫、小寫英文字母及數字。" });
  }
});
