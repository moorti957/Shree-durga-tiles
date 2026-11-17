import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

dotenv.config();

interface MigrationSummary {
  dryRun: boolean;
  categoriesScanned: number;
  categoriesUpdated: number;
  productsScanned: number;
  productsUpdated: number;
  deletedRecords: number;
}

async function migrate(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const summary: MigrationSummary = {
    dryRun,
    categoriesScanned: 0,
    categoriesUpdated: 0,
    productsScanned: 0,
    productsUpdated: 0,
    deletedRecords: 0,
  };

  console.warn('Back up the MongoDB database before running this migration.');
  await connectDB();

  try {
    const categories = await Category.collection.find({ isVisible: { $exists: false } }).toArray();
    summary.categoriesScanned = categories.length;
    for (const category of categories) {
      const set: Record<string, unknown> = {
        isVisible: category.isActive !== false,
      };
      if (!Object.prototype.hasOwnProperty.call(category, 'showInHeroStrip')) {
        set.showInHeroStrip = false;
      }
      if (!Object.prototype.hasOwnProperty.call(category, 'sortOrder')) {
        set.sortOrder = Number.isInteger(category.displayOrder) ? category.displayOrder : 0;
      }
      if (!Object.prototype.hasOwnProperty.call(category, 'deletedAt')) {
        set.deletedAt = null;
      }
      if (!dryRun) {
        await Category.collection.updateOne(
          { _id: category._id, isVisible: { $exists: false } },
          { $set: set }
        );
      }
      summary.categoriesUpdated += 1;
    }

    const products = await Product.collection.find({ status: { $exists: false } }).toArray();
    summary.productsScanned = products.length;
    for (const product of products) {
      const images = Array.isArray(product.images) ? product.images : [];
      const imageDetails = images
        .filter((image): image is string => typeof image === 'string' && image.length > 0)
        .map((url) => ({ url, alt: product.name || '' }));
      const set: Record<string, unknown> = {
        status: product.isActive === false ? 'draft' : 'published',
      };
      if (!Object.prototype.hasOwnProperty.call(product, 'publishedAt')) {
        set.publishedAt = product.isActive === false ? null : product.createdAt || new Date();
      }
      if (!Object.prototype.hasOwnProperty.call(product, 'priceUnit')) set.priceUnit = 'sq_ft';
      if (!Object.prototype.hasOwnProperty.call(product, 'categoryId')) set.categoryId = product.category;
      if (!Object.prototype.hasOwnProperty.call(product, 'collectionIds')) set.collectionIds = [];
      if (!Object.prototype.hasOwnProperty.call(product, 'sortOrder')) set.sortOrder = 0;
      if (!Object.prototype.hasOwnProperty.call(product, 'isSample')) set.isSample = false;
      if (!Object.prototype.hasOwnProperty.call(product, 'deletedAt')) set.deletedAt = null;
      if (!product.imageDetails?.length) set.imageDetails = imageDetails;

      if (!dryRun) {
        await Product.collection.updateOne(
          { _id: product._id, status: { $exists: false } },
          { $set: set }
        );
      }
      summary.productsUpdated += 1;
    }

    console.info('Migration report:', JSON.stringify(summary, null, 2));
    console.info('This migration updates only missing fields; it does not delete or replace existing records.');
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
