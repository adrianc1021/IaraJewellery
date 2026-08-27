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
  giftMessage: z.string().max(300).optional(), promotionCode: z.string().max(30).optional()
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
