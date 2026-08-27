import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const STAFF_ROLES = ["ANALYST", "MARKETING", "WAREHOUSE", "CUSTOMER_SERVICE", "MERCHANDISER", "ADMIN", "SUPER_ADMIN"] as const;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return session;
}

export async function requireStaffIdentity(allowed: readonly string[] = STAFF_ROLES) {
  const session = await getSession();
  const role = session?.user.role ?? "CUSTOMER";
  if (!session || !allowed.includes(role)) redirect("/login?next=/ops");
  return session;
}

export async function requireStaff(allowed: readonly string[] = STAFF_ROLES) {
  const session = await requireStaffIdentity(allowed);
  if (process.env.NODE_ENV === "production" && !session.user.twoFactorEnabled) {
    redirect("/ops/security?next=/ops");
  }
  return session;
}

export function can(role: string, allowed: readonly string[]) {
  return allowed.includes(role);
}
