import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  image: string;
  description?: string;
  productIds: mongoose.Types.ObjectId[];
  sortOrder: number;
  isVisible: boolean;
  isMandirFeature: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    image: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    productIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    isMandirFeature: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CollectionSchema.index({ isVisible: 1, sortOrder: 1 });
CollectionSchema.index({ deletedAt: 1 });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
export default Collection;
