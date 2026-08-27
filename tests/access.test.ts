import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { can, STAFF_ROLES } from "@/lib/access";

const protectedPages = [
  "page.tsx",
  "appointments/page.tsx",
  "audit/page.tsx",
  "catalog/page.tsx",
  "inventory/page.tsx",
  "layout/page.tsx",
  "marketing/page.tsx",
  "members/page.tsx",
  "orders/page.tsx",
  "payments/page.tsx",
];

describe("role checks", () => {
  it("does not grant customers operations access", () => expect(can("CUSTOMER", STAFF_ROLES)).toBe(false));
  it("grants warehouse staff operations access", () => expect(can("WAREHOUSE", STAFF_ROLES)).toBe(true));
  it("authorizes every operations page before its first database query", () => {
    for (const page of protectedPages) {
      const source = readFileSync(new URL(`../src/app/ops/(dashboard)/${page}`, import.meta.url), "utf8");
      expect(source.indexOf("await requireStaff()"), page).toBeGreaterThan(-1);
      const firstQuery = source.indexOf("db.");
      if (firstQuery >= 0) expect(source.indexOf("await requireStaff()"), page).toBeLessThan(firstQuery);
    }
  });
});
