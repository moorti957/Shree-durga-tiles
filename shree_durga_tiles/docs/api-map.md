# Mobile admin API map

The Expo app uses the shared Express/MongoDB backend. Set
`EXPO_PUBLIC_API_BASE_URL` to the API root including `/api`. Admin calls use
owner-only bearer authentication, and list endpoints return `data` plus
top-level pagination `meta`.

| Mobile feature | API |
|---|---|
| Sign in/session | `POST /admin/auth/login`, `POST /admin/auth/refresh`, `POST /admin/auth/logout`, `GET /admin/auth/me` |
| Dashboard | `GET /admin/dashboard` (counts, live visitors, due balances, latest rows) |
| Notifications | `GET /admin/notifications` |
| Products | `GET/POST /admin/products`, `GET/PATCH/DELETE /admin/products/:id`, `PATCH /admin/products/:id/price`, `PATCH /admin/products/:id/status` |
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id`, `POST /admin/categories/reorder` |
| Photos | `POST /admin/uploads` with multipart field `file` |
| Visitors | `GET /admin/visitors`, `GET /admin/visitors/live`, `GET /admin/visitors/:visitorId`, `GET /admin/analytics/visitors` |
| Enquiries | `GET /admin/enquiries`, `GET /admin/enquiries/:id`, `PATCH /admin/enquiries/:id` |
| Bills | `GET/POST /admin/bills`, `GET/PUT /admin/bills/:id`, and the finalize, cancel, payment, and share-link endpoints documented in [`API.md`](../../docs/API.md) |
| Shop settings | `GET/PATCH /admin/settings` |
| Public bill verification | `GET /public/bills/verify/:token` (minimal public invoice details only) |

## Billing behavior

The server recomputes totals from quantities, rates, GST, delivery, discount,
and advance values; amounts submitted by clients are not authoritative. Drafts
receive an invoice number only when finalized. The app creates PDF files on the
device for printing/sharing; PDFs are not stored by the backend. `PUBLIC_API_URL`
should be set behind a proxy so QR verification links use the public HTTPS API.

## Remaining gaps

- Expo push-token registration and push delivery are not implemented. The
  notifications screen currently fetches the server-side enquiry/bill feed.
- The backend does not create or host PDFs; printing and PDF sharing use the
  device print APIs.
- The product list sort control is client-side presentation over a bounded
  first-page query, not server-side full-catalog sorting.
- Backend build and mobile unit tests pass; the backend currently has no
  automated test script. Real device, network, and visual design checks are
  still required before release.

For emulator, LAN, HTTPS, and build setup, see the [app README](../README.md).
