# Shree Durga Admin

Private Expo app for managing the Shree Durga Tiles website. The existing Flutter starter is preserved in `legacy_flutter/`; the active app is the Expo project at this directory root.

## Requirements

- Node.js supported by the Expo SDK in `package.json`
- npm
- Android Studio/emulator or a physical Android device
- EAS CLI for cloud APK builds

## Start the app

```powershell
Copy-Item .env.example .env
npm install
npm start
```

The app and both Next.js clients use the same backend API. Set `EXPO_PUBLIC_API_BASE_URL` in the mobile app's `.env`; mock mode is off by default and is permitted only for development.

### Android emulator

The checked-in development example uses the standard Android Emulator host mapping:

```dotenv
EXPO_PUBLIC_NETWORK_PROFILE=development
EXPO_PUBLIC_ALLOW_HTTP=true
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_USE_MOCK_API=false
```

The backend listens on `0.0.0.0:5000` by default, so the emulator can reach it through `10.0.2.2`. This address is for the standard Android Emulator only, not a physical phone.

### Physical Android phone: stable HTTPS tunnel

Do not use the phone's `localhost`, your computer's LAN IP, or the Expo Metro tunnel for API traffic. For a stable hostname, set up a Cloudflare Tunnel once:

1. Use a Cloudflare account and a domain whose DNS is managed by Cloudflare.
2. In the Cloudflare Zero Trust dashboard, create a named tunnel and install `cloudflared` on the development computer.
3. Add a public hostname such as `api-dev.your-domain.example` and route it to `http://localhost:5000`.
4. Install/run the tunnel as a Windows service using the token provided by Cloudflare, so it reconnects after computer restarts. Keep the token private.
5. In this app's `.env`, use that permanent hostname:

```dotenv
EXPO_PUBLIC_NETWORK_PROFILE=development
EXPO_PUBLIC_ALLOW_HTTP=false
EXPO_PUBLIC_API_BASE_URL=https://api-dev.your-domain.example/api
EXPO_PUBLIC_USE_MOCK_API=false
```

Replace the example hostname with the one assigned to your tunnel. The same URL works on a phone on another network while the development computer, backend, and tunnel service are running. This one-time account/domain setup cannot be completed by this repository.

On Windows, install the Cloudflare-managed tunnel service from an elevated PowerShell prompt with `cloudflared.exe service install <TUNNEL_TOKEN>`. Obtain the token from the Cloudflare dashboard; never put it in this repository or an Expo environment variable.

Native requests do not use browser CORS. For a web client hosted on the tunnel's local machine, add its exact origin to the backend's `ALLOWED_ORIGINS`.

### Run the applications

In separate terminals from the repository root:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

```powershell
cd admin
Copy-Item .env.example .env.local
npm install
npm run dev -- -p 3001
```

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in each web app's `.env.local` for local development. Both clients use the same variable and centralized Axios client. Check the backend at `http://localhost:5000/api/health`.

### Environment variables

| App | Variable | Development | Preview / production |
| --- | --- | --- | --- |
| Backend | `PORT` | `5000` | Use the hosting provider's assigned port |
| Backend | `HOST` | `0.0.0.0` | Defaults to `0.0.0.0` |
| Backend | `MONGODB_URI` | Local MongoDB or a managed database | Required; use a managed MongoDB service |
| Backend | `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Exact HTTPS origins for the deployed web apps, comma-separated |
| Backend | `PUBLIC_API_URL` | `http://localhost:5000/api` | Required public HTTPS API URL ending in `/api` |
| Admin and storefront | `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Same public HTTPS API URL used by the mobile app |
| Mobile | `EXPO_PUBLIC_API_BASE_URL` | Emulator mapping or stable HTTPS tunnel | Public HTTPS API URL ending in `/api` |

`NODE_ENV=production` is required on the production backend. Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, and any enabled Cloudinary, mail, payment, or push credentials only in the backend's secret manager. Never place backend credentials in `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*`. `ALLOWED_ORIGINS` contains website origins (no `/api` path); it is not the backend URL.

### EAS preview and production

Set `EXPO_PUBLIC_API_BASE_URL` as a plaintext URL variable in the matching EAS environment (the value is public app configuration, not a credential). For EAS development builds targeting a physical phone, set it to the stable tunnel URL; `10.0.2.2` is only for an Android Emulator.

- `development`: local emulator URL or stable HTTPS development tunnel URL.
- `preview`: public HTTPS staging API ending in `/api`.
- `production`: permanent public HTTPS API ending in `/api`.

Preview and production reject HTTP, localhost, private IPs, missing URLs, and mock mode. The EAS project ID and app identity remain unchanged. Set these variables in the Expo project's EAS environment settings; no tunnel or local computer is used for production.

Build an internal APK:

```powershell
npm install -g eas-cli
eas build -p android --profile preview
```

Build a store bundle with `eas build -p android --profile production`. Set the same permanent production API URL in both web deployments as `NEXT_PUBLIC_API_URL`, and on the backend as `PUBLIC_API_URL`. Configure `ALLOWED_ORIGINS` with the deployed website origins. Keep MongoDB, JWT, payment, and Cloudinary credentials only in the backend hosting environment, never in `EXPO_PUBLIC_*` or `NEXT_PUBLIC_*`.

For backend endpoint coverage and remaining integration gaps, see
[`docs/backend-gaps.md`](./docs/backend-gaps.md) and
[`docs/api-map.md`](./docs/api-map.md). Before release, complete the
[`UI checklist`](./docs/ui-checklist.md) and
[`release checklist`](./docs/release.md).
