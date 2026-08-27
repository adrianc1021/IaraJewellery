# Sanity Content Model

The production Studio should define `siteSettings`, `navigation`, `homepage`, `page`, `product`, `productCollection`, `productCategory`, `material`, `gemstone`, `occasion`, `campaign`, `editorialArticle`, `jewelleryGuide`, `store`, `faq`, `seoObject`, `mediaBlock`, `heroBlock`, `productCarouselBlock`, `editorialBlock`, `appointmentBlock` and `newsletterBlock`.

`product` must include an immutable `productId` used to match `Product.sanityProductId`. Slugs are never foreign keys. Until project credentials are supplied, seed content is mirrored in Prisma so the storefront and operations workflows remain runnable. The webhook endpoint validates `x-iara-sanity-signature` and records transaction IDs for idempotency.
