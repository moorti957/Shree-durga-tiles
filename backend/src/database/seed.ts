import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AdminUser } from '../models/AdminUser';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { FAQ } from '../models/FAQ';
import { MarqueeItem, ProcessStep, WhyUsFeature } from '../models/SiteContent';
import { Setting } from '../models/Setting';
import { Product } from '../models/Product';
import { connectDB } from '../config/database';

dotenv.config();

const categories = [
  'Marble',
  'Granite',
  'Tiles',
  'Quartz',
  'Kitchen Tops',
  'Outdoor',
];

const collections = [
  'Kitchen Granite',
  'Bathroom Tiles',
  'Living Room Flooring',
  'Wall Cladding',
  'Outdoor Flooring',
];

const faqs = [
  {
    question: 'Do you deliver outside Rajasthan?',
    answer:
      'Yes. We offer Pan India delivery, with safe packing for stone and tiles so they reach your site in good condition.',
  },
  {
    question: 'Can I see the stone before I order?',
    answer:
      'Please visit our showroom in Nowgava, Alwar, or call us. Our team can help you compare options and finishes in person.',
  },
  {
    question: 'Do you supply for builders and bulk projects?',
    answer:
      'Yes. Contact us with your project requirements to discuss bulk supply and pricing.',
  },
  {
    question: 'What products do you sell?',
    answer:
      'We offer marble, granite, tiles, quartz, kitchen tops, outdoor flooring, wall cladding, sanitaryware and bath fittings.',
  },
  {
    question: 'How do I get a price?',
    answer:
      'Use the contact form or call us with your requirement and approximate area. We will discuss options and pricing.',
  },
];

const processSteps = [
  {
    title: 'Share your requirements',
    description: 'Tell us about the space, material, size and quantity you are looking for.',
  },
  {
    title: 'Explore materials',
    description: 'Compare available stones, tiles, sizes and finishes with our team.',
  },
  {
    title: 'Get a quote',
    description: 'Request a product or project quote based on your selected requirements.',
  },
  {
    title: 'Plan supply',
    description: 'Confirm pickup or delivery details with the showroom team.',
  },
];

const whyUsFeatures = [
  {
    title: 'Quality you can trust',
    description: 'Thoughtful selection for spaces made to last.',
  },
  {
    title: 'Pan India delivery',
    description: 'Careful packing and dispatch for your project.',
  },
  {
    title: 'Expert guidance',
    description: 'Compare materials, finishes and applications with us.',
  },
  {
    title: 'Bulk supply',
    description: 'Speak with our team about project requirements.',
  },
];

const marqueeItems = [
  'शुभ आरंभ',
  'Premium Marble',
  'Granite',
  'Designer Tiles',
  'Sanitaryware',
  'Bulk Supply',
  'Pan India Delivery',
  '॥ जय माता दी ॥',
];

