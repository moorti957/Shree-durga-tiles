import mongoose, { Document, Schema } from 'mongoose';

export type EnquiryNeed =
  | 'Marble'
  | 'Granite'
  | 'Floor/Wall Tiles'
  | 'Kitchen Top'
  | 'Mandir/Pooja Room Stone'
  | 'Bulk supply for a project'
  | 'Other';

export type EnquirySource =
  | 'quote_form'
  | 'mandir_cta'
  | 'product_enquire'
  | 'whatsapp_click'
  | 'call_click';

export interface IEnquiry extends Document {
  name: string;
  phone: string;
  need: EnquiryNeed;
  message?: string;
  productId?: mongoose.Types.ObjectId;
  source: EnquirySource;
  visitorId?: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  notificationStatus: 'pending' | 'sent' | 'failed' | 'skipped';
  notificationError?: string;
  adminNote?: string;
  contactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    need: {
      type: String,
      required: true,
      enum: [
        'Marble',
        'Granite',
        'Floor/Wall Tiles',
        'Kitchen Top',
        'Mandir/Pooja Room Stone',
        'Bulk supply for a project',
        'Other',
      ],
    },
    message: { type: String, trim: true, maxlength: 3000 },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    source: {
      type: String,
      required: true,
      enum: ['quote_form', 'mandir_cta', 'product_enquire', 'whatsapp_click', 'call_click'],
    },
    visitorId: { type: String, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
    },
    notificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
    },
    notificationError: { type: String, maxlength: 500, select: false },
    adminNote: { type: String, trim: true, maxlength: 5000 },
    contactedAt: { type: Date },
  },
  { timestamps: true }
);

EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ phone: 1, createdAt: -1 });
EnquirySchema.index({ visitorId: 1, createdAt: -1 });

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
export default Enquiry;
