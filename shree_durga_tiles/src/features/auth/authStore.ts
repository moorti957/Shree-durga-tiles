import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { AdminUser } from '@/api/types';

const ACCESS_KEY = 'shree-durga-admin.access';
const REFRESH_KEY = 'shree-durga-admin.refresh';
const BIOMETRIC_KEY = 'shree-durga-admin.biometric-enabled';

type AuthState = {
  user: AdminUser | null;
  initialized: boolean;
  setSession: (user: AdminUser, accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
  initialize: () => Promise<void>;
};

export const readAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const readRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);
export const isBiometricEnabled = async () => (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === 'true';
export const setBiometricEnabled = (enabled: boolean) =>
  SecureStore.setItemAsync(BIOMETRIC_KEY, String(enabled));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
 
setSession: async (user, accessToken, refreshToken) => {
  console.log('[AUTH] Access token received:', !!accessToken);
  console.log('[AUTH] Refresh token received:', !!refreshToken);

  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not contain valid tokens.');
  }

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    SecureStore.setItemAsync(
      'shree-durga-admin.session-user',
      JSON.stringify(user)
    ),
  ]);

  const savedToken = await SecureStore.getItemAsync(ACCESS_KEY);

  console.log('[AUTH] Token saved:', !!savedToken);

  if (!savedToken) {
    throw new Error('Failed to save access token.');
  }

  set({ user, initialized: true });
},

  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync('shree-durga-admin.session-user'),
    ]);
    set({ user: null, initialized: true });
  },
  initialize: async () => {
    const [accessToken, rawUser] = await Promise.all([
      readAccessToken(),
      SecureStore.getItemAsync('shree-durga-admin.session-user'),
    ]);
    let user: AdminUser | null = null;
    if (accessToken && rawUser) {
      try {
        user = JSON.parse(rawUser) as AdminUser;
      } catch {
        await SecureStore.deleteItemAsync('shree-durga-admin.session-user');
      }
    }
    set({ user: accessToken ? user : null, initialized: true });
  },
}));
