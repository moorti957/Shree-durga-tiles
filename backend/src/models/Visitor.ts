import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  visitorId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  device: 'mobile' | 'desktop' | 'tablet';
  city?: string;
  region?: string;
  referrer?: string;
  enquiryId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    firstSeenAt: { type: Date, required: true, default: Date.now },
    lastSeenAt: { type: Date, required: true, default: Date.now },
    device: { type: String, enum: ['mobile', 'desktop', 'tablet'], required: true },
    city: { type: String, trim: true, maxlength: 100 },
    region: { type: String, trim: true, maxlength: 100 },
    referrer: { type: String, trim: true, maxlength: 500 },
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry' },
  },
  { timestamps: true }
);

VisitorSchema.index({ lastSeenAt: -1 });
VisitorSchema.index({ firstSeenAt: -1 });

export interface IPageView extends Document {
  visitorId: string;
  path: string;
  productId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  viewedAt: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    visitorId: { type: String, required: true, trim: true, maxlength: 100 },
    path: { type: String, required: true, trim: true, maxlength: 1000 },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    viewedAt: { type: Date, required: true, default: Date.now },
    durationSeconds: { type: Number, min: 0 },
  },
  { timestamps: true }
);

PageViewSchema.index({ visitorId: 1, viewedAt: -1 });
PageViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);
export const PageView = mongoose.model<IPageView>('PageView', PageViewSchema);

export interface IVisitorEvent extends Document {
  visitorId: string;
  event: 'call_click' | 'whatsapp_click';
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorEventSchema = new Schema<IVisitorEvent>(
  {
    visitorId: { type: String, required: true, trim: true, maxlength: 100 },
    event: { type: String, enum: ['call_click', 'whatsapp_click'], required: true },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

VisitorEventSchema.index({ visitorId: 1, occurredAt: -1 });
VisitorEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const VisitorEvent = mongoose.model<IVisitorEvent>('VisitorEvent', VisitorEventSchema);
export default Visitor;
