import { describe, expect, it } from "vitest";
import { adminCreateSchema, catalogGroupSchema, checkoutSchema, inventorySchema, paymentMethodsSchema, popupAnnouncementSchema, productCreateSchema, siteLayoutSchema } from "@/lib/validation";
describe("checkout validation",()=>{it("requires a delivery address",()=>{expect(()=>checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"DELIVERY"})).toThrow();});it("allows store pickup without an address",()=>{expect(checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"PICKUP"}).deliveryMethod).toBe("PICKUP");});});
describe("inventory validation",()=>{it("rejects negative stock",()=>{expect(()=>inventorySchema.parse({stockOnHand:-1,reason:"count"})).toThrow();});});
describe("site layout validation",()=>{
  const valid={heroHeight:760,categoryTileHeight:320,sectionSpacing:96,newArrivalsColumns:4,productImageRatio:"4 / 5",editorialHeight:660,curationTileHeight:460};
  it("accepts a complete layout",()=>expect(siteLayoutSchema.parse(valid)).toEqual(valid));
  it("rejects unsafe grid sizes",()=>expect(()=>siteLayoutSchema.parse({...valid,newArrivalsColumns:8})).toThrow());
  it("rejects unsupported image ratios",()=>expect(()=>siteLayoutSchema.parse({...valid,productImageRatio:"16 / 9"})).toThrow());
});
describe("popup announcement validation",()=>{
  const valid={title:"私人鑑賞會",body:"誠邀會員預約參與。",ctaLabel:"立即預約",ctaHref:"/appointment",startsAt:"2026-09-01T10:00:00.000Z",endsAt:"2026-09-30T10:00:00.000Z",active:true,showOnce:true};
  it("accepts a scheduled popup",()=>expect(popupAnnouncementSchema.parse(valid).title).toBe("私人鑑賞會"));
  it("rejects an end before its start",()=>expect(()=>popupAnnouncementSchema.parse({...valid,endsAt:"2026-08-01T10:00:00.000Z"})).toThrow());
  it("requires CTA text and link together",()=>expect(()=>popupAnnouncementSchema.parse({...valid,ctaHref:""})).toThrow());
});
describe("catalogue validation",()=>{
  it("accepts a complete pet product",()=>expect(productCreateSchema.parse({slug:"luna-pet-tag",nameZh:"Luna 寵物名牌",nameEn:"Luna Pet Tag",descriptionZh:"舒適圓潤。",descriptionEn:"Softly finished.",category:"寵物吊牌",collection:"IARA PETS",audience:"PET",material:"18K 黃金",gemstone:"鑽石",imageUrl:"https://example.com/tag.jpg",featured:true,sku:"IARA-PET-01",optionName:"小型",priceMinor:880000,stockOnHand:5}).audience).toBe("PET"));
  it("accepts uploaded product media",()=>expect(productCreateSchema.parse({slug:"lumea-necklace",nameZh:"Lumea 項鏈",nameEn:"Lumea Necklace",descriptionZh:"流動光影。",descriptionEn:"Shaped by light.",category:"項鏈",collection:"LUMEA",audience:"PEOPLE",material:"18K 黃金",gemstone:"鑽石",imageUrls:["/api/media/products/1756384400000-123e4567-e89b-12d3-a456-426614174000.webp"],featured:false,sku:"IARA-01",optionName:"單一尺寸",priceMinor:1880000,stockOnHand:2}).imageUrls).toHaveLength(1));
  it("requires at least one product image",()=>expect(()=>productCreateSchema.parse({slug:"lumea-necklace",nameZh:"Lumea 項鏈",nameEn:"Lumea Necklace",descriptionZh:"流動光影。",descriptionEn:"Shaped by light.",category:"項鏈",collection:"LUMEA",audience:"PEOPLE",material:"18K 黃金",gemstone:"鑽石",featured:false,sku:"IARA-01",optionName:"單一尺寸",priceMinor:1880000,stockOnHand:2})).toThrow());
  it("rejects malformed image references",()=>expect(()=>productCreateSchema.parse({slug:"lumea-necklace",nameZh:"Lumea 項鏈",nameEn:"Lumea Necklace",descriptionZh:"流動光影。",descriptionEn:"Shaped by light.",category:"項鏈",collection:"LUMEA",audience:"PEOPLE",material:"18K 黃金",gemstone:"鑽石",imageUrl:"https://",featured:false,sku:"IARA-01",optionName:"單一尺寸",priceMinor:1880000,stockOnHand:2})).toThrow());
  it("rejects unsafe catalogue slugs",()=>expect(()=>catalogGroupSchema.parse({kind:"CATEGORY",slug:"../../rings",nameZh:"戒指",nameEn:"Rings",active:true,featured:false,sortOrder:1})).toThrow());
});
describe("payment settings validation",()=>{
  it("accepts enabled payment controls",()=>expect(paymentMethodsSchema.parse({methods:[{code:"FPS",enabled:true}]}).methods[0].enabled).toBe(true));
});
describe("admin creation validation",()=>{
  const valid={name:"Iara Admin",email:"admin@example.com",password:"SecureAdmin123",role:"ADMIN"};
  it("accepts a valid staff account",()=>expect(adminCreateSchema.parse(valid).role).toBe("ADMIN"));
  it("rejects weak passwords",()=>expect(()=>adminCreateSchema.parse({...valid,password:"password-only"})).toThrow());
  it("does not allow super admin elevation",()=>expect(()=>adminCreateSchema.parse({...valid,role:"SUPER_ADMIN"})).toThrow());
});
