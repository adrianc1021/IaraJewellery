# Data Ownership

| Domain | Source of truth | Notes |
| --- | --- | --- |
| Product copy, media, campaigns, journal, SEO | Sanity | Seeded Prisma mirror is used until Sanity credentials exist. |
| SKU, price, inventory, reservation | Prisma transactional database | Amounts are integer minor units. |
| Users, sessions, addresses, membership | Better Auth + Prisma | No session data is exposed to analytics. |
| Cart, wishlist, orders, refunds, appointments | Prisma transactional database | Mutations use validation and authorization. |
| Card and wallet credentials | Stripe | Never stored by Iara. |
| Traffic and behavior | GA4 / PostHog | PII is explicitly excluded. |
| Operations changes | AuditLog | Append-only application behavior. |
