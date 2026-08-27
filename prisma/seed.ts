import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=88`;

const products = [
  { sanityProductId: "sanity-lumea-drop", slug: "lumea-diamond-drop-necklace", nameZh: "Lumea 鑽石水滴項鏈", nameEn: "Lumea Diamond Drop Necklace", category: "項鏈", collection: "LUMEA", material: "18K 黃金", gemstone: "鑽石", badge: "NEW", featured: true, price: 1880000, img: "photo-1599643477877-530eb83abc8e", options: ["40 cm", "42 cm", "45 cm"] },
  { sanityProductId: "sanity-aria-ring", slug: "aria-diamond-ring", nameZh: "Aria 18K 金鑽石戒指", nameEn: "Aria Diamond Ring", category: "戒指", collection: "ARIA", material: "18K 白金", gemstone: "鑽石", badge: "EXCLUSIVE", featured: true, price: 1260000, img: "photo-1605100804763-247f67b3557e", options: ["HK 10", "HK 12", "HK 14", "HK 16"] },
  { sanityProductId: "sanity-marea-earrings", slug: "marea-light-earrings", nameZh: "Marea 流光耳環", nameEn: "Marea Light Earrings", category: "耳環", collection: "MAREA", material: "18K 白金", gemstone: "藍寶石", badge: "NEW", featured: true, price: 980000, img: "photo-1535632066927-ab7c9ab60908", options: ["單一尺寸"] },
  { sanityProductId: "sanity-solenne-bracelet", slug: "solenne-diamond-bracelet", nameZh: "Solenne 鑽石手鏈", nameEn: "Solenne Diamond Bracelet", category: "手鏈", collection: "SOLENNE", material: "18K 玫瑰金", gemstone: "鑽石", badge: "LIMITED", featured: true, price: 2180000, img: "photo-1611591437281-460bfbe1220a", options: ["15 cm", "17 cm", "19 cm"] },
  { sanityProductId: "sanity-lumea-pearl", slug: "lumea-pearl-pendant", nameZh: "Lumea 月光珍珠吊墜", nameEn: "Lumea Moonlight Pearl Pendant", category: "吊墜", collection: "LUMEA", material: "18K 黃金", gemstone: "珍珠", badge: "NEW", featured: false, price: 760000, img: "photo-1601121141461-9d6647bca1ed", options: ["42 cm"] },
  { sanityProductId: "sanity-aria-solitaire", slug: "aria-solitaire-ring", nameZh: "Aria 單鑽訂婚戒指", nameEn: "Aria Solitaire Engagement Ring", category: "戒指", collection: "ARIA BRIDAL", material: "鉑金", gemstone: "鑽石", badge: "BRIDAL", featured: false, price: 5680000, img: "photo-1605100804763-247f67b3557e", options: ["HK 8", "HK 10", "HK 12", "HK 14", "HK 16"] },
  { sanityProductId: "sanity-marea-hoops", slug: "marea-gold-hoops", nameZh: "Marea 波紋圈形耳環", nameEn: "Marea Textured Hoops", category: "耳環", collection: "MAREA", material: "18K 黃金", gemstone: "無寶石", badge: "BESTSELLER", featured: false, price: 680000, img: "photo-1630019852942-f89202989a59", options: ["小型", "大型"] },
  { sanityProductId: "sanity-tide-bangle", slug: "tide-gold-bangle", nameZh: "Tide 18K 金開口手鐲", nameEn: "Tide Gold Bangle", category: "手鏈", collection: "TIDE", material: "18K 黃金", gemstone: "無寶石", badge: "BESTSELLER", featured: false, price: 1580000, img: "photo-1573408301185-9146fe634ad0", options: ["S", "M", "L"] }
];

async function seedUser(email: string, name: string, password: string, role: string, membershipTier: string) {
  const user = await prisma.user.upsert({ where: { email }, update: { name, role, membershipTier }, create: { id: `seed-${role.toLowerCase()}`, email, name, role, membershipTier, emailVerified: true } });
  const hashed = await hashPassword(password);
  await prisma.account.upsert({
    where: { issuer_accountId: { issuer: "local:credential", accountId: user.id } },
    update: { password: hashed, providerId: "credential" },
    create: { id: `account-${user.id}`, providerId: "credential", issuer: "local:credential", accountId: user.id, userId: user.id, password: hashed }
  });
  return user;
}

async function main() {
  const store = await prisma.store.upsert({ where: { id: "central-atelier" }, update: {}, create: { id: "central-atelier", name: "Iara Central Atelier", address: "香港中環皇后大道中 80 號", hours: "星期一至日 11:00–20:00", phone: "+852 2180 8208" } });
  for (const [productIndex, data] of products.entries()) {
    const product = await prisma.product.upsert({ where: { slug: data.slug }, update: { nameZh: data.nameZh, nameEn: data.nameEn, category: data.category, collection: data.collection, material: data.material, gemstone: data.gemstone, badge: data.badge, featured: data.featured, imagesJson: JSON.stringify([image(data.img)]) }, create: { sanityProductId: data.sanityProductId, slug: data.slug, nameZh: data.nameZh, nameEn: data.nameEn, descriptionZh: "以細膩曲線承托寶石，讓珍貴自然融入每一天。", descriptionEn: "Sculpted to carry light with effortless ease, every day.", storyZh: "每件作品在香港工房經歷細緻鑲嵌、拋光與品質檢查。", category: data.category, collection: data.collection, material: data.material, gemstone: data.gemstone, badge: data.badge, featured: data.featured, imagesJson: JSON.stringify([image(data.img)]) } });
    for (const [optionIndex, optionName] of data.options.entries()) {
      const sku = `IARA-${String(productIndex + 1).padStart(3, "0")}-${String(optionIndex + 1).padStart(2, "0")}`;
      await prisma.productVariant.upsert({ where: { sku }, update: { optionName, priceMinor: data.price }, create: { productId: product.id, sku, optionName, priceMinor: data.price, stockOnHand: data.badge === "LIMITED" ? 3 : 12, lowStockAt: 3 } });
    }
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
