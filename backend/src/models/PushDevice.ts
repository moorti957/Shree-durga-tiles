import mongoose, { Document, Schema } from 'mongoose';

export interface IPushDevice extends Document {
  adminId: mongoose.Types.ObjectId;
  token: string;
  platform: 'android' | 'ios';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PushDeviceSchema = new Schema<IPushDevice>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    token: { type: String, required: true, trim: true, maxlength: 512 },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PushDeviceSchema.index({ adminId: 1, token: 1 }, { unique: true });

export const PushDevice = mongoose.model<IPushDevice>('PushDevice', PushDeviceSchema);
