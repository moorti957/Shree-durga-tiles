import { Request, Response, RequestHandler } from 'express';
import mongoose, { Document, Model } from 'mongoose';
import { asyncHandler, AppError, NotFoundError } from '../middlewares/errorHandler';
import { Bill, BillItem, Payment } from '../models/Bill';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { Enquiry } from '../models/Enquiry';
import { PageView, Visitor, VisitorEvent } from '../models/Visitor';
import { Product } from '../models/Product';
import { Setting } from '../models/Setting';

const pageOptions = (req: Request) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const pickFields = (value: unknown, fields: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError('Request body must be an object.', 400, 'VALIDATION_ERROR');
  }
  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    fields.filter((field) => Object.prototype.hasOwnProperty.call(source, field))
      .map((field) => [field, source[field]])
  );
};

const dateFilter = (req: Request) => {
  const filter: Record<string, Date> = {};
  if (typeof req.query.from === 'string') filter.$gte = new Date(req.query.from);
  if (typeof req.query.to === 'string') filter.$lte = new Date(req.query.to);
  return Object.keys(filter).length ? filter : undefined;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sendList = (res: Response, data: unknown[], total: number, page: number, limit: number) =>
  res.json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });

const productFields = [
  'name', 'slug', 'description', 'excerpt', 'price', 'priceUnit', 'size', 'quality', 'stock',
  'usage', 'originalPrice', 'images', 'imageDetails', 'images360', 'videoUrl', 'material',
  'marbleType', 'finish', 'colors', 'category', 'categoryId', 'subCategory', 'collectionIds',
  'sortOrder', 'status', 'isSample', 'height', 'width', 'depth', 'weight', 'inStock',
  'stockQuantity', 'isActive', 'isFeatured', 'isNewProduct', 'isOnSale', 'tags',
  'specifications', 'variants', 'seo',
];

const categoryFields = [
  'name', 'slug', 'description', 'image', 'parentId', 'displayOrder', 'sortOrder',
  'isActive', 'isFeatured', 'isVisible', 'showInHeroStrip', 'seo',
];

const collectionFields = [
  'name', 'slug', 'image', 'description', 'productIds', 'sortOrder', 'isVisible',
  'isMandirFeature',
];

