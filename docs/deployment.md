# Deployment

## Render

1. Create a staging service from `render.yaml`.
2. Supply `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, a unique `SEED_ADMIN_EMAIL` and a 12+ character `SEED_ADMIN_PASSWORD`, plus Stripe test keys and webhook secret. For production email and Sanity, add `RESEND_API_KEY`, `EMAIL_FROM`, `SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_WEBHOOK_SECRET` in the Render service environment (never commit their values).
3. Run checkout, webhook replay and backup-restore tests in staging.
4. The checked-in blueprint uses a persistent SQLite disk for immediate review. Before production launch, follow ADR 0002 and migrate to an isolated Render PostgreSQL database.
5. Create separate staging and production Sanity datasets and Stripe accounts.

## Cloudflare

1. Add the custom domain to Render.
2. Create a DNS-only CNAME to the Render hostname and remove conflicting AAAA records.
3. Wait for the Render certificate, then enable proxying and use Full (Strict) SSL.
4. Never cache `/api/*`, `/account/*`, `/cart`, `/checkout/*`, `/ops/*` or authentication callbacks.
5. Cache `/_next/static/*`, optimized public images and fonts. Add WAF and rate-limit rules for auth, checkout and appointments.

## Required launch gates

Stripe live webhook verification, email delivery, PostgreSQL migration, Sanity publishing, administrator MFA enrollment, backup restore, security testing, privacy contacts and company retention rules must be completed before accepting live payment.

## Production credentials checklist

- `STRIPE_SECRET_KEY`: live secret key (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET`: signing secret for `POST /api/webhooks/stripe`
- `RESEND_API_KEY`: Resend API key used for transactional mail
- `EMAIL_FROM`: verified sender, for example `Iara Jewellery <orders@irarhk.com>`
- `SANITY_PROJECT_ID`: production Sanity project ID
- `SANITY_DATASET`: normally `production`
- `SANITY_WEBHOOK_SECRET`: the same secret configured on the Sanity webhook; the endpoint validates the signed payload

After saving variables, redeploy the Render service and confirm `/api/health`, a Stripe test payment and a signed Sanity webhook in staging before switching to live keys.
