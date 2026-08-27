import { describe, expect, it } from "vitest";
import { checkoutSchema, inventorySchema, popupAnnouncementSchema, siteLayoutSchema } from "@/lib/validation";
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
