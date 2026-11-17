import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { PublicController } from '../controllers/PublicController';
import { validate } from '../middlewares/validate';

const router = Router();

router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
});

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many enquiries. Please try again later.' },
    });
  },
});

const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many tracking requests. Try again later.' },
    });
  },
});

router.get('/settings', PublicController.settings);
router.get('/categories', PublicController.categories);
router.get(
  '/categories/:slug',
  param('slug').isSlug(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
  PublicController.category
);
router.get('/collections', PublicController.collections);
router.get(
  '/products',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().trim().isLength({ max: 150 }),
  query('category').optional().isSlug(),
  query('featured').optional().isBoolean(),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'newest', 'name-asc']),
  validate,
  PublicController.products
);
router.get(
  '/products/:slug',
  param('slug').isSlug(),
  validate,
  PublicController.product
);
router.get('/projects', PublicController.projects);
router.get('/hero-images', PublicController.heroImages);
router.get('/stats', PublicController.stats);
router.get('/testimonials', PublicController.testimonials);
router.get('/faqs', PublicController.faqs);
router.get('/home', PublicController.home);

router.post(
  '/enquiries',
  enquiryLimiter,
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('phone')
    .isString()
    .trim()
    .custom((value: string) => {
      const digits = value.replace(/[^\d]/g, '');
      const phone = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
      return /^[6-9]\d{9}$/.test(phone);
    }),
  body('need').isIn([
    'Marble',
    'Granite',
    'Floor/Wall Tiles',
    'Kitchen Top',
    'Mandir/Pooja Room Stone',
    'Bulk supply for a project',
    'Other',
  ]),
  body('message').optional().isString().trim().isLength({ max: 3000 }),
  body('productId').optional({ checkFalsy: true }).isMongoId(),
  body('source').isIn([
    'quote_form',
    'mandir_cta',
    'product_enquire',
    'whatsapp_click',
    'call_click',
  ]),
  body('visitorId').optional({ checkFalsy: true }).isUUID(4),
  body('website')
    .optional({ checkFalsy: true })
    .custom((value) => !String(value).trim())
    .withMessage('Invalid submission.'),
  validate,
  PublicController.enquiry
);

router.post(
  '/track/pageview',
  trackingLimiter,
  body('visitorId').isUUID(4),
  body('path')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1500 })
    .custom((value) => value.startsWith('/')),
  body('device').optional().isIn(['mobile', 'desktop', 'tablet']),
  body('productId').optional({ checkFalsy: true }).isMongoId(),
  body('categoryId').optional({ checkFalsy: true }).isMongoId(),
  body('durationSeconds').optional().isInt({ min: 0, max: 86400 }).toInt(),
  validate,
  PublicController.pageview
);

router.post(
  '/track/heartbeat',
  trackingLimiter,
  body('visitorId').isUUID(4),
  body('device').optional().isIn(['mobile', 'desktop', 'tablet']),
  validate,
  PublicController.heartbeat
);

router.post(
  '/track/event',
  trackingLimiter,
  body('visitorId').isUUID(4),
  body('event').isIn(['call_click', 'whatsapp_click']),
  body('device').optional().isIn(['mobile', 'desktop', 'tablet']),
  validate,
  PublicController.event
);

router.get(
  '/bills/verify/:token',
  param('token').isString().matches(/^[A-Za-z0-9_-]{32,200}$/),
  validate,
  PublicController.verifyBill
);

export default router;
