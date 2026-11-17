// backend/src/routes/upload.routes.ts

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { UploadController } from '../controllers/UploadController';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';
import { adminRouteGuard } from '../middlewares/adminRouteGuard';
import { upload } from '../middlewares/upload';

const router = Router();
const legacyCommerceEnabled = process.env.ENABLE_LEGACY_COMMERCE === 'true';

// Rate limiting for upload operations
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many upload attempts. Try again later.' },
    });
  },
});

// ============================================================
// Validation Schemas
// ============================================================

const deleteFileValidation = [
  param('publicId').notEmpty().withMessage('Public ID is required'),
];

const uploadTypeValidation = [
  body('type').optional().isIn(['avatar', 'product', 'gallery', 'blog']),
];

// ============================================================
// Routes
// ============================================================

// Upload a single file
router.post(
  '/',
  adminRouteGuard,
  upload.single('file'),
  uploadLimiter,
  uploadTypeValidation,
  validate,
  UploadController.uploadSingle
);

// Upload multiple files
router.post(
  '/multiple',
  adminRouteGuard,
  upload.array('files', 10),
  uploadLimiter,
  uploadTypeValidation,
  validate,
  UploadController.uploadMultiple
);

// Upload product images (specific)
router.post(
  '/product',
  adminRouteGuard,
  upload.array('images', 10),
  uploadLimiter,
  body('productId').isMongoId().withMessage('Invalid product ID'),
  validate,
  UploadController.uploadProductImages
);

// Upload avatar
if (legacyCommerceEnabled) {
  router.post('/avatar', auth, uploadLimiter, UploadController.uploadAvatar);
}

// Upload gallery images
router.post(
  '/gallery',
  adminRouteGuard,
  upload.array('images', 10),
  uploadLimiter,
  body('galleryId').optional().isMongoId(),
  validate,
  UploadController.uploadGalleryImages
);

// Upload blog images
router.post(
  '/blog',
  adminRouteGuard,
  upload.array('images', 10),
  uploadLimiter,
  body('blogId').optional().isMongoId(),
  validate,
  UploadController.uploadBlogImages
);

// Delete multiple files
router.delete(
  '/bulk',
  adminRouteGuard,
  body('publicIds').isArray().withMessage('Public IDs array is required'),
  body('publicIds.*').notEmpty().withMessage('Each public ID must be non-empty'),
  validate,
  UploadController.deleteMultipleFiles
);

// Delete a file from Cloudinary
router.delete(
  '/:publicId',
  adminRouteGuard,
  deleteFileValidation,
  validate,
  UploadController.deleteFile
);

// Get signed upload URL (for client-side direct uploads)
router.get(
  '/signed-url',
  adminRouteGuard,
  query('type').optional().isIn(['avatar', 'product', 'gallery', 'blog']),
  query('folder').optional().trim(),
  validate,
  UploadController.getSignedUploadUrl
);

export default router;