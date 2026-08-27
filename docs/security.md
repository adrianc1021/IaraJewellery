# Security Baseline

- Better Auth sessions use secure, HttpOnly, SameSite cookies in production.
- Password storage is delegated to Better Auth.
- Mutating APIs validate JSON with Zod, enforce same-origin requests and apply rate limits.
- Staff routes use explicit role allow-lists. Production `/ops` pages and APIs reject staff sessions until TOTP MFA is enabled.
- Stripe webhook signatures and idempotency event IDs are verified before payment state changes.
- Secrets are environment variables and `.env*` files are ignored.
- Analytics helpers reject PII-shaped properties.
- Members can download a scoped JSON export. Deletion requests set a review status and create an immutable audit entry; final deletion follows the company retention policy.

Run dependency scanning, backup restore drills, penetration testing and incident-response exercises before production launch.
