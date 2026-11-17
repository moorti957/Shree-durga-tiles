import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, AppError, NotFoundError } from '../middlewares/errorHandler';
import { Bill } from '../models/Bill';
import { Category } from '../models/Category';
import { Enquiry } from '../models/Enquiry';
import { PageView, Visitor, VisitorEvent } from '../models/Visitor';
import { Product } from '../models/Product';

export const MobileAdminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const liveCutoff = new Date(now.getTime() - 5 * 60 * 1000);
    const [products, categories, newEnquiries, visitorsToday, pageViewsToday, bills, recentEnquiries, publishedProducts, draftProducts, liveVisitors, dueBills, recentVisitors, recentBills] =
      await Promise.all([
        Product.countDocuments({ deletedAt: null }),
        Category.countDocuments({ deletedAt: null }),
        Enquiry.countDocuments({ status: 'new' }),
        Visitor.countDocuments({ lastSeenAt: { $gte: dayStart } }),
        PageView.countDocuments({ viewedAt: { $gte: dayStart } }),
        Bill.countDocuments({ deletedAt: null }),
        Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
        Product.countDocuments({ deletedAt: null, status: 'published' }),
        Product.countDocuments({ deletedAt: null, status: 'draft' }),
        Visitor.countDocuments({ lastSeenAt: { $gte: liveCutoff } }),
        Bill.find({ deletedAt: null, status: 'final', balanceDue: { $gt: mongoose.Types.Decimal128.fromString('0') } })
          .select('balanceDue').lean(),
        Visitor.find({ lastSeenAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } })
          .sort({ lastSeenAt: -1 }).limit(3).lean(),
        Bill.find({ deletedAt: null }).sort({ billDate: -1 }).limit(3).lean(),
      ]);
    const paymentDue = dueBills.reduce((sum, bill) => sum + Number(bill.balanceDue.toString()), 0);
    res.json({
      success: true,
      data: {
        products, categories, newEnquiries, visitorsToday, pageViewsToday, bills,
        recentEnquiries, publishedProducts, draftProducts, liveVisitors, paymentDue,
        recentVisitors, recentBills,
      },
    });
  }),

  liveVisitors: asyncHandler(async (_req: Request, res: Response) => {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    const visitors = await Visitor.find({ lastSeenAt: { $gte: cutoff } })
      .sort({ lastSeenAt: -1 }).limit(100).lean();
    const ids = visitors.map((visitor) => visitor.visitorId);
    const [pageViews, events] = await Promise.all([
      PageView.find({ visitorId: { $in: ids }, viewedAt: { $gte: cutoff } })
        .sort({ viewedAt: -1 }).populate('productId', 'name').lean(),
      VisitorEvent.find({ visitorId: { $in: ids }, occurredAt: { $gte: cutoff } })
        .sort({ occurredAt: -1 }).lean(),
    ]);
    const visitsById = new Map<string, typeof pageViews>();
    for (const pageView of pageViews) {
      visitsById.set(pageView.visitorId, [...(visitsById.get(pageView.visitorId) ?? []), pageView]);
    }
    res.json({
      success: true,
      data: {
        count: visitors.length,
        visitors: visitors.map((visitor) => ({
          ...visitor,
          pages: visitsById.get(visitor.visitorId) ?? [],
          events: events.filter((event) => event.visitorId === visitor.visitorId),
        })),
      },
    });
  }),

  visitorDetail: asyncHandler(async (req: Request, res: Response) => {
    const visitor = await Visitor.findOne({ visitorId: req.params.id }).lean();
    if (!visitor) throw new NotFoundError('Visitor not found.');
    const [pages, events, enquiry] = await Promise.all([
      PageView.find({ visitorId: visitor.visitorId }).sort({ viewedAt: -1 }).limit(100)
        .populate('productId', 'name slug images').lean(),
      VisitorEvent.find({ visitorId: visitor.visitorId }).sort({ occurredAt: -1 }).limit(100).lean(),
      Enquiry.findOne({ visitorId: visitor.visitorId }).sort({ createdAt: -1 }).lean(),
    ]);
    res.json({ success: true, data: { visitor, pages, events, enquiry } });
  }),

  reorderCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = req.body.categories as Array<{ id: string; sortOrder?: number; displayOrder?: number }>;
    const categoryIds = categories.map((item) => item.id);
    if (new Set(categoryIds).size !== categoryIds.length) {
      throw new AppError('Each category may appear only once in a reorder request.', 400, 'VALIDATION_ERROR');
    }
    const operations = categories.map((item, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id), deletedAt: null },
        update: { $set: { sortOrder: item.sortOrder ?? index, displayOrder: item.displayOrder ?? index } },
      },
    }));
    const result = await Category.bulkWrite(operations, { ordered: true });
    if (result.matchedCount !== categories.length) {
      throw new AppError('One or more categories could not be reordered.', 409, 'CATEGORY_CHANGED');
    }
    res.json({ success: true, data: { updated: result.modifiedCount } });
  }),

  updateProductPrice: asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { price: req.body.price, priceUnit: req.body.priceUnit } },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    if (!product) throw new NotFoundError('Product not found.');
    res.json({ success: true, data: product });
  }),

  updateProductStatus: asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      {
        $set: {
          status: req.body.status,
          isActive: req.body.status === 'published',
          publishedAt: req.body.status === 'published' ? new Date() : null,
        },
      },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    if (!product) throw new NotFoundError('Product not found.');
    res.json({ success: true, data: product });
  }),

  getEnquiry: asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await Enquiry.findById(req.params.id).lean();
    if (!enquiry) throw new NotFoundError('Enquiry not found.');
    res.json({ success: true, data: enquiry });
  }),

  notifications: asyncHandler(async (_req: Request, res: Response) => {
    const [enquiries, bills] = await Promise.all([
      Enquiry.find({ status: 'new' }).sort({ createdAt: -1 }).limit(20).lean(),
      Bill.find({ status: 'final', balanceDue: { $gt: mongoose.Types.Decimal128.fromString('0') }, deletedAt: null })
        .sort({ billDate: -1 }).limit(20).lean(),
    ]);
    res.json({ success: true, data: { enquiries, bills } });
  }),
};
