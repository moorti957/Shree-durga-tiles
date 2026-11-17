import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Types } from 'mongoose';
import { PushDevice } from '../models/PushDevice';

export type PushResult =
  | { skipped: true; reason: 'FCM_NOT_CONFIGURED' | 'NO_REGISTERED_DEVICES' }
  | { skipped: false; sent: number; failed: number };

const fcmCredentials = () => {
  const projectId = process.env.FCM_PROJECT_ID;
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
};

const getFcmApp = () => {
  const credentials = fcmCredentials();
  if (!credentials) return null;
  return getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
        projectId: credentials.projectId,
      });
};

export const isFcmConfigured = (): boolean => fcmCredentials() !== null;

export const sendAdminPushNotification = async (
  adminId: Types.ObjectId,
  notification: { title: string; body: string; data?: Record<string, string> }
): Promise<PushResult> => {
  const app = getFcmApp();
  if (!app) return { skipped: true, reason: 'FCM_NOT_CONFIGURED' };

  const devices = await PushDevice.find({ adminId, enabled: true }).select('_id token');
  if (devices.length === 0) return { skipped: true, reason: 'NO_REGISTERED_DEVICES' };

  const response = await getMessaging(app).sendEachForMulticast({
    tokens: devices.map((device) => device.token),
    notification: { title: notification.title, body: notification.body },
    data: notification.data,
  });
  const disabledIds = response.responses.flatMap((result, index) => {
    const code = result.error?.code;
    return !result.success &&
      (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')
      ? [devices[index]._id]
      : [];
  });
  if (disabledIds.length > 0) {
    await PushDevice.updateMany({ _id: { $in: disabledIds } }, { $set: { enabled: false } });
  }
  const otherFailure = response.responses.find(
    (result) =>
      !result.success &&
      result.error?.code !== 'messaging/registration-token-not-registered' &&
      result.error?.code !== 'messaging/invalid-registration-token'
  );
  if (otherFailure?.error) throw otherFailure.error;

  return { skipped: false, sent: response.successCount, failed: response.failureCount };
};
