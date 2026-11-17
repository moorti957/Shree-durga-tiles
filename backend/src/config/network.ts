import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && (!configuredOrigins || configuredOrigins.length === 0)) {
  throw new Error('ALLOWED_ORIGINS must contain the deployed web app origins in production.');
}

export const allowedOrigins = (configuredOrigins?.length
  ? configuredOrigins
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
).map((origin) => {
  if (origin === '*') {
    throw new Error('ALLOWED_ORIGINS cannot contain "*" when credentialed CORS is enabled.');
  }

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error(`Invalid web origin in ALLOWED_ORIGINS: "${origin}".`);
  }

  if (url.origin !== origin || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`ALLOWED_ORIGINS entries must be origins without paths: "${origin}".`);
  }
  if (isProduction && url.protocol !== 'https:') {
    throw new Error(`Production web origins must use HTTPS: "${origin}".`);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const octets = hostname.split('.').map(Number);
  const isPrivateIpv4 =
    octets.length === 4 &&
    octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&
    (octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168));
  if (
    isProduction &&
    (hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname === '::1' ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('fe80:') ||
      isPrivateIpv4)
  ) {
    throw new Error('Production ALLOWED_ORIGINS must use public web hostnames, not localhost or private IPs.');
  }

  return url.origin;
});

const configuredPublicApiUrl = process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, '');
if (isProduction && !configuredPublicApiUrl) {
  throw new Error('PUBLIC_API_URL must be configured with the deployed HTTPS API URL in production.');
}

if (configuredPublicApiUrl) {
  let publicApiUrl: URL;
  try {
    publicApiUrl = new URL(configuredPublicApiUrl);
  } catch {
    throw new Error('PUBLIC_API_URL must be an absolute HTTP(S) URL ending in /api.');
  }
  if (!['http:', 'https:'].includes(publicApiUrl.protocol) || !publicApiUrl.pathname.replace(/\/+$/, '').endsWith('/api')) {
    throw new Error('PUBLIC_API_URL must be an HTTP(S) URL ending in /api.');
  }
  if (publicApiUrl.username || publicApiUrl.password) {
    throw new Error('PUBLIC_API_URL must not contain embedded credentials.');
  }
  if (isProduction && publicApiUrl.protocol !== 'https:') {
    throw new Error('Production PUBLIC_API_URL must use HTTPS.');
  }
  const hostname = publicApiUrl.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const octets = hostname.split('.').map(Number);
  const isPrivateIpv4 =
    octets.length === 4 &&
    octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&
    (octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127));
  if (
    isProduction &&
    (hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname === '::1' ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('fe80:') ||
      isPrivateIpv4)
  ) {
    throw new Error('Production PUBLIC_API_URL must use a public hostname, not localhost or a private IP.');
  }
}

export const PUBLIC_API_URL = configuredPublicApiUrl;

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

export const PORT = port;
export const HOST = process.env.HOST?.trim() || '0.0.0.0';
