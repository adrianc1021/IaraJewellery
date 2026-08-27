"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({ twoFactorPage: "/two-factor" })
  ]
});
export const { signIn, signOut, signUp, useSession } = authClient;
