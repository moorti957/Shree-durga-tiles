
import type { ExpoConfig } from 'expo/config';
import { resolveApiConfig } from './src/config/apiConfig.js';

const easBuildProfile = process.env.EAS_BUILD_PROFILE;
const networkProfile =
  easBuildProfile ??
  process.env.EXPO_PUBLIC_NETWORK_PROFILE ??
  (process.env.NODE_ENV === 'development' ? 'development' : 'production');

const allowHttp = process.env.EXPO_PUBLIC_ALLOW_HTTP === 'true';
const useMockApi = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
const { apiBaseUrl } = resolveApiConfig({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  networkProfile,
  allowHttp,
  useMockApi,
});

const googleServicesFile = process.env.GOOGLE_SERVICES_JSON_PATH;

const config: ExpoConfig = {
  name: 'Shree Durga Admin',
  slug: 'shree-durga-admin',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'shreedurgaadmin',
  userInterfaceStyle: 'light',
  newArchEnabled: true,

  icon: './assets/icon.png',

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0E0F12',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'in.shreedurgatiles.admin',
  },

  android: {
    package: 'in.shreedurgatiles.admin',
    ...(googleServicesFile ? { googleServicesFile } : {}),
    versionCode: 1,

    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0E0F12',
      monochromeImage: './assets/adaptive-icon-monochrome.png',
    },

    permissions: [
      'CAMERA',
      'POST_NOTIFICATIONS',
      'USE_BIOMETRIC',
    ],
  },

  plugins: [
    'expo-router',
    'expo-secure-store',

    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: allowHttp,
        },
      },
    ],

    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Shree Durga Admin to select product and category photos.',
        cameraPermission:
          'Allow Shree Durga Admin to take product and category photos.',
      },
    ],

    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#D4B27A',
        defaultChannel: 'admin-updates',
      },
    ],

    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        imageWidth: 180,
        backgroundColor: '#0E0F12',
      },
    ],
  ],

  updates: {
    url: 'https://u.expo.dev/8d189b34-68c8-41d7-9102-8872cb842f64',
  },

  runtimeVersion: {
    policy: 'appVersion',
  },

  experiments: {
    typedRoutes: true,
  },

  extra: {
    apiBaseUrl,
    useMockApi,
    allowHttp,
    networkProfile,

    eas: {
      projectId: '8d189b34-68c8-41d7-9102-8872cb842f64',
    },
  },
};

export default config;
