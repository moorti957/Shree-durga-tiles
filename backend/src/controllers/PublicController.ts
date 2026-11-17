import { Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { createHash } from 'crypto';
import { AppError, asyncHandler, NotFoundError } from '../middlewares/errorHandler';
import { Bill } from '../models/Bill';
import { Banner } from '../models/Banner';
import { Category, ICategory } from '../models/Category';
import { Collection } from '../models/Collection';
import { Enquiry } from '../models/Enquiry';
import { FAQ } from '../models/FAQ';
import { MarqueeItem, ProcessStep, Project, WhyUsFeature } from '../models/SiteContent';
import { Product, IProduct } from '../models/Product';
import { Setting, ISetting } from '../models/Setting';
import { Testimonial } from '../models/Testimonial';
import { PageView, Visitor, VisitorEvent } from '../models/Visitor';
import { logger } from '../utils/logger';
import { createNotifier } from '../services/Notifier';

const categoryVisibilityFilter = {
  isActive: { $ne: false },
  isVisible: { $ne: false },
  deletedAt: null,
};

const visibleProductFilter = (
  categoryIds: mongoose.Types.ObjectId[],
  extra: FilterQuery<IProduct> = {}
): FilterQuery<IProduct> => ({
  $and: [
    { isActive: { $ne: false }, deletedAt: null },
    { $or: [{ status: 'published' }, { status: { $exists: false } }] },
    {
      $or: [
        { categoryId: { $in: categoryIds } },
        { category: { $in: categoryIds } },
      ],
    },
    extra,
  ],
});

const getVisibleCategories = () =>
  Category.find(categoryVisibilityFilter).sort({ sortOrder: 1, displayOrder: 1, name: 1 });

const getCategoryMap = (categories: ICategory[]) =>
  new Map(
    categories.map((category) => [
      category._id.toString(),
      { id: category._id.toString(), name: category.name, slug: category.slug },
    ])
  );

const serializeProduct = (
  product: IProduct,
  categoryMap: Map<string, { id: string; name: string; slug: string }>
) => {
  const categoryId = (product.categoryId || product.category).toString();
  const images = product.imageDetails?.length
    ? product.imageDetails.map((image) => ({ url: image.url, alt: image.alt || product.name }))
    : (product.images || []).map((url) => ({ url, alt: product.name }));

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    categoryId,
    category: categoryMap.get(categoryId) || null,
    images,
    coverImage: images[0]?.url || '',
    size: product.size || '',
    finish: product.finish || '',
    quality: product.quality || '',
    material: product.material || '',
    marbleType: product.marbleType || '',
    colors: product.colors || [],
    price: product.price ?? null,
    priceUnit: product.priceUnit,
    stock: product.stock ?? product.stockQuantity ?? null,
    usage: product.usage || '',
    description: product.description || '',
    specifications: product.specifications || [],
    isFeatured: Boolean(product.isFeatured),
    isNew: Boolean(product.isNewProduct),
    sortOrder: product.sortOrder || 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const loadPublicSettings = async () => {
  const settings = await Setting.findOne({});
  if (!settings) throw new NotFoundError('Site settings have not been seeded.');
  return serializePublicSettings(settings);
};

const serializePublicSettings = (settings: ISetting) => ({
  shopName: settings.shopName || settings.storeName,
  tagline: settings.tagline || '',
  phone: settings.phone || settings.contact?.phone || settings.storePhone || '',
  whatsapp: settings.whatsapp || settings.contact?.whatsapp || '',
  email: settings.email || settings.contact?.email || settings.storeEmail || '',
  address: settings.address || settings.contact?.address || settings.storeAddress || '',
  mapLink: settings.mapLink || '',
  timings: settings.timings || '',
  topBarText: settings.topBarText || '',
  logo: settings.logo || '',
  stats: settings.stats,
  heroHeadline: settings.heroHeadline || '',
  heroSubtext: settings.heroSubtext || '',
  featuredProductId: settings.featuredProductId?.toString() || null,
  aboutText: settings.aboutText || '',
  aboutImage: settings.aboutImage || '',
  social: Object.fromEntries(settings.social?.entries() || []),
  seo: {
    title: settings.seo?.metaTitle || '',
    description: settings.seo?.metaDescription || '',
    ogImage: settings.seo?.ogImage || '',
  },
  analyticsNotice: settings.analyticsNotice || '',
});

const loadPublicCategories = async () => {
  const categories = await getVisibleCategories();
  if (categories.length === 0) return [];

  const categoryIds = categories.map((category) => category._id);
  const counts = await Product.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: visibleProductFilter(categoryIds) },
    { $group: { _id: { $ifNull: ['$categoryId', '$category'] }, count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((row) => [row._id.toString(), row.count]));

  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    image: category.image || '',
    description: category.description || '',
    sortOrder: category.sortOrder ?? category.displayOrder,
    showInHeroStrip: Boolean(category.showInHeroStrip),
    productCount: countById.get(category._id.toString()) || 0,
  }));
};

