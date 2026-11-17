import Constants from 'expo-constants';
import { resolveApiConfig } from './apiConfig';

const config = Constants.expoConfig?.extra;

const networkProfile =
  typeof config?.networkProfile === 'string'
    ? config.networkProfile
    : process.env.EXPO_PUBLIC_NETWORK_PROFILE ?? 'production';
const allowHttp = config?.allowHttp === true || process.env.EXPO_PUBLIC_ALLOW_HTTP === 'true';
const useMockApi =
  process.env.EXPO_PUBLIC_USE_MOCK_API !== undefined
    ? process.env.EXPO_PUBLIC_USE_MOCK_API === 'true'
    : config?.useMockApi === true;
const resolvedConfig = resolveApiConfig({
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    (typeof config?.apiBaseUrl === 'string' ? config.apiBaseUrl : undefined),
  networkProfile,
  allowHttp,
  useMockApi,
});

export const API_BASE_URL = resolvedConfig.apiBaseUrl;
export const USE_MOCK_API = resolvedConfig.useMockApi;
