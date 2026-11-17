# Backend integration status

## Implemented for the mobile app

- Enriched admin dashboard, notification feed, live visitor list, and visitor
  detail endpoint.
- Enquiry detail reads and existing status/private-note updates.
- Owner-authenticated category reorder, product price, and product status APIs.
- Draft bill creation/update, paise-based server-side total calculation,
  idempotent creation and payments, atomic invoice counter allocation,
  finalize/cancel, and public verification links.
- Public verification exposes bill number/date, shop name, total, and status
  only. Customer contact information remains private.

## Not implemented

- Expo push-token registration/delivery. Notifications are currently fetched
  when the app is open.
- Server-hosted PDFs. The app creates PDFs using the native print module.
- A backend test suite/script. Run the TypeScript build after backend changes.

## Operations

Set `PUBLIC_API_URL` to the public API origin including `/api` (for example
`https://example.com/api`) when deployed behind a TLS-terminating reverse proxy.
The QR URL is persisted on finalization so subsequent share actions do not
invalidate previously printed verification codes.
