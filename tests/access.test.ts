import { describe, expect, it } from "vitest";
import { can, STAFF_ROLES } from "@/lib/access";
describe("role checks",()=>{it("does not grant customers operations access",()=>expect(can("CUSTOMER",STAFF_ROLES)).toBe(false));it("grants warehouse staff operations access",()=>expect(can("WAREHOUSE",STAFF_ROLES)).toBe(true));});
