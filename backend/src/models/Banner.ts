// backend/src/models/Banner.ts

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Types
// ============================================================

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  alt?: string;
  kind: 'hero_arch' | 'granite_overlay' | 'banner';
  link?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Banner Schema
// ============================================================

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    alt: { type: String, trim: true, maxlength: 200 },
    kind: {
      type: String,
      enum: ['hero_arch', 'granite_overlay', 'banner'],
      default: 'banner',
    },
    link: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVisible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// Indexes
// ============================================================

// For efficient querying of active banners sorted by order
BannerSchema.index({ isActive: 1, displayOrder: 1 });

// ============================================================
// Model
// ============================================================

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;