const sampleProducts = [
  { name: 'Makrana White', category: 'Marble' },
  { name: 'Black Galaxy', category: 'Granite' },
  { name: 'Udaipur Green', category: 'Marble' },
  { name: 'Tan Brown', category: 'Granite' },
  { name: 'Marble-Look Vitrified', category: 'Tiles' },
  { name: 'Outdoor Paver', category: 'Outdoor' },
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function seedAdmin(): Promise<void> {
  const identifier = (process.env.ADMIN_EMAIL || process.env.ADMIN_IDENTIFIER || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!identifier || !password) {
    throw new Error('ADMIN_EMAIL (or ADMIN_IDENTIFIER) and ADMIN_PASSWORD are required to seed the owner account.');
  }
  if (password.length < 10) {
    throw new Error('ADMIN_PASSWORD must be at least 10 characters long.');
  }

  const existingAdmin = await AdminUser.findOne({ identifier }).select('+passwordHash');
  if (existingAdmin) {
    console.info(`Owner account already exists for ${identifier}; credentials were not changed.`);
    return;
  }

  await AdminUser.create({
    name: process.env.ADMIN_NAME?.trim() || 'Store Owner',
    identifier,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'owner',
  });
  console.info(`Created owner account for ${identifier}.`);
}

async function seed(): Promise<void> {
  await connectDB();
  try {
    await seedAdmin();

    const categoryByName = new Map<string, mongoose.Types.ObjectId>();
    for (const [sortOrder, name] of categories.entries()) {
      const category = await Category.findOneAndUpdate(
        { slug: slugify(name) },
        {
          $setOnInsert: {
            name,
            slug: slugify(name),
            description: '',
            image: '',
            displayOrder: sortOrder,
            sortOrder,
            isActive: true,
            isVisible: true,
            showInHeroStrip: true,
            deletedAt: null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryByName.set(name, category._id);
    }

    for (const [sortOrder, name] of collections.entries()) {
      await Collection.updateOne(
        { slug: slugify(name) },
        {
          $setOnInsert: {
            name,
            slug: slugify(name),
            image: '',
            description: '',
            productIds: [],
            sortOrder,
            isVisible: true,
            isMandirFeature: false,
            deletedAt: null,
          },
        },
        { upsert: true }
      );
    }

    for (const [sortOrder, faq] of faqs.entries()) {
      await FAQ.updateOne(
        { question: faq.question },
        {
          $setOnInsert: {
            ...faq,
            answer: faq.answer,
            displayOrder: sortOrder,
            sortOrder,
            isActive: true,
            isVisible: true,
          },
        },
        { upsert: true }
      );
    }

    for (const [sortOrder, step] of processSteps.entries()) {
      await ProcessStep.updateOne(
        { title: step.title },
        { $setOnInsert: { ...step, sortOrder, isVisible: true } },
        { upsert: true }
      );
    }

    for (const [sortOrder, feature] of whyUsFeatures.entries()) {
      await WhyUsFeature.updateOne(
        { title: feature.title },
        { $setOnInsert: { ...feature, sortOrder, isVisible: true } },
        { upsert: true }
      );
    }

    for (const [sortOrder, text] of marqueeItems.entries()) {
      await MarqueeItem.updateOne(
        { text },
        { $setOnInsert: { text, sortOrder, isVisible: true } },
        { upsert: true }
      );
    }

    await Setting.findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          storeName: 'Shree Durga Tiles',
          shopName: 'Shree Durga Tiles',
          storeEmail: '',
          storePhone: '',
          phone: '',
          whatsapp: '',
          email: '',
          storeAddress: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.',
          address: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.',
          gstin: '',
          upiId: '',
          stats: { yearsExperience: 0, happyCustomers: 0, projectsSupplied: 0 },
          invoicePrefix: 'SDT-',
          nextBillNumber: 1,
          qrMode: 'upi',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (process.argv.includes('--sample')) {
      for (const [sortOrder, sample] of sampleProducts.entries()) {
        const categoryId = categoryByName.get(sample.category);
        if (!categoryId) throw new Error(`Missing sample product category: ${sample.category}`);
        await Product.updateOne(
          { slug: slugify(sample.name) },
          {
            $setOnInsert: {
              name: sample.name,
              slug: slugify(sample.name),
              description: 'Sample catalogue item. Replace with verified product details before publishing.',
              excerpt: '',
              price: null,
              priceUnit: 'sq_ft',
              images: [],
              imageDetails: [],
              category: categoryId,
              categoryId,
              collectionIds: [],
              sortOrder,
              status: 'draft',
              isActive: false,
              isFeatured: false,
              isSample: true,
              inStock: false,
              stockQuantity: 0,
              deletedAt: null,
            },
          },
          { upsert: true }
        );
      }
    }

    console.info(
      `Seed completed${process.argv.includes('--sample') ? ' with sample products' : ''}. No existing records were overwritten.`
    );
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
