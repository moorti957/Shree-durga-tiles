# API documentation

The API is served below `/api`. Admin endpoints require the bearer access token
returned by `POST /admin/auth/login`, except the login, refresh, and logout
endpoints. Successful responses use `{ "success": true, "data": ... }`.
Paginated endpoints also include `meta: { page, limit, total, pages }`.

## Mobile admin additions

The private Expo admin app uses the existing admin API plus these additions.
All endpoints below are relative to `/api` and are protected by owner-only
admin authentication unless marked public.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/dashboard` | Counts, payment-due total, live visitor count, and recent rows for the mobile dashboard |
| `GET` | `/admin/notifications` | New enquiries and finalized bills with an outstanding balance |
| `GET` | `/admin/visitors/live` | Visitors seen during the last five minutes with recent pages and events |
| `GET` | `/admin/visitors/:visitorId` | Visitor profile, page history, events, and latest enquiry |
| `GET` | `/admin/enquiries/:id` | Enquiry details |
| `POST` | `/admin/categories/reorder` | Reorder categories with `{ categories: [{ id, sortOrder, displayOrder }] }` |
| `PATCH` | `/admin/products/:id/price` | Update a non-negative `price` and `priceUnit` |
| `PATCH` | `/admin/products/:id/status` | Set product `status` to `draft` or `published` |
| `POST` | `/admin/bills` | Create a draft bill and its items |
| `PUT` | `/admin/bills/:id` | Update a draft bill |
| `POST` | `/admin/bills/:id/finalize` | Assign an invoice number and public verification URL |
| `POST` | `/admin/bills/:id/cancel` | Cancel a draft or finalized bill |
| `POST` | `/admin/bills/:id/payments` | Record a cash, UPI, bank, or cheque payment |
| `POST` | `/admin/bills/:id/share-link` | Return the bill verification URL |
| `GET` | `/admin/bills/:id/pdf` | Download a finalized bill PDF with a verification QR code |
| `POST` | `/admin/devices/register` | Register or re-enable the authenticated admin's Android/iOS FCM device token |

`POST /admin/bills` accepts customer and delivery details, GST settings,
discount/advance amounts, and an `items` array of `{ name, qty, unit, rate }`.
The server validates and recomputes all monetary totals in paise; submitted
item amounts are not trusted. Create and payment requests may include an
`Idempotency-Key` header (up to 200 characters). Bill numbers are allocated
atomically by invoice prefix and bill year when a draft is finalized.

The share-link endpoint already existed in the mobile bill controller and
returns the persisted `verificationUrl` in `{ url, message }`. Finalized bills
include a `verificationUrl`. The PDF endpoint responds with `application/pdf`
and an attachment filename; it includes item rows, GST, discount, delivery,
round-off, advance, balance/COD, amount in words, and a QR code pointing to the
verification URL. Draft and cancelled bills cannot be downloaded as official
PDFs.

`POST /admin/devices/register` accepts
`{ "token": "<native FCM token>", "platform": "android" | "ios" }`.
Registration is idempotent per admin/token and re-enables an existing device.
It returns `pushDeliveryConfigured: false` when Firebase credentials are not
configured; registration still succeeds and push sending safely reports a
skipped result. Set all three backend variables `FCM_PROJECT_ID`,
`FCM_CLIENT_EMAIL`, and `FCM_PRIVATE_KEY` to enable Firebase Admin SDK
delivery. Delivery/configuration errors are surfaced; invalid/unregistered
tokens are disabled.

The public
`GET /public/bills/verify/:token` endpoint returns only the bill number, date,
shop name, total, and status; customer contact details are not exposed. The app
uses the authenticated PDF download for finalized bills and retains local print
preview for drafts and mock mode. The backend generates the PDF per request and
does not persist it.

Uploads through the backend upload routes validate the decoded raster image,
auto-rotate it, resize within 2000 x 2000 pixels without enlargement, and
re-encode it as WebP before Cloudinary receives it. Unsupported files such as
SVG are rejected. The legacy `GET /upload/signed-url` route is disabled so
clients cannot bypass server-side image validation and resizing.

For deployments behind a reverse proxy, set `PUBLIC_API_URL` to the canonical
public API root (for example `https://example.com/api`) so verification links
use HTTPS and the external hostname.

## Existing admin endpoints

Authentication, product/category CRUD, uploads, visitors, enquiries, bills,
settings, analytics, and site-content APIs are mounted under `/admin`. The
route definitions are in `backend/src/routes/admin.routes.ts`. Uploads use
multipart field `file` at `POST /admin/uploads`.

## Development URLs

- Android emulator: `http://10.0.2.2:5000/api`
- Physical phone on the same Wi-Fi: `http://<PC-LAN-IP>:5000/api`
- Production: an HTTPS API URL; configure TLS at the hosting proxy/load balancer.
- Preview/debug Android builds can use HTTP for a LAN API only when built with
  the `development` or `preview` EAS profile. The production profile disables
  Android cleartext traffic and enforces HTTPS.
