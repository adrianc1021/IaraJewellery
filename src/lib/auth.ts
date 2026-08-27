import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";
import { getTrustedOrigins } from "@/lib/origins";

export const auth = betterAuth({
  appName: "Iara Jewellery",
  database: prismaAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    requireEmailVerification: false
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "CUSTOMER", input: false },
      status: { type: "string", required: false, defaultValue: "ACTIVE", input: false },
      membershipTier: { type: "string", required: false, defaultValue: "MEMBER", input: false },
      phone: { type: "string", required: false },
      locale: { type: "string", required: false, defaultValue: "zh-HK" },
      marketingConsent: { type: "boolean", required: false, defaultValue: false }
    }
  },
  session: { expiresIn: 60 * 60 * 24 * 14, updateAge: 60 * 60 * 24 },
  advanced: {
    cookiePrefix: "iara",
    useSecureCookies: process.env.NODE_ENV === "production"
  },
  trustedOrigins: getTrustedOrigins(),
  plugins: [twoFactor({ issuer: "Iara Jewellery" })]
});

export type AuthSession = typeof auth.$Infer.Session;
