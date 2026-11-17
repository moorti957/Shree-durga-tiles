import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AdminUser, IAdminUser } from '../models/AdminUser';
import { AdminAuthRequest } from '../middlewares/adminAuth';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

const LOCK_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const accessSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured.', 500, 'CONFIGURATION_ERROR');
  }
  return process.env.JWT_SECRET;
};

const refreshSecret = (): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError('JWT_REFRESH_SECRET is not configured.', 500, 'CONFIGURATION_ERROR');
  }
  return process.env.JWT_REFRESH_SECRET;
};

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

const hashesMatch = (candidate: string, stored: string): boolean => {
  const candidateBuffer = Buffer.from(candidate, 'hex');
  const storedBuffer = Buffer.from(stored, 'hex');
  return candidateBuffer.length === storedBuffer.length && timingSafeEqual(candidateBuffer, storedBuffer);
};

const createTokenPair = (admin: IAdminUser) => {
  const subject = admin._id.toString();
  const accessToken = jwt.sign(
    { tokenType: 'admin-access', role: admin.role },
    accessSecret(),
    { subject, expiresIn: 15 * 60 }
  );
  const refreshToken = jwt.sign(
    { tokenType: 'admin-refresh', role: admin.role, jti: randomUUID() },
    refreshSecret(),
    { subject, expiresIn: 30 * 24 * 60 * 60 }
  );

  return { accessToken, refreshToken, refreshTokenHash: hashToken(refreshToken) };
};

const adminSummary = (admin: IAdminUser) => ({
  id: admin._id.toString(),
  name: admin.name,
  identifier: admin.identifier,
  role: admin.role,
});

const invalidCredentials = (): AppError =>
  new AppError('Invalid identifier or password.', 401, 'INVALID_CREDENTIALS');

const isUnlocked = (lockedUntil: Date | null | undefined, now: Date): boolean =>
  !lockedUntil || lockedUntil.getTime() <= now.getTime();

export const AdminAuthController = {
  me: asyncHandler(async (req: AdminAuthRequest, res: Response) => {
    if (!req.admin) throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
    res.json({ success: true, data: { admin: adminSummary(req.admin) } });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const identifier = String(req.body.identifier || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const now = new Date();
    const admin = await AdminUser.findOne({ identifier }).select('+passwordHash +refreshTokenHash');

    if (!admin) throw invalidCredentials();

    if (!isUnlocked(admin.lockedUntil, now)) {
      throw new AppError('Admin account is temporarily locked. Try again later.', 423, 'ACCOUNT_LOCKED');
    }

    if (admin.lockedUntil && admin.lockedUntil.getTime() <= now.getTime()) {
      await AdminUser.updateOne(
        { _id: admin._id, lockedUntil: { $lte: now } },
        { $set: { failedAttempts: 0, lockedUntil: null } }
      );
      admin.failedAttempts = 0;
      admin.lockedUntil = undefined;
    }

    if (!(await bcrypt.compare(password, admin.passwordHash))) {
      const failedAttempt = await AdminUser.findOneAndUpdate(
        {
          _id: admin._id,
          failedAttempts: { $lt: LOCK_ATTEMPTS },
          $or: [
            { lockedUntil: { $exists: false } },
            { lockedUntil: null },
            { lockedUntil: { $lte: now } },
          ],
        },
        { $inc: { failedAttempts: 1 } },
        { new: true }
      );

      if (failedAttempt && failedAttempt.failedAttempts >= LOCK_ATTEMPTS) {
        await AdminUser.updateOne(
          { _id: admin._id, failedAttempts: { $gte: LOCK_ATTEMPTS }, lockedUntil: null },
          { $set: { lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS) } }
        );
        throw new AppError('Admin account is temporarily locked. Try again later.', 423, 'ACCOUNT_LOCKED');
      }

      throw invalidCredentials();
    }

    const tokens = createTokenPair(admin);
    await AdminUser.updateOne(
      { _id: admin._id },
      {
        $set: {
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginAt: now,
          refreshTokenHash: tokens.refreshTokenHash,
        },
      }
    );

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        admin: adminSummary(admin),
      },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = String(req.body.refreshToken || '');
    if (!token) throw new AppError('Refresh token is required.', 400, 'VALIDATION_ERROR');

    const payload = jwt.verify(token, refreshSecret()) as JwtPayload;
    if (payload.tokenType !== 'admin-refresh' || typeof payload.sub !== 'string') {
      throw new AppError('Invalid refresh token.', 401, 'INVALID_TOKEN');
    }

    const admin = await AdminUser.findById(payload.sub).select('+refreshTokenHash');
    if (!admin || !admin.refreshTokenHash || !isUnlocked(admin.lockedUntil, new Date())) {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
    }

    const oldHash = hashToken(token);
    if (!hashesMatch(oldHash, admin.refreshTokenHash)) {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
    }

    const tokens = createTokenPair(admin);
    const rotation = await AdminUser.updateOne(
      { _id: admin._id, refreshTokenHash: admin.refreshTokenHash },
      { $set: { refreshTokenHash: tokens.refreshTokenHash } }
    );
    if (rotation.modifiedCount !== 1) {
      throw new AppError('Refresh token has already been used.', 401, 'INVALID_TOKEN');
    }

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        admin: adminSummary(admin),
      },
    });
  }),

  logout: asyncHandler(async (req: AdminAuthRequest, res: Response) => {
    if (!req.admin) throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
    await AdminUser.updateOne(
      { _id: req.admin._id },
      { $set: { refreshTokenHash: null } }
    );
    res.json({ success: true, data: { loggedOut: true } });
  }),

  changePassword: asyncHandler(async (req: AdminAuthRequest, res: Response) => {
    if (!req.admin) throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const admin = await AdminUser.findById(req.admin._id).select('+passwordHash');

    if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
      throw new AppError('Current password is incorrect.', 400, 'INVALID_PASSWORD');
    }

    await AdminUser.updateOne(
      { _id: admin._id },
      {
        $set: {
          passwordHash: await bcrypt.hash(newPassword, 12),
          failedAttempts: 0,
          lockedUntil: null,
        },
        $unset: { refreshTokenHash: 1 },
      }
    );

    res.json({ success: true, data: { passwordChanged: true } });
  }),
};
