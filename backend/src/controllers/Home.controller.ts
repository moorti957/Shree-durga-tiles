import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { Testimonial } from '../models/Testimonial';
import { FAQ } from '../models/FAQ';
import { Order } from '../models/Order';
import { Setting } from '../models/Setting';
import { asyncHandler } from '../middlewares/errorHandler';

const getVisibleCategoryIds = async (): Promise<ICategory['_id'][]> => {
  const categories = await Category.find({
    isActive: { $ne: false },
    isVisible: { $ne: false },
    deletedAt: null,
  }).select('_id');
  return categories.map((category) => category._id);
};

const getPublicProductFilter = (categoryIds: ICategory['_id'][]) => ({
  $and: [
    { isActive: { $ne: false }, deletedAt: null },
    { $or: [{ status: 'published' }, { status: { $exists: false } }] },
    {
      $or: [
        { categoryId: { $in: categoryIds } },
        { category: { $in: categoryIds } },
      ],
    },
  ],
});

const getPublicStats = async (categoryIds: ICategory['_id'][]) => {
  const [settings, totalProducts, totalOrders] = await Promise.all([
    Setting.findOne({}),
    Product.countDocuments(getPublicProductFilter(categoryIds)),
    Order.countDocuments(),
  ]);
  return {
    totalCustomers: settings?.stats?.happyCustomers || 0,
    totalProducts,
    totalOrders,
    yearsOfExperience: settings?.stats?.yearsExperience || 0,
  };
};

export default class HomeController {
  static getAllHomeData = asyncHandler(async (_req: Request, res: Response) => {
    const categoryIds = await getVisibleCategoryIds();
    const publicProductFilter = getPublicProductFilter(categoryIds);
    const [
      banners,
      categories,
      featuredProducts,
      trendingProducts,
      testimonials,
      faqs,
    ] = await Promise.all([
      Banner.find({ isActive: { $ne: false }, isVisible: { $ne: false } })
        .sort({ displayOrder: 1 })
        .lean(),

      Category.find({
        _id: { $in: categoryIds },
        isFeatured: true,
      })
        .sort({ displayOrder: 1 })
        .lean(),

      Product.find({ $and: [publicProductFilter, { isFeatured: true }] })
        .limit(8)
        .sort({ createdAt: -1 })
        .lean(),

      Product.find(publicProductFilter)
        .limit(8)
        .sort({ viewCount: -1 })
        .lean(),

      Testimonial.find({ isActive: true, isApproved: true, name: { $exists: true, $ne: '' } })
        .limit(6)
        .sort({ createdAt: -1 })
        .lean(),

      FAQ.find({ isActive: { $ne: false }, isVisible: { $ne: false } })
        .sort({ displayOrder: 1 })
        .lean(),
    ]);

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        productCount: await Product.countDocuments({
          $and: [
            publicProductFilter,
            { $or: [{ categoryId: cat._id }, { category: cat._id }] },
          ],
        }),
      }))
    );

    const stats = await getPublicStats(categoryIds);

    res.status(200).json({
      banners,
      categories: categoriesWithCounts,
      featuredProducts,
      trendingProducts,
      testimonials,
      faqs,
      stats,
      instagramPosts: [],
      youtubeVideos: [],
    });
  });

  static getBanners = asyncHandler(async (_req: Request, res: Response) => {
    const banners = await Banner.find({
      isActive: { $ne: false },
      isVisible: { $ne: false },
    })
      .sort({ displayOrder: 1 })
      .lean();

    res.json(banners);
  });

  static getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categoryIds = await getVisibleCategoryIds();
    const categories = await Category.find({
      _id: { $in: categoryIds },
      isFeatured: true,
    }).lean();

    res.json(categories);
  });

  static getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
    const publicProductFilter = getPublicProductFilter(await getVisibleCategoryIds());
    const products = await Product.find({ $and: [publicProductFilter, { isFeatured: true }] })
      .limit(8)
      .lean();

    res.json(products);
  });

  static getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
    const testimonials = await Testimonial.find({
      isActive: true,
      isApproved: true,
      name: { $exists: true, $ne: '' },
    })
      .limit(6)
      .lean();

    res.json(testimonials);
  });

  static getFAQs = asyncHandler(async (_req: Request, res:Response) => {
    const faqs = await FAQ.find({
      isActive: { $ne: false },
      isVisible: { $ne: false },
    })
      .sort({ displayOrder: 1 })
      .lean();

    res.json(faqs);
  });

  static getStats = asyncHandler(async (_req: Request, res: Response) => {
    res.json(await getPublicStats(await getVisibleCategoryIds()));
  });

  static getInstagramPosts = asyncHandler(async (_req: Request, res: Response) => {
    res.json([]);
  });

  static getYouTubeVideos = asyncHandler(async (_req: Request, res: Response) => {
    res.json([]);
  });
}