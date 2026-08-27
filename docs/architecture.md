# Iara Jewellery Architecture

## Runtime

- Next.js App Router serves the storefront, account area, operations console and route handlers.
- Prisma owns transactional data. The repository uses SQLite for zero-dependency local review; production migration to managed PostgreSQL is documented in ADR 0002.
- Better Auth owns users, credentials, sessions, email verification and two-factor records.
- Stripe owns payment methods and card data. Iara stores only provider IDs and reconciliation state.
- Sanity is the target system of record for editorial product content. Until credentials are supplied, seeded content is mirrored in Prisma so every workflow remains reviewable.

## Trust boundaries

The browser never supplies authoritative price, discount, inventory or payment state. Checkout reloads variants from the database, reserves stock in a transaction and creates a pending order. Only a verified Stripe webhook can move payment state to paid.

## Roles

`CUSTOMER`, `ANALYST`, `MARKETING`, `WAREHOUSE`, `CUSTOMER_SERVICE`, `MERCHANDISER`, `ADMIN`, `SUPER_ADMIN`.

Every `/ops` mutation checks a role allow-list and writes an `AuditLog` with old and new values.