const loadPublicProducts = async ({
  page = 1,
  limit = 12,
  query = '',
  categorySlug = '',
  featured,
  sort = '',
}: {
  page?: number;
  limit?: number;
  query?: string;
  categorySlug?: string;
  featured?: boolean;
  sort?: string;
}) => {
  const categories = await getVisibleCategories();
  const categoryMap = getCategoryMap(categories);
  let visibleCategoryIds = categories.map((category) => category._id);

  if (categorySlug) {
    const category = categories.find((candidate) => candidate.slug === categorySlug);
    visibleCategoryIds = category ? [category._id] : [];
  }

  const clauses: FilterQuery<IProduct>[] = [];
  if (query) {
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const categoryMatches = categories
      .filter((category) => new RegExp(safeQuery, 'i').test(category.name))
      .map((category) => category._id);
    clauses.push({
      $or: [
        { name: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } },
        { tags: { $regex: safeQuery, $options: 'i' } },
        { material: { $regex: safeQuery, $options: 'i' } },
        { marbleType: { $regex: safeQuery, $options: 'i' } },
        { finish: { $regex: safeQuery, $options: 'i' } },
        ...(categoryMatches.length
          ? [{ categoryId: { $in: categoryMatches } }, { category: { $in: categoryMatches } }]
          : []),
      ],
    });
  }
  if (featured !== undefined) clauses.push({ isFeatured: featured });

  const filter = visibleProductFilter(
    visibleCategoryIds,
    clauses.length ? { $and: clauses } : {}
  );
  const sortBy: Record<string, 1 | -1> =
    sort === 'price-asc'
      ? { price: 1, sortOrder: 1 }
      : sort === 'price-desc'
        ? { price: -1, sortOrder: 1 }
        : sort === 'name-asc'
          ? { name: 1 }
          : { sortOrder: 1, createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    data: products.map((product) => serializeProduct(product, categoryMap)),
    meta: { page, limit, total },
  };
};

