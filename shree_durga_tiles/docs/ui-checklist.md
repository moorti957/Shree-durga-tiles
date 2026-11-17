# UI and workflow checklist

## Implemented

- [x] Secure owner sign-in, session refresh, and biometric toggle.
- [x] Dashboard counts, recent activity, and quick navigation.
- [x] Product search/list, draft/published toggle, price editing, and product
  create/edit forms with image selection and upload.
- [x] Category create/edit, visibility toggle, image selection, and reordering.
- [x] Visitor list/detail, enquiry status/private note, and contact actions.
- [x] Bill creation/preview, server finalization, verification QR, payment
  recording, cancellation, local PDF share/print.
- [x] Notifications feed and API mock adapter.
- [x] TypeScript, lint, and billing-helper test checks.

## Release verification still required

- [ ] Compare all screens against the supplied design images on a physical
  Android device at target density and system font scale.
- [ ] Verify camera/gallery permissions, biometric prompts, PDF sharing, and
  printing on supported Android versions.
- [ ] Test offline/error states against a reachable development backend.
- [ ] Verify the production HTTPS API URL, TLS certificate, and owner account.
- [ ] Run an EAS APK build and install the generated APK on a clean device.
