import { describe, expect, it } from "vitest";
import { formatMoney, parseImages } from "@/lib/format";
describe("formatMoney",()=>{it("formats integer minor units without floating point arithmetic",()=>{expect(formatMoney(1280000)).toContain("12,800");});});
describe("parseImages",()=>{it("fails closed for invalid content",()=>{expect(parseImages("not-json")).toEqual([]);});});
