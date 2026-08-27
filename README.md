# Iara Jewellery

Full-stack high-end jewellery commerce system for the Hong Kong market. It includes the editorial storefront, product catalogue and detail pages, Better Auth membership, guest/member cart, wishlist, appointment booking, checkout with server-side validation, Stripe webhook handling, member dashboard and RBAC operations console.

## Run locally

```bash
cp .env.example .env
pnpm install
pnpm db:setup
pnpm dev
```

Open `http://localhost:3000`.

Demo accounts:

- Member: `member@iara.local` / `Member123!`
- Operations: `admin@iara.local` / `ChangeMe123!`

Change all seed credentials outside local development.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Architecture

- Next.js App Router and strict TypeScript
- Prisma transactional model with reviewed migration and seed data
- Better Auth email/password sessions and two-factor data model
- Integer minor-unit prices, server-side repricing and 15-minute inventory reservations
- Verified, idempotent Stripe and Sanity webhooks
- Role-protected `/ops` console with append-only audit logs
- Responsive WCAG-oriented design system and SEO metadata

The included SQLite configuration provides a zero-service local review and Render preview. Staff MFA is enforced automatically in production; administrators enroll from the member security screen before entering `/ops`. Production launch still requires the PostgreSQL migration, real Sanity/Stripe/email credentials, backup restore drills and the launch gates in [deployment.md](docs/deployment.md).

## Existing design prototype

The original standalone HTML/CSS/JavaScript prototype remains at repository root for design history. The production application source is under `src/`.
