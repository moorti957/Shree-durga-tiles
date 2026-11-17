import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { AdminAuthRequest } from '../middlewares/adminAuth';
import { PushDevice } from '../models/PushDevice';
import { isFcmConfigured } from '../services/pushNotifications';

export const MobileDeviceController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as AdminAuthRequest).admin?._id;
    if (!adminId) throw new AppError('Admin authentication is required.', 401, 'UNAUTHORIZED');
    const { token, platform } = req.body as { token: string; platform: 'android' | 'ios' };
    const device = await PushDevice.findOneAndUpdate(
      { adminId, token },
      { $set: { platform, enabled: true } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('_id platform enabled updatedAt');

    res.status(200).json({
      success: true,
      data: {
        device,
        pushDeliveryConfigured: isFcmConfigured(),
      },
    });
  }),
};
