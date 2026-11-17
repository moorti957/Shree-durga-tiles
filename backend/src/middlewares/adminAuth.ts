import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AdminUser, IAdminUser } from '../models/AdminUser';
import { AppError } from './errorHandler';

export type AdminAuthRequest = Request & { admin?: IAdminUser };

export const adminAuth = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization = req.headers.authorization;
  const [scheme, token, extra] = authorization?.split(' ') || [];
  if (scheme !== 'Bearer' || !token || extra) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'A valid admin access token is required.' },
    });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    next(new AppError('JWT_SECRET is not configured.', 500, 'CONFIGURATION_ERROR'));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (payload.tokenType !== 'admin-access' || typeof payload.sub !== 'string') {
      res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid admin access token.' },
      });
      return;
    }

    const admin = await AdminUser.findById(payload.sub);
    if (!admin || admin.role !== 'owner') {
      res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid admin access token.' },
      });
      return;
    }

    if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
      res.status(423).json({
        error: { code: 'ACCOUNT_LOCKED', message: 'Admin account is temporarily locked.' },
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: {
          code: error instanceof jwt.TokenExpiredError ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
          message: error instanceof jwt.TokenExpiredError ? 'Admin access token expired.' : 'Invalid admin access token.',
        },
      });
      return;
    }
    next(error);
  }
};

export default adminAuth;
