"use client";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
export function SignOutButton() { return <button className="button button-secondary" onClick={async () => { await signOut(); location.href = "/"; }}><LogOut size={15} />登出</button>; }
