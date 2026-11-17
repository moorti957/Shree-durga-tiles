import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  type: 'Residential' | 'Commercial' | 'Mandir & Temple' | 'Outdoor & Landscape';
  image: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    type: {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Mandir & Temple', 'Outdoor & Landscape'],
    },
    image: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ isVisible: 1, sortOrder: 1 });

export interface IProcessStep extends Document {
  title: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema = new Schema<IProcessStep>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProcessStepSchema.index({ isVisible: 1, sortOrder: 1 });

export interface IWhyUsFeature extends Document {
  title: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhyUsFeatureSchema = new Schema<IWhyUsFeature>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WhyUsFeatureSchema.index({ isVisible: 1, sortOrder: 1 });

export interface IMarqueeItem extends Document {
  text: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeItemSchema = new Schema<IMarqueeItem>(
  {
    text: { type: String, required: true, trim: true, maxlength: 100 },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MarqueeItemSchema.index({ isVisible: 1, sortOrder: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const ProcessStep = mongoose.model<IProcessStep>('ProcessStep', ProcessStepSchema);
export const WhyUsFeature = mongoose.model<IWhyUsFeature>('WhyUsFeature', WhyUsFeatureSchema);
export const MarqueeItem = mongoose.model<IMarqueeItem>('MarqueeItem', MarqueeItemSchema);
