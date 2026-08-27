import { describe, expect, it } from "vitest";
import { checkoutSchema, inventorySchema, siteLayoutSchema } from "@/lib/validation";
describe("checkout validation",()=>{it("requires a delivery address",()=>{expect(()=>checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"DELIVERY"})).toThrow();});it("allows store pickup without an address",()=>{expect(checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"PICKUP"}).deliveryMethod).toBe("PICKUP");});});
describe("inventory validation",()=>{it("rejects negative stock",()=>{expect(()=>inventorySchema.parse({stockOnHand:-1,reason:"count"})).toThrow();});});
describe("site layout validation",()=>{
  const valid={heroHeight:760,categoryTileHeight:320,sectionSpacing:96,newArrivalsColumns:4,productImageRatio:"4 / 5",editorialHeight:660,curationTileHeight:460};
  it("accepts a complete layout",()=>expect(siteLayoutSchema.parse(valid)).toEqual(valid));
  it("rejects unsafe grid sizes",()=>expect(()=>siteLayoutSchema.parse({...valid,newArrivalsColumns:8})).toThrow());
  it("rejects unsupported image ratios",()=>expect(()=>siteLayoutSchema.parse({...valid,productImageRatio:"16 / 9"})).toThrow());
});