const loadPublicCollections = async () => {
  const [collections, categories] = await Promise.all([
    Collection.find({ isVisible: { $ne: false }, deletedAt: null }).sort({ sortOrder: 1, name: 1 }),
    getVisibleCategories(),
  ]);
  const categoryIds = categories.map((category) => category._id);
  const productIds = [...new Set(collections.flatMap((collection) => collection.productIds.map(String)))];
  const products = productIds.length
    ? await Product.find(
        visibleProductFilter(categoryIds, {
          _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
      )
    : [];
  const categoryMap = getCategoryMap(categories);
  const productMap = new Map(products.map((product) => [product._id.toString(), serializeProduct(product, categoryMap)]));

  return collections.map((collection) => {
    const linkedProducts = collection.productIds
      .map((id) => productMap.get(id.toString()))
      .filter((product) => product !== undefined);
    return {
      id: collection._id.toString(),
      name: collection.name,
      slug: collection.slug,
      image: collection.image,
      description: collection.description || '',
      sortOrder: collection.sortOrder,
      isMandirFeature: collection.isMandirFeature,
      productCount: linkedProducts.length,
      productIds: linkedProducts.map((product) => product.id),
    };
  });
};

const loadVisibleProjects = async () => {
  const projects = await Project.find({ isVisible: true }).sort({ sortOrder: 1, createdAt: 1 });
  return projects.map((project) => ({
    id: project._id.toString(),
    title: project.title,
    type: project.type,
    image: project.image,
    sortOrder: project.sortOrder,
  }));
};

const loadHeroImages = async () => {
  const images = await Banner.find({
    isActive: { $ne: false },
    isVisible: { $ne: false },
  }).sort({ displayOrder: 1, createdAt: 1 });
  return images.map((image) => ({
    id: image._id.toString(),
    kind: image.kind,
    image: image.image,
    alt: image.alt || image.title,
    title: image.title,
    subtitle: image.subtitle || '',
    sortOrder: image.displayOrder,
  }));
};

const loadApprovedTestimonials = async () => {
  const testimonials = await Testimonial.find({
    isApproved: true,
    isActive: true,
    name: { $exists: true, $ne: '' },
  }).sort({ createdAt: -1 });
  return testimonials
    .filter((testimonial) => Boolean(testimonial.text || testimonial.comment))
    .map((testimonial) => ({
      id: testimonial._id.toString(),
      name: testimonial.name,
      role: testimonial.role || '',
      city: testimonial.city || '',
      text: testimonial.text || testimonial.comment,
      avatar: testimonial.avatar || '',
    }));
};

const loadVisibleFaqs = async () => {
  const faqs = await FAQ.find({
    isActive: { $ne: false },
    isVisible: { $ne: false },
  }).sort({ sortOrder: 1, displayOrder: 1, createdAt: 1 });
  return faqs.map((faq) => ({
    id: faq._id.toString(),
    question: faq.question,
    answer: faq.answer,
    sortOrder: faq.sortOrder ?? faq.displayOrder,
  }));
};

const loadMandirProducts = async () => {
  const [collections, categories] = await Promise.all([
    Collection.find({
      isVisible: true,
      isMandirFeature: true,
      deletedAt: null,
    }).sort({ sortOrder: 1 }),
    getVisibleCategories(),
  ]);
  const ids = [...new Set(collections.flatMap((collection) => collection.productIds.map(String)))];
  if (ids.length === 0) return [];

  const products = await Product.find(
    visibleProductFilter(categories.map((category) => category._id), {
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    })
  ).limit(2);
  return products.map((product) => serializeProduct(product, getCategoryMap(categories)));
};

const loadHomeData = async () => {
  const [
    settings,
    heroImages,
    categories,
    collections,
    featuredProducts,
    latestProducts,
    projects,
    testimonials,
    faqs,
    processSteps,
    whyUs,
    marqueeItems,
    mandirProducts,
  ] = await Promise.all([
    loadPublicSettings(),
    loadHeroImages(),
    loadPublicCategories(),
    loadPublicCollections(),
    loadPublicProducts({ page: 1, limit: 12, featured: true }),
    loadPublicProducts({ page: 1, limit: 8, sort: 'newest' }),
    loadVisibleProjects(),
    loadApprovedTestimonials(),
    loadVisibleFaqs(),
    ProcessStep.find({ isVisible: true }).sort({ sortOrder: 1 }).lean(),
    WhyUsFeature.find({ isVisible: true }).sort({ sortOrder: 1 }).lean(),
    MarqueeItem.find({ isVisible: true }).sort({ sortOrder: 1 }).lean(),
    loadMandirProducts(),
  ]);

  const configuredFeaturedId = settings.featuredProductId;
  const categoriesForFeatured = configuredFeaturedId ? await getVisibleCategories() : [];
  const configuredFeatured = configuredFeaturedId
    ? await Product.findOne({
        $and: [
          visibleProductFilter(categoriesForFeatured.map((category) => category._id)),
          { _id: new mongoose.Types.ObjectId(configuredFeaturedId) },
        ],
      })
    : null;
  const featuredProduct = configuredFeatured
    ? serializeProduct(configuredFeatured, getCategoryMap(categoriesForFeatured))
    : featuredProducts.data[0] || null;

  return {
    settings,
    heroImages,
    categories,
    collections,
    featuredProducts: featuredProducts.data,
    latestProducts: latestProducts.data,
    featuredProduct,
    projects,
    testimonials,
    faqs,
    processSteps,
    whyUs,
    marqueeItems,
    mandirProducts,
  };
};

const isDoNotTrack = (req: Request): boolean =>
  req.get('DNT') === '1' || req.get('Sec-GPC') === '1';

const inferDevice = (req: Request): 'mobile' | 'desktop' | 'tablet' => {
  const userAgent = req.get('user-agent') || '';
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

const safeReferrerOrigin = (req: Request): string | undefined => {
  const value = req.get('referer');
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const normalizePagePath = (value: string): string => {
  if (!value.startsWith('/')) throw new AppError('Path must be a same-site pathname.', 400, 'VALIDATION_ERROR');
  const url = new URL(value, 'https://internal.invalid');
  if (url.origin !== 'https://internal.invalid') {
    throw new AppError('Path must be a same-site pathname.', 400, 'VALIDATION_ERROR');
  }
  return url.pathname.slice(0, 1000);
};

const touchVisitor = async (
  req: Request,
  visitorId: string,
  device: 'mobile' | 'desktop' | 'tablet'
): Promise<void> => {
  const now = new Date();
  const referrer = safeReferrerOrigin(req);
  await Visitor.findOneAndUpdate(
    { visitorId },
    {
      $set: { lastSeenAt: now, device },
      $setOnInsert: {
        firstSeenAt: now,
        ...(referrer ? { referrer } : {}),
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const normalizeIndianPhone = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '');
  const phone = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new AppError('Enter a valid 10-digit Indian mobile number.', 400, 'VALIDATION_ERROR');
  }
  return phone;
};

export const PublicController = {
  settings: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadPublicSettings() });
  }),

  categories: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadPublicCategories() });
  }),

  category: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOne({
      slug: req.params.slug,
      ...categoryVisibilityFilter,
    });
    if (!category) throw new NotFoundError('Category not found.');
    const result = await loadPublicProducts({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 12),
      categorySlug: category.slug,
    });
    const categories = await loadPublicCategories();
    res.json({
      data: {
        ...categories.find((item) => item.slug === category.slug),
        products: result.data,
      },
      meta: result.meta,
    });
  }),

  collections: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadPublicCollections() });
  }),

  products: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const featuredValue = String(req.query.featured || '');
    const featured =
      featuredValue === 'true' ? true : featuredValue === 'false' ? false : undefined;
    const result = await loadPublicProducts({
      page,
      limit,
      query: String(req.query.q || req.query.search || '').trim(),
      categorySlug: String(req.query.category || '').trim(),
      featured,
      sort: String(req.query.sort || ''),
    });
    res.json(result);
  }),

  featuredProducts: asyncHandler(async (req: Request, res: Response) => {
    const result = await loadPublicProducts({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 12),
      query: String(req.query.q || req.query.search || '').trim(),
      categorySlug: String(req.query.category || '').trim(),
      featured: true,
      sort: String(req.query.sort || ''),
    });
    res.json(result);
  }),

  product: asyncHandler(async (req: Request, res: Response) => {
    const categories = await getVisibleCategories();
    const categoryMap = getCategoryMap(categories);
    const identityFilter: FilterQuery<IProduct> = mongoose.isValidObjectId(req.params.slug)
      ? { _id: req.params.slug }
      : { slug: req.params.slug };
    const product = await Product.findOne({
      $and: [
        visibleProductFilter(categories.map((category) => category._id)),
        identityFilter,
      ],
    });
    if (!product) throw new NotFoundError('Product not found.');

    const categoryId = (product.categoryId || product.category).toString();
    const categoryObjectId = product.categoryId || product.category;
    const categoryClause: FilterQuery<IProduct> = {
      $or: [{ categoryId: categoryObjectId }, { category: categoryObjectId }],
    };
    const related = await Product.find({
      $and: [
        visibleProductFilter(categories.map((category) => category._id), categoryClause),
        { _id: { $ne: product._id } },
      ],
    })
      .sort({ isFeatured: -1, sortOrder: 1 })
      .limit(4);

    res.json({
      data: {
        ...serializeProduct(product, categoryMap),
        description: product.description,
        specifications: product.specifications || [],
        relatedProducts: related.map((item) => serializeProduct(item, categoryMap)),
      },
    });
  }),

  projects: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadVisibleProjects() });
  }),

  heroImages: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadHeroImages() });
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await loadPublicSettings();
    res.json({
      data: {
        yearsExperience: settings.stats?.yearsExperience || 0,
        happyCustomers: settings.stats?.happyCustomers || 0,
        projectsSupplied: settings.stats?.projectsSupplied || 0,
      },
    });
  }),

  testimonials: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadApprovedTestimonials() });
  }),

  faqs: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadVisibleFaqs() });
  }),

  home: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await loadHomeData() });
  }),

  enquiry: asyncHandler(async (req: Request, res: Response) => {
    if (String(req.body.website || '').trim()) {
      throw new AppError('Invalid submission.', 400, 'VALIDATION_ERROR');
    }

    const visitorId = req.body.visitorId ? String(req.body.visitorId) : undefined;
    let productId: mongoose.Types.ObjectId | undefined;
    if (req.body.productId) {
      productId = new mongoose.Types.ObjectId(String(req.body.productId));
      const categories = await getVisibleCategories();
      const product = await Product.findOne({
        $and: [
          visibleProductFilter(categories.map((category) => category._id)),
          { _id: productId },
        ],
      }).select('_id');
      if (!product) throw new AppError('The selected product is no longer available.', 400, 'INVALID_PRODUCT');
    }

    const enquiry = await Enquiry.create({
      name: String(req.body.name).trim(),
      phone: normalizeIndianPhone(String(req.body.phone)),
      need: req.body.need,
      message: String(req.body.message || '').trim(),
      productId,
      source: req.body.source,
      visitorId,
      status: 'new',
      notificationStatus: 'pending',
    });

    if (visitorId) {
      await Visitor.updateOne({ visitorId }, { $set: { enquiryId: enquiry._id } });
    }

    let notificationStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    try {
      notificationStatus = await createNotifier().notifyNewEnquiry(enquiry);
      await Enquiry.updateOne({ _id: enquiry._id }, { $set: { notificationStatus } });
    } catch (error) {
      notificationStatus = 'failed';
      const notificationError = error instanceof Error ? error.message.slice(0, 500) : 'Notification failed.';
      await Enquiry.updateOne(
        { _id: enquiry._id },
        { $set: { notificationStatus, notificationError } }
      );
      logger.error('Failed to notify owner about a new enquiry.', {
        enquiryId: enquiry._id.toString(),
        error: notificationError,
      });
    }

    res.status(201).json({
      data: {
        id: enquiry._id.toString(),
        status: enquiry.status,
        notificationStatus,
      },
    });
  }),

  pageview: asyncHandler(async (req: Request, res: Response) => {
    if (isDoNotTrack(req)) {
      res.status(204).end();
      return;
    }

    const visitorId = String(req.body.visitorId);
    const device = req.body.device || inferDevice(req);
    const path = normalizePagePath(String(req.body.path));
    await touchVisitor(req, visitorId, device);
    await PageView.create({
      visitorId,
      path,
      productId: req.body.productId || undefined,
      categoryId: req.body.categoryId || undefined,
      durationSeconds: req.body.durationSeconds,
      viewedAt: new Date(),
    });
    res.status(202).end();
  }),

  heartbeat: asyncHandler(async (req: Request, res: Response) => {
    if (isDoNotTrack(req)) {
      res.status(204).end();
      return;
    }
    await touchVisitor(req, String(req.body.visitorId), req.body.device || inferDevice(req));
    res.status(204).end();
  }),

  event: asyncHandler(async (req: Request, res: Response) => {
    if (isDoNotTrack(req)) {
      res.status(204).end();
      return;
    }
    const visitorId = String(req.body.visitorId);
    await touchVisitor(req, visitorId, req.body.device || inferDevice(req));
    await VisitorEvent.create({
      visitorId,
      event: req.body.event,
      occurredAt: new Date(),
    });
    res.status(202).end();
  }),

  verifyBill: asyncHandler(async (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    const tokenHash = createHash('sha256').update(String(req.params.token)).digest('hex');
    const bill = await Bill.findOne({
      verifyTokenHash: tokenHash,
      status: { $in: ['final', 'cancelled'] },
      deletedAt: null,
    }).select('billNo billDate grandTotal status');
    if (!bill) throw new NotFoundError('Bill verification link is invalid or expired.');

    const settings = await Setting.findOne({}).select('shopName storeName');
    if (!settings) throw new NotFoundError('Site settings have not been seeded.');
    res.json({
      data: {
        billNo: bill.billNo,
        billDate: bill.billDate,
        shopName: settings.shopName || settings.storeName,
        total: bill.grandTotal.toString(),
        status: bill.status,
      },
    });
  }),
};
