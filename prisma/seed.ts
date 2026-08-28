import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=88`;

const products = [
  { sanityProductId: "sanity-lumea-drop", slug: "lumea-diamond-drop-necklace", nameZh: "Lumea 鑽石水滴項鏈", nameEn: "Lumea Diamond Drop Necklace", category: "項鏈", collection: "LUMEA", audience: "PEOPLE", material: "18K 黃金", gemstone: "鑽石", badge: "NEW", featured: true, price: 1880000, img: "photo-1599643477877-530eb83abc8e", options: ["40 cm", "42 cm", "45 cm"] },
  { sanityProductId: "sanity-aria-ring", slug: "aria-diamond-ring", nameZh: "Aria 18K 金鑽石戒指", nameEn: "Aria Diamond Ring", category: "戒指", collection: "ARIA", audience: "PEOPLE", material: "18K 白金", gemstone: "鑽石", badge: "EXCLUSIVE", featured: true, price: 1260000, img: "photo-1605100804763-247f67b3557e", options: ["HK 10", "HK 12", "HK 14", "HK 16"] },
  { sanityProductId: "sanity-marea-earrings", slug: "marea-light-earrings", nameZh: "Marea 流光耳環", nameEn: "Marea Light Earrings", category: "耳環", collection: "MAREA", audience: "PEOPLE", material: "18K 白金", gemstone: "藍寶石", badge: "NEW", featured: true, price: 980000, img: "photo-1535632066927-ab7c9ab60908", options: ["單一尺寸"] },
  { sanityProductId: "sanity-solenne-bracelet", slug: "solenne-diamond-bracelet", nameZh: "Solenne 鑽石手鏈", nameEn: "Solenne Diamond Bracelet", category: "手鏈", collection: "SOLENNE", audience: "PEOPLE", material: "18K 玫瑰金", gemstone: "鑽石", badge: "LIMITED", featured: true, price: 2180000, img: "photo-1611591437281-460bfbe1220a", options: ["15 cm", "17 cm", "19 cm"] },
  { sanityProductId: "sanity-lumea-pearl", slug: "lumea-pearl-pendant", nameZh: "Lumea 月光珍珠吊墜", nameEn: "Lumea Moonlight Pearl Pendant", category: "吊墜", collection: "LUMEA", audience: "PEOPLE", material: "18K 黃金", gemstone: "珍珠", badge: "NEW", featured: false, price: 760000, img: "photo-1601121141461-9d6647bca1ed", options: ["42 cm"] },
  { sanityProductId: "sanity-aria-solitaire", slug: "aria-solitaire-ring", nameZh: "Aria 單鑽訂婚戒指", nameEn: "Aria Solitaire Engagement Ring", category: "戒指", collection: "ARIA BRIDAL", audience: "PEOPLE", material: "鉑金", gemstone: "鑽石", badge: "BRIDAL", featured: false, price: 5680000, img: "photo-1605100804763-247f67b3557e", options: ["HK 8", "HK 10", "HK 12", "HK 14", "HK 16"] },
  { sanityProductId: "sanity-marea-hoops", slug: "marea-gold-hoops", nameZh: "Marea 波紋圈形耳環", nameEn: "Marea Textured Hoops", category: "耳環", collection: "MAREA", audience: "PEOPLE", material: "18K 黃金", gemstone: "無寶石", badge: "BESTSELLER", featured: false, price: 680000, img: "photo-1630019852942-f89202989a59", options: ["小型", "大型"] },
  { sanityProductId: "sanity-tide-bangle", slug: "tide-gold-bangle", nameZh: "Tide 18K 金開口手鐲", nameEn: "Tide Gold Bangle", category: "手鏈", collection: "TIDE", audience: "PEOPLE", material: "18K 黃金", gemstone: "無寶石", badge: "BESTSELLER", featured: false, price: 1580000, img: "photo-1573408301185-9146fe634ad0", options: ["S", "M", "L"] },
  { sanityProductId: "sanity-pet-luna-tag", slug: "luna-diamond-pet-tag", nameZh: "Luna 鑽石寵物名牌", nameEn: "Luna Diamond Pet Tag", category: "寵物吊牌", collection: "IARA PETS", audience: "PET", material: "18K 黃金", gemstone: "鑽石", badge: "PET EDITION", featured: true, price: 1280000, img: "photo-1587300003388-59208cc962cb", options: ["小型", "中型"] },
  { sanityProductId: "sanity-pet-marea-charm", slug: "marea-pearl-collar-charm", nameZh: "Marea 珍珠頸圈吊飾", nameEn: "Marea Pearl Collar Charm", category: "寵物頸鏈", collection: "IARA PETS", audience: "PET", material: "18K 玫瑰金", gemstone: "珍珠", badge: "NEW", featured: true, price: 880000, img: "photo-1573865526739-10659fec78a5", options: ["單一尺寸"] }
];

async function seedUser(email: string, name: string, password: string, role: string, membershipTier: string) {
  const user = await prisma.user.upsert({ where: { email }, update: { name, role, membershipTier }, create: { id: `seed-${role.toLowerCase()}`, email, name, role, membershipTier, emailVerified: true } });
  const account = await prisma.account.findUnique({ where: { issuer_accountId: { issuer: "local:credential", accountId: user.id } } });
  if (!account) {
    const hashed = await hashPassword(password);
    await prisma.account.create({ data: { id: `account-${user.id}`, providerId: "credential", issuer: "local:credential", accountId: user.id, userId: user.id, password: hashed } });
  }
  return user;
}

async function main() {
  const store = await prisma.store.upsert({ where: { id: "central-atelier" }, update: {}, create: { id: "central-atelier", name: "Iara Central Atelier", address: "香港中環皇后大道中 80 號", hours: "星期一至日 11:00–20:00", phone: "+852 2180 8208" } });
  for (const [productIndex, data] of products.entries()) {
    const productSpecs = { diamondWeight: data.gemstone === "鑽石" ? "0.35 ct" : null, diamondColorClarity: data.gemstone === "鑽石" ? "F / VS1" : null, pendantDimensions: data.category === "吊墜" ? "12 × 8 mm" : null, chainLength: ["項鏈", "吊墜"].includes(data.category) ? "40–45 cm" : null, productWeight: "約 3 g", claspType: data.audience === "PET" ? "安全環扣" : "龍蝦扣", origin: data.audience === "PET" ? "香港工房" : "香港工房／手工製作", hasCertificate: data.gemstone === "鑽石", isNaturalDiamond: data.gemstone === "鑽石", engravingAvailable: data.audience === "PET" || data.category === "吊墜", chainLengthAdjustable: ["項鏈", "吊墜"].includes(data.category), warrantyYears: 1, careRepair: "一年保養及基本維修；提供終身清潔檢查。" };
    const product = await prisma.product.upsert({ where: { slug: data.slug }, update: productSpecs, create: { sanityProductId: data.sanityProductId, slug: data.slug, nameZh: data.nameZh, nameEn: data.nameEn, descriptionZh: data.audience === "PET" ? "以舒適比例與圓潤邊緣設計，為珍愛的伙伴留下一道專屬光芒。" : "以細膩曲線承托寶石，讓珍貴自然融入每一天。", descriptionEn: data.audience === "PET" ? "Comfortably proportioned and softly finished for a companion's everyday signature." : "Sculpted to carry light with effortless ease, every day.", storyZh: "每件作品在香港工房經歷細緻鑲嵌、拋光與品質檢查。", category: data.category, collection: data.collection, audience: data.audience, material: data.material, gemstone: data.gemstone, ...productSpecs, badge: data.badge, featured: data.featured, imagesJson: JSON.stringify([image(data.img)]) } });
    for (const [optionIndex, optionName] of data.options.entries()) {
      const sku = `IARA-${String(productIndex + 1).padStart(3, "0")}-${String(optionIndex + 1).padStart(2, "0")}`;
      await prisma.productVariant.upsert({ where: { sku }, update: {}, create: { productId: product.id, sku, optionName, priceMinor: data.price, stockOnHand: data.badge === "LIMITED" ? 3 : 12, lowStockAt: 3 } });
    }
  }
  const groups = [
    ["CATEGORY", "rings", "戒指", "Rings", "photo-1605100804763-247f67b3557e", 10],
    ["CATEGORY", "necklaces", "項鏈", "Necklaces", "photo-1599643478518-a784e5dc4c8f", 20],
    ["CATEGORY", "earrings", "耳環", "Earrings", "photo-1535632066927-ab7c9ab60908", 30],
    ["CATEGORY", "bracelets", "手鏈", "Bracelets", "photo-1611591437281-460bfbe1220a", 40],
    ["CATEGORY", "pendants", "吊墜", "Pendants", "photo-1601121141461-9d6647bca1ed", 50],
    ["CATEGORY", "pet-tags", "寵物吊牌", "Pet Tags", "photo-1587300003388-59208cc962cb", 60],
    ["CATEGORY", "pet-collars", "寵物頸鏈", "Pet Collar Charms", "photo-1573865526739-10659fec78a5", 70],
    ["COLLECTION", "lumea", "LUMEA", "LUMEA", null, 10],
    ["COLLECTION", "aria", "ARIA", "ARIA", null, 20],
    ["COLLECTION", "aria-bridal", "ARIA BRIDAL", "ARIA BRIDAL", null, 30],
    ["COLLECTION", "marea", "MAREA", "MAREA", null, 40],
    ["COLLECTION", "solenne", "SOLENNE", "SOLENNE", null, 50],
    ["COLLECTION", "tide", "TIDE", "TIDE", null, 60],
    ["COLLECTION", "iara-pets", "IARA PETS", "IARA PETS", null, 70]
  ] as const;
  for (const [kind, slug, nameZh, nameEn, photo, sortOrder] of groups) {
    await prisma.catalogGroup.upsert({ where: { kind_slug: { kind, slug } }, update: {}, create: { kind, slug, nameZh, nameEn, imageUrl: photo ? image(photo) : null, sortOrder, featured: kind === "CATEGORY" && sortOrder <= 40 } });
  }
  const paymentMethods = [
    ["CREDIT_CARD", "信用卡", "Credit card", true, "STRIPE", "透過 Stripe 安全付款。", "Secure payment via Stripe.", 10],
    ["APPLE_PAY", "Apple Pay", "Apple Pay", true, "STRIPE", "在支援的裝置上使用 Apple Pay。", "Use Apple Pay on a supported device.", 20],
    ["CASH", "現金", "Cash", true, "MANUAL", "只適用於門市自取，取貨時付款。", "Pay when collecting from our atelier.", 30],
    ["PAYME", "PayMe", "PayMe", false, "MANUAL", "訂單建立後會顯示付款指示。", "Payment instructions appear after checkout.", 40],
    ["FPS", "轉數快 FPS", "FPS", true, "MANUAL", "訂單建立後會顯示轉數快付款指示。", "FPS instructions appear after checkout.", 50],
    ["ALIPAY", "AlipayHK", "AlipayHK", false, "MANUAL", "訂單建立後會顯示付款指示。", "Payment instructions appear after checkout.", 60],
    ["WECHAT_PAY", "WeChat Pay HK", "WeChat Pay HK", false, "MANUAL", "訂單建立後會顯示付款指示。", "Payment instructions appear after checkout.", 70]
  ] as const;
  for (const [code, nameZh, nameEn, enabled, checkoutMode, instructionsZh, instructionsEn, sortOrder] of paymentMethods) {
    await prisma.paymentMethodSetting.upsert({ where: { code }, update: { nameZh, nameEn, checkoutMode, instructionsZh, instructionsEn, sortOrder }, create: { code, nameZh, nameEn, enabled, checkoutMode, instructionsZh, instructionsEn, sortOrder } });
  }
  await prisma.promotion.upsert({ where: { code: "WELCOME10" }, update: {}, create: { name: "新會員禮遇", code: "WELCOME10", type: "PERCENT", value: 10, minimumMinor: 200000, usageLimit: 500, startsAt: new Date("2026-01-01"), endsAt: new Date("2027-12-31") } });
  const production = process.env.NODE_ENV === "production";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || (production ? "" : "admin@iara.local");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || (production ? "" : "ChangeMe123!");
  if (!adminEmail || (production && adminPassword.length < 12)) {
    throw new Error("Production seed requires SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters.");
  }
  const admin = await seedUser(adminEmail, "Iara Admin", adminPassword, "SUPER_ADMIN", "VIP");
  if (!production) {
    const customer = await seedUser("member@iara.local", "陳雅琳", "Member123!", "CUSTOMER", "GOLD");
    const existingAppointment = await prisma.appointment.findFirst({ where: { email: customer.email } });
    if (!existingAppointment) await prisma.appointment.create({ data: { userId: customer.id, storeId: store.id, name: customer.name, email: customer.email, phone: "+852 9123 4567", preferredContact: "WHATSAPP", appointmentDate: new Date(Date.now() + 7 * 86400000), timeSlot: "15:00", interest: "ARIA BRIDAL", budgetRange: "HK$30,000–60,000", status: "CONFIRMED" } });
    const points = await prisma.pointsTransaction.count({ where: { userId: customer.id } });
    if (!points) await prisma.pointsTransaction.create({ data: { userId: customer.id, type: "EARN", points: 1280, reason: "示範會員迎新積分" } });
  }
  console.log(`Seeded ${products.length} products, store ${store.name}, admin ${admin.email}.`);
}

main().finally(() => prisma.$disconnect());
