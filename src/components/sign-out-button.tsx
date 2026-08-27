"use client";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import type { Locale } from "@/lib/i18n";
export function SignOutButton({ locale = "zh-HK" }: { locale?: Locale }) { return <button className="button button-secondary" onClick={async () => { await signOut(); location.href = "/"; }}><LogOut size={15} />{locale === "en" ? "Sign out" : "登出"}</button>; }
