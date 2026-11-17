import { Router } from 'express';
import { param, query } from 'express-validator';
import { PublicController } from '../controllers/PublicController';
import { validate } from '../middlewares/validate';

const router = Router();
const productQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().trim().isLength({ max: 150 }),
  query('search').optional().isString().trim().isLength({ max: 150 }),
  query('category').optional().isSlug(),
  query('featured').optional().isBoolean(),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'newest', 'name-asc']),
];

const categoryQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
});

router.get('/products/categories', PublicController.categories);
router.get(
  '/products/featured',
  productQueryValidation,
  validate,
  PublicController.featuredProducts
);
router.get('/products/search', productQueryValidation, validate, PublicController.products);
router.get('/products', productQueryValidation, validate, PublicController.products);
router.get('/products/:slug', param('slug').isSlug(), validate, PublicController.product);

router.get('/categories', PublicController.categories);
router.get(
  '/categories/:slug/products',
  param('slug').isSlug(),
  categoryQueryValidation,
  validate,
  PublicController.category
);
router.get(
  '/categories/:slug',
  param('slug').isSlug(),
  categoryQueryValidation,
  validate,
  PublicController.category
);

router.get('/home', PublicController.home);
router.get('/home/banners', PublicController.heroImages);
router.get('/home/categories', PublicController.categories);
router.get(
  '/home/products',
  productQueryValidation,
  validate,
  PublicController.featuredProducts
);
router.get('/home/testimonials', PublicController.testimonials);
router.get('/home/faqs', PublicController.faqs);
router.get('/home/stats', PublicController.stats);

export default router;
