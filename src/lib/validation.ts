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
