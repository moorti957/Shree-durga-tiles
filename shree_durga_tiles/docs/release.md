# Release checklist

1. Install dependencies from the app directory with `npm ci`.
2. Set `EXPO_PUBLIC_USE_MOCK_API=false` and
   `EXPO_PUBLIC_API_BASE_URL=https://<public-host>/api` in the EAS environment.
3. Configure `EAS_PROJECT_ID` after linking this app with `eas init`.
4. Configure backend `PUBLIC_API_URL` to the same public HTTPS API root, then
   bootstrap and verify the owner account.
5. Run `npm run typecheck`, `npm run lint`, and `npm test`.
6. Build a preview APK with `eas build -p android --profile preview`.
7. Install and smoke-test login, product update, visitor/enquiry screens,
   bill creation/finalization/payment, QR verification, photo upload, and PDF
   sharing on a physical Android device.
8. Promote only after HTTPS, backup/restore, and signing-credential ownership
   are confirmed. The production EAS profile produces an Android App Bundle;
   use the preview profile when an APK artifact is required.

Never put admin passwords, signing keystores, or API secrets in the Expo
`EXPO_PUBLIC_*` environment. Those values are bundled into the application.

## Physical Android test checklist

- [ ] Install the preview APK on a clean device and verify it reaches the
  configured LAN HTTP API; verify the same preview APK can reach an HTTPS API.
- [ ] Confirm login, secure session restoration, logout, and refresh after an
  expired access token.
- [ ] Upload JPEG, PNG, and WebP photos; verify they appear, are upright, and
  remain readable after server-side resize. Confirm SVG or a renamed invalid
  image is rejected with a visible error.
- [ ] Create and edit a bill, verify subtotal, GST split, discount, delivery,
  whole-rupee round-off, advance, amount-in-words, and COD/balance on screen.
- [ ] Finalize a bill, download/share the server PDF, and scan its QR with
  another phone; verify the public page shows the correct invoice without
  customer contact details.
- [ ] Add a payment, verify the remaining balance, then test the share-link
  action using WhatsApp or another share target.
- [ ] Grant/deny notification permission and verify device registration when
  Android Firebase app configuration (`GOOGLE_SERVICES_JSON_PATH` in the EAS
  build environment) and backend FCM credentials are configured. With backend
  FCM credentials absent, confirm registration succeeds and the app reports
  that delivery is disabled.
- [ ] Build/install the production artifact against HTTPS and verify an HTTP API
  URL is rejected and cleartext traffic is disabled.

Never commit `google-services.json`; provide it through the EAS file-variable
mechanism when building Android push-enabled releases.
