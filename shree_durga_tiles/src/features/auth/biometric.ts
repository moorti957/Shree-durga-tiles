import * as LocalAuthentication from 'expo-local-authentication';
import { isBiometricEnabled, readAccessToken } from './authStore';

export const unlockWithBiometrics = async () => {
  const [enabled, token, hardware, enrolled] = await Promise.all([
    isBiometricEnabled(),
    readAccessToken(),
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  if (!enabled || !token || !hardware || !enrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Shree Durga Admin',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
};
