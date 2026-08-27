import { cookies } from "next/headers";

export type Locale = "zh-HK" | "en";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get("iara-locale")?.value === "en" ? "en" : "zh-HK";
}
