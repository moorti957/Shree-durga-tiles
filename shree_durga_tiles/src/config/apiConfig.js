const isPrivateOrLocalHostname = (hostname) => {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    return true;
  }

  const octets = host.split('.').map(Number);
  if (octets.length === 4 && octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255)) {
    const [first, second] = octets;
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 100 && second >= 64 && second <= 127)
    );
  }

  return host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:');
};

/**
 * @param {{ apiBaseUrl?: string; networkProfile: string; allowHttp: boolean; useMockApi: boolean }} input
 * @returns {{ apiBaseUrl: string; networkProfile: 'development' | 'preview' | 'production'; useMockApi: boolean }}
 */
const resolveApiConfig = ({ apiBaseUrl, networkProfile, allowHttp, useMockApi }) => {
  if (!['development', 'preview', 'production'].includes(networkProfile)) {
    throw new Error(`Unsupported network profile "${networkProfile}". Use development, preview, or production.`);
  }

  const profile = networkProfile;
  if (allowHttp && profile !== 'development') {
    throw new Error('EXPO_PUBLIC_ALLOW_HTTP=true is permitted only for the development profile.');
  }
  if (useMockApi && profile !== 'development') {
    throw new Error('Mock API mode is permitted only for the development profile.');
  }

  const baseUrl = apiBaseUrl?.trim().replace(/\/+$/, '') ?? '';
  if (!baseUrl && !useMockApi) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is required. Set it to the Android emulator URL or your stable HTTPS API tunnel.'
    );
  }

  if (!baseUrl) {
    return { apiBaseUrl: '', networkProfile: profile, useMockApi };
  }

  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be an absolute HTTP(S) URL ending in /api.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.replace(/\/+$/, '').endsWith('/api')) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be an HTTP(S) URL ending in /api.');
  }
  if (url.username || url.password) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must not contain embedded credentials.');
  }
  if (url.protocol === 'http:' && !(profile === 'development' && allowHttp)) {
    throw new Error('HTTPS is required unless HTTP is explicitly enabled for the development profile.');
  }
  if (profile !== 'development' && isPrivateOrLocalHostname(url.hostname)) {
    throw new Error('Preview and production API URLs must use a public hostname, not localhost or a private IP.');
  }

  return { apiBaseUrl: baseUrl, networkProfile: profile, useMockApi };
};

exports.resolveApiConfig = resolveApiConfig;
