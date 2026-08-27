# Analytics

The client `track` helper rejects PII-shaped property keys. GA4 and PostHog keys are optional environment variables. Recommended ecommerce events are `view_item_list`, `view_item`, `add_to_wishlist`, `add_to_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `purchase`, `payment_failed`, `appointment_submit`, `sign_up` and `login`.

Purchase must be emitted once, from a server-confirmed paid order. Names, email, phone, addresses, gift messages, internal notes and payment data must never be included.
