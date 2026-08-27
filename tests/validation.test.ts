import { describe, expect, it } from "vitest";
import { checkoutSchema, inventorySchema } from "@/lib/validation";
describe("checkout validation",()=>{it("requires a delivery address",()=>{expect(()=>checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"DELIVERY"})).toThrow();});it("allows store pickup without an address",()=>{expect(checkoutSchema.parse({email:"a@example.com",customerName:"Ada",phone:"91234567",deliveryMethod:"PICKUP"}).deliveryMethod).toBe("PICKUP");});});
describe("inventory validation",()=>{it("rejects negative stock",()=>{expect(()=>inventorySchema.parse({stockOnHand:-1,reason:"count"})).toThrow();});});
