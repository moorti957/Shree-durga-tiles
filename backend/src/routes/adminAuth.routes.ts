import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AdminAuthController } from '../controllers/AdminAuthController';
import { adminAuth } from '../middlewares/adminAuth';
import { validate } from '../middlewares/validate';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many login attempts. Try again later.' },
    });
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many refresh requests. Try again later.' },
    });
  },
});

router.post(
  '/login',
  loginLimiter,
  body('identifier').isString().trim().isLength({ min: 3, max: 254 }),
  body('password').isString().notEmpty().isLength({ max: 200 }),
  validate,
  AdminAuthController.login
);

router.post(
  '/refresh',
  refreshLimiter,
  body('refreshToken').isString().notEmpty().isLength({ max: 4096 }),
  validate,
  AdminAuthController.refresh
);

router.get('/me', adminAuth, AdminAuthController.me);
router.post('/logout', adminAuth, AdminAuthController.logout);

router.post(
  '/change-password',
  adminAuth,
  body('currentPassword').isString().notEmpty().isLength({ max: 200 }),
  body('newPassword').isString().isLength({ min: 10, max: 200 }),
  validate,
  AdminAuthController.changePassword
);

export default router;