export const AdminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const [products, categories, newEnquiries, visitorsToday, pageViewsToday, bills, recentEnquiries] =
      await Promise.all([
        Product.countDocuments({ deletedAt: null }),
        Category.countDocuments({ deletedAt: null }),
        Enquiry.countDocuments({ status: 'new' }),
        Visitor.countDocuments({ lastSeenAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        PageView.countDocuments({ viewedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        Bill.countDocuments({ deletedAt: null }),
        Enquiry.find().sort({ createdAt: -1 }).limit(10).lean(),
      ]);
    res.json({
      success: true,
      data: {
        products,
        categories,
        newEnquiries,
        visitorsToday,
        pageViewsToday,
        bills,
        recentEnquiries,
      },
    });
  }),

  listProducts: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, unknown> = { deletedAt: null };
    if (req.query.status === 'published') {
      filter.$or = [{ status: 'published' }, { status: { $exists: false } }];
    } else if (typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (typeof req.query.category === 'string' && mongoose.isValidObjectId(req.query.category)) {
      filter.categoryId = new mongoose.Types.ObjectId(req.query.category);
    }
    if (typeof req.query.inStock === 'string') filter.inStock = req.query.inStock === 'true';
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      filter.name = { $regex: escapeRegex(req.query.q.trim()), $options: 'i' };
    }
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ sortOrder: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);
    sendList(res, items, total, page, limit);
  }),

  getProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findOne({ _id: req.params.id, deletedAt: null })
      .populate('category', 'name slug')
      .lean();
    if (!product) throw new NotFoundError('Product not found.');
    res.json({ success: true, data: product });
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const data = pickFields(req.body, productFields);
    const categoryId = data.categoryId || data.category;
    if (typeof categoryId !== 'string' || !mongoose.isValidObjectId(categoryId)) {
      throw new AppError('A valid category is required.', 400, 'VALIDATION_ERROR');
    }
    const category = await Category.findOne({ _id: categoryId, deletedAt: null }).select('_id');
    if (!category) throw new AppError('Category not found.', 400, 'INVALID_CATEGORY');
    data.category = category._id;
    data.categoryId = category._id;
    data.status = data.status || 'draft';
    data.publishedAt = data.status === 'published' ? new Date() : null;
    data.deletedAt = null;
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const data = pickFields(req.body, productFields);
    const categoryId = data.categoryId || data.category;
    if (categoryId !== undefined) {
      if (typeof categoryId !== 'string' || !mongoose.isValidObjectId(categoryId)) {
        throw new AppError('A valid category is required.', 400, 'VALIDATION_ERROR');
      }
      const category = await Category.findOne({ _id: categoryId, deletedAt: null }).select('_id');
      if (!category) throw new AppError('Category not found.', 400, 'INVALID_CATEGORY');
      data.category = category._id;
      data.categoryId = category._id;
    }
    if (data.status === 'published') data.publishedAt = new Date();
    if (data.status === 'draft') data.publishedAt = null;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) throw new NotFoundError('Product not found.');
    res.json({ success: true, data: product });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true }
    );
    if (!product) throw new NotFoundError('Product not found.');
    res.json({ success: true, data: { id: product._id.toString(), deleted: true } });
  }),

  listCategories: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, unknown> = { deletedAt: null };
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      filter.name = { $regex: escapeRegex(req.query.q.trim()), $options: 'i' };
    }
    const [items, total] = await Promise.all([
      Category.find(filter).sort({ sortOrder: 1, displayOrder: 1, name: 1 })
        .skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);
    sendList(res, items, total, page, limit);
  }),

  getCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!category) throw new NotFoundError('Category not found.');
    res.json({ success: true, data: category });
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.create(pickFields(req.body, categoryFields));
    res.status(201).json({ success: true, data: category });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: pickFields(req.body, categoryFields) },
      { new: true, runValidators: true }
    );
    if (!category) throw new NotFoundError('Category not found.');
    res.json({ success: true, data: category });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false, isVisible: false } },
      { new: true }
    );
    if (!category) throw new NotFoundError('Category not found.');
    res.json({ success: true, data: { id: category._id.toString(), deleted: true } });
  }),

  listCollections: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const [items, total] = await Promise.all([
      Collection.find({ deletedAt: null }).sort({ sortOrder: 1, name: 1 })
        .skip(skip).limit(limit).lean(),
      Collection.countDocuments({ deletedAt: null }),
    ]);
    sendList(res, items, total, page, limit);
  }),

  createCollection: asyncHandler(async (req: Request, res: Response) => {
    const collection = await Collection.create(pickFields(req.body, collectionFields));
    res.status(201).json({ success: true, data: collection });
  }),

  updateCollection: asyncHandler(async (req: Request, res: Response) => {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: pickFields(req.body, collectionFields) },
      { new: true, runValidators: true }
    );
    if (!collection) throw new NotFoundError('Collection not found.');
    res.json({ success: true, data: collection });
  }),

  deleteCollection: asyncHandler(async (req: Request, res: Response) => {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date(), isVisible: false } },
      { new: true }
    );
    if (!collection) throw new NotFoundError('Collection not found.');
    res.json({ success: true, data: { id: collection._id.toString(), deleted: true } });
  }),

  listEnquiries: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, unknown> = {};
    if (typeof req.query.status === 'string') filter.status = req.query.status;
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const safeQuery = escapeRegex(req.query.q.trim());
      filter.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { phone: { $regex: safeQuery, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(filter),
    ]);
    sendList(res, items, total, page, limit);
  }),

  updateEnquiry: asyncHandler(async (req: Request, res: Response) => {
    const data = pickFields(req.body, ['status', 'adminNote']);
    if (data.status === 'contacted') data.contactedAt = new Date();
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!enquiry) throw new NotFoundError('Enquiry not found.');
    res.json({ success: true, data: enquiry });
  }),

  listVisitors: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, unknown> = {};
    const range = dateFilter(req);
    if (range) filter.lastSeenAt = range;
    if (typeof req.query.device === 'string') filter.device = req.query.device;
    const [items, total] = await Promise.all([
      Visitor.find(filter).sort({ lastSeenAt: -1 }).skip(skip).limit(limit).lean(),
      Visitor.countDocuments(filter),
    ]);
    sendList(res, items, total, page, limit);
  }),

  visitorAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const range = dateFilter(req) || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    const [devices, popularPaths, events, visitors, pageViews] = await Promise.all([
      Visitor.aggregate([
        { $match: { lastSeenAt: range } },
        { $group: { _id: '$device', visitors: { $sum: 1 } } },
      ]),
      PageView.aggregate([
        { $match: { viewedAt: range } },
        { $group: { _id: '$path', views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { path: '$_id', views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { views: -1 } },
        { $limit: 20 },
      ]),
      VisitorEvent.aggregate([
        { $match: { occurredAt: range } },
        { $group: { _id: '$event', count: { $sum: 1 } } },
      ]),
      Visitor.countDocuments({ lastSeenAt: range }),
      PageView.countDocuments({ viewedAt: range }),
    ]);
    res.json({ success: true, data: { visitors, pageViews, devices, popularPaths, events } });
  }),

  getSettings: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await Setting.findOne({});
    if (!settings) throw new NotFoundError('Site settings have not been seeded.');
    res.json({ success: true, data: settings });
  }),

  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const data = pickFields(req.body, [
      'shopName', 'tagline', 'phone', 'whatsapp', 'email', 'address', 'mapLink', 'timings',
      'topBarText', 'gstin', 'upiId', 'invoicePrefix', 'defaultGstRate', 'invoiceTerms',
      'invoiceFooterNote', 'logo', 'ownerSignature', 'ownerName', 'invoiceTitle', 'returnPolicy',
      'defaultInvoiceNotes', 'showLogo', 'showSignature', 'showGstin', 'stats', 'heroHeadline', 'heroSubtext', 'featuredProductId',
      'aboutText', 'aboutImage', 'social', 'seo', 'qrMode', 'analyticsNotice',
    ]);
    const settings = await Setting.findOneAndUpdate({}, { $set: data }, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    res.json({ success: true, data: settings });
  }),

  listBills: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const filter: Record<string, unknown> = { deletedAt: null };
    if (typeof req.query.status === 'string') filter.status = req.query.status;
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const safeQuery = escapeRegex(req.query.q.trim());
      filter.$or = [
        { billNo: { $regex: safeQuery, $options: 'i' } },
        { customerName: { $regex: safeQuery, $options: 'i' } },
        { customerPhone: { $regex: safeQuery, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      Bill.find(filter).sort({ billDate: -1 }).skip(skip).limit(limit).lean(),
      Bill.countDocuments(filter),
    ]);
    sendList(res, items, total, page, limit);
  }),

  getBill: asyncHandler(async (req: Request, res: Response) => {
    const bill = await Bill.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!bill) throw new NotFoundError('Bill not found.');
    const [items, payments] = await Promise.all([
      BillItem.find({ billId: bill._id }).sort({ createdAt: 1 }).lean(),
      Payment.find({ billId: bill._id }).sort({ paidAt: 1 }).lean(),
    ]);
    res.json({ success: true, data: { ...bill, items, payments } });
  }),

  reportSummary: asyncHandler(async (req: Request, res: Response) => {
    const range = dateFilter(req);
    const [enquiries, visitors, pageViews, bills, enquiriesByStatus] = await Promise.all([
      Enquiry.countDocuments(range ? { createdAt: range } : {}),
      Visitor.countDocuments(range ? { lastSeenAt: range } : {}),
      PageView.countDocuments(range ? { viewedAt: range } : {}),
      Bill.countDocuments(range ? { billDate: range, deletedAt: null } : { deletedAt: null }),
      Enquiry.aggregate([
        ...(range ? [{ $match: { createdAt: range } }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      data: { enquiries, visitors, pageViews, bills, enquiriesByStatus },
    });
  }),
};

export const contentHandlers = <T extends Document>(
  model: Model<T>,
  fields: string[],
  archiveField: 'isVisible' | 'isActive'
): { list: RequestHandler; create: RequestHandler; update: RequestHandler; remove: RequestHandler } => ({
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = pageOptions(req);
    const [items, total] = await Promise.all([
      model.find({}).sort({ sortOrder: 1, displayOrder: 1, createdAt: -1 })
        .skip(skip).limit(limit).lean(),
      model.countDocuments({}),
    ]);
    sendList(res, items, total, page, limit);
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await model.create(pickFields(req.body, fields));
    res.status(201).json({ success: true, data: item });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await model.findByIdAndUpdate(
      req.params.id,
      { $set: pickFields(req.body, fields) },
      { new: true, runValidators: true }
    );
    if (!item) throw new NotFoundError('Content item not found.');
    res.json({ success: true, data: item });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    const item = await model.findById(req.params.id);
    if (!item) throw new NotFoundError('Content item not found.');
    item.set(archiveField, false);
    await item.save();
    res.json({ success: true, data: { id: String(item._id), archived: true } });
  }),
});
