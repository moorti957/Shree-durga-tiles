import { Router } from 'express';
import { body, header, param, query } from 'express-validator';
import { AdminController, contentHandlers } from '../controllers/AdminController';
import { MobileAdminController } from '../controllers/MobileAdminController';
import { MobileBillController } from '../controllers/MobileBillController';
import { MobileDeviceController } from '../controllers/MobileDeviceController';
import { Banner } from '../models/Banner';
import { FAQ } from '../models/FAQ';
import { MarqueeItem, ProcessStep, Project, WhyUsFeature } from '../models/SiteContent';
import { Testimonial } from '../models/Testimonial';
import { adminAuth } from '../middlewares/adminAuth';
import { validate } from '../middlewares/validate';

const router = Router();
router.use(adminAuth);

const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
const idParam = [param('id').isMongoId()];
const objectBody = [body().isObject()];
const dateRange = [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

router.get('/dashboard', MobileAdminController.dashboard);
router.get('/notifications', MobileAdminController.notifications);
router.get('/visitors/live', MobileAdminController.liveVisitors);

router.get(
  '/products',
  pagination,
  query('q').optional().isString().trim().isLength({ max: 150 }),
  query('status').optional().isIn(['draft', 'published']),
  query('category').optional().isMongoId(),
  query('inStock').optional().isBoolean(),
  validate,
  AdminController.listProducts
);
router.get('/enquiries/:id', idParam, validate, MobileAdminController.getEnquiry);
router.post(
  '/products',
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('description').isString().trim().notEmpty(),
  body('slug').optional().isSlug(),
  body('category').optional().isMongoId(),
  body('categoryId').optional().isMongoId(),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('status').optional().isIn(['draft', 'published']),
  validate,
  AdminController.createProduct
);
router.get('/products/:id', idParam, validate, AdminController.getProduct);
router.patch(
  '/products/:id/price',
  idParam,
  body('price').isFloat({ min: 0 }).toFloat(),
  body('priceUnit').isIn(['sq_ft', 'box', 'piece']),
  validate,
  MobileAdminController.updateProductPrice
);
router.patch(
  '/products/:id/status',
  idParam,
  body('status').isIn(['draft', 'published']),
  validate,
  MobileAdminController.updateProductStatus
);
router.patch(
  '/products/:id',
  idParam,
  body().isObject(),
  body('category').optional().isMongoId(),
  body('categoryId').optional().isMongoId(),
  body('status').optional().isIn(['draft', 'published']),
  validate,
  AdminController.updateProduct
);
router.delete('/products/:id', idParam, validate, AdminController.deleteProduct);

router.get(
  '/categories',
  pagination,
  query('q').optional().isString().trim().isLength({ max: 150 }),
  validate,
  AdminController.listCategories
);
router.post(
  '/categories',
  body('name').isString().trim().isLength({ min: 2, max: 50 }),
  body('slug').optional().isSlug(),
  body('description').optional().isString().isLength({ max: 500 }),
  validate,
  AdminController.createCategory
);
router.get('/categories/:id', idParam, validate, AdminController.getCategory);
router.post(
  '/categories/reorder',
  body('categories').isArray({ min: 1, max: 500 }),
  body('categories.*.id').isMongoId(),
  body('categories.*.sortOrder').optional().isInt({ min: 0 }).toInt(),
  body('categories.*.displayOrder').optional().isInt({ min: 0 }).toInt(),
  validate,
  MobileAdminController.reorderCategories
);
router.patch('/categories/:id', idParam, objectBody, validate, AdminController.updateCategory);
router.delete('/categories/:id', idParam, validate, AdminController.deleteCategory);

router.get('/collections', pagination, validate, AdminController.listCollections);
router.post(
  '/collections',
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('slug').isSlug(),
  body('productIds').optional().isArray(),
  body('productIds.*').optional().isMongoId(),
  validate,
  AdminController.createCollection
);
router.patch('/collections/:id', idParam, objectBody, validate, AdminController.updateCollection);
router.delete('/collections/:id', idParam, validate, AdminController.deleteCollection);

router.get(
  '/enquiries',
  pagination,
  query('status').optional().isIn(['new', 'contacted', 'converted', 'closed']),
  query('q').optional().isString().trim().isLength({ max: 150 }),
  validate,
  AdminController.listEnquiries
);
router.patch(
  '/enquiries/:id',
  idParam,
  body().isObject(),
  body('status').optional().isIn(['new', 'contacted', 'converted', 'closed']),
  body('adminNote').optional().isString().isLength({ max: 5000 }),
  validate,
  AdminController.updateEnquiry
);

router.get('/visitors', pagination, ...dateRange, query('device').optional().isIn(['mobile', 'desktop', 'tablet']), validate, AdminController.listVisitors);
router.get('/visitors/:id', param('id').isString().isLength({ min: 1, max: 100 }), validate, MobileAdminController.visitorDetail);
router.get('/analytics/visitors', ...dateRange, validate, AdminController.visitorAnalytics);
router.get('/reports/summary', ...dateRange, validate, AdminController.reportSummary);

router.get('/settings', AdminController.getSettings);
router.patch('/settings', objectBody, validate, AdminController.updateSettings);

router.get(
  '/bills',
  pagination,
  query('status').optional().isIn(['draft', 'final', 'cancelled']),
  query('q').optional().isString().trim().isLength({ max: 150 }),
  validate,
  AdminController.listBills
);
router.get('/bills/:id', idParam, validate, AdminController.getBill);
router.get('/bills/:id/pdf', idParam, validate, MobileBillController.pdf);
const billItemValidation = [
  body('items').isArray({ min: 1, max: 100 }),
  body('items.*.name').isString().trim().isLength({ min: 1, max: 200 }),
  body('items.*.qty').isFloat({ gt: 0 }).toFloat(),
  body('items.*.rate').isFloat({ min: 0 }).toFloat(),
  body('items.*.unit').isIn(['sq_ft', 'box', 'piece']),
  body('items.*.productId').optional().isMongoId(),
  body('items.*.size').optional().isString().isLength({ max: 100 }),
  body('items.*.hsn').optional().isString().isLength({ max: 20 }),
  body('items.*.gstRate').optional().isFloat({ min: 0, max: 100 }).toFloat(),
];
const billFieldValidation = [
  body('customerName').isString().trim().isLength({ min: 2, max: 150 }),
  body('customerPhone').optional({ nullable: true }).isString().isLength({ max: 20 }),
  body('customerAddress').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('customerGstin').optional({ nullable: true }).isString().isLength({ max: 15 }),
  body('customerState').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('isGstBill').optional().isBoolean().toBoolean(),
  body('gstRate').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('deliveryType').optional().isIn(['pickup', 'home_delivery']),
  body('deliveryAddress').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('deliveryCharge').optional().isFloat({ min: 0 }).toFloat(),
  body('discount').optional().isFloat({ min: 0 }).toFloat(),
  body('advanceAmount').optional().isFloat({ min: 0 }).toFloat(),
  body('advanceMode').optional().isIn(['upi', 'cash', 'bank', 'cheque', 'none']),
  body('isCod').optional().isBoolean().toBoolean(),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('enquiryId').optional().isMongoId(),
];
const optionalBillFieldValidation = [
  body('customerName').optional().isString().trim().isLength({ min: 2, max: 150 }),
  body('customerPhone').optional({ nullable: true }).isString().isLength({ max: 20 }),
  body('customerAddress').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('customerGstin').optional({ nullable: true }).isString().isLength({ max: 15 }),
  body('customerState').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('isGstBill').optional().isBoolean().toBoolean(),
  body('gstRate').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('deliveryType').optional().isIn(['pickup', 'home_delivery']),
  body('deliveryAddress').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('deliveryCharge').optional().isFloat({ min: 0 }).toFloat(),
  body('discount').optional().isFloat({ min: 0 }).toFloat(),
  body('advanceAmount').optional().isFloat({ min: 0 }).toFloat(),
  body('advanceMode').optional().isIn(['upi', 'cash', 'bank', 'cheque', 'none']),
  body('isCod').optional().isBoolean().toBoolean(),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('enquiryId').optional().isMongoId(),
];
router.post(
  '/bills',
  header('Idempotency-Key').optional().isString().isLength({ min: 1, max: 200 }),
  ...billFieldValidation,
  ...billItemValidation,
  validate,
  MobileBillController.create
);
router.put(
  '/bills/:id',
  idParam,
  body().isObject(),
  ...optionalBillFieldValidation,
  body('items').optional().isArray({ min: 1, max: 100 }),
  body('items.*.name').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('items.*.qty').optional().isFloat({ gt: 0 }).toFloat(),
  body('items.*.rate').optional().isFloat({ min: 0 }).toFloat(),
  body('items.*.unit').optional().isIn(['sq_ft', 'box', 'piece']),
  validate,
  MobileBillController.update
);
router.post('/bills/:id/finalize', idParam, validate, MobileBillController.finalize);
router.post('/bills/:id/cancel', idParam, validate, MobileBillController.cancel);
router.post(
  '/bills/:id/payments',
  idParam,
  header('Idempotency-Key').optional().isString().isLength({ min: 1, max: 200 }),
  body('amount').isFloat({ gt: 0 }).toFloat(),
  body('mode').isIn(['upi', 'cash', 'bank', 'cheque']),
  body('paidAt').optional().isISO8601(),
  body('note').optional().isString().isLength({ max: 1000 }),
  validate,
  MobileBillController.addPayment
);
router.post('/bills/:id/share-link', idParam, validate, MobileBillController.shareLink);
router.post(
  '/devices/register',
  body('token').isString().trim().isLength({ min: 20, max: 512 }),
  body('platform').isIn(['android', 'ios']),
  validate,
  MobileDeviceController.register
);

const mountContent = (
  path: string,
  handlers: ReturnType<typeof contentHandlers>
) => {
  router.get(path, pagination, validate, handlers.list);
  router.post(path, objectBody, validate, handlers.create);
  router.patch(`${path}/:id`, idParam, objectBody, validate, handlers.update);
  router.delete(`${path}/:id`, idParam, validate, handlers.remove);
};

mountContent('/banners', contentHandlers(Banner, [
  'title', 'subtitle', 'image', 'alt', 'kind', 'link', 'buttonText', 'displayOrder', 'isActive', 'isVisible',
], 'isVisible'));
mountContent('/projects', contentHandlers(Project, [
  'title', 'type', 'image', 'sortOrder', 'isVisible',
], 'isVisible'));
mountContent('/process-steps', contentHandlers(ProcessStep, [
  'title', 'description', 'sortOrder', 'isVisible',
], 'isVisible'));
mountContent('/why-us', contentHandlers(WhyUsFeature, [
  'title', 'description', 'sortOrder', 'isVisible',
], 'isVisible'));
mountContent('/marquee-items', contentHandlers(MarqueeItem, [
  'text', 'sortOrder', 'isVisible',
], 'isVisible'));
mountContent('/faqs', contentHandlers(FAQ, [
  'question', 'answer', 'category', 'displayOrder', 'sortOrder', 'isActive', 'isVisible',
], 'isVisible'));
mountContent('/testimonials', contentHandlers(Testimonial, [
  'name', 'role', 'city', 'avatar', 'text', 'rating', 'title', 'comment',
  'isAnonymous', 'isVerified', 'isActive', 'isApproved',
], 'isActive'));

export default router;
