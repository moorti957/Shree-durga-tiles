import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminUser extends Document {
  name: string;
  identifier: string;
  passwordHash: string;
  role: 'owner';
  mobile?: string;
  profileImage?: string;
  lastLoginAt?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    identifier: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner'], default: 'owner', required: true },
    mobile: { type: String, default: '', trim: true },
    profileImage: { type: String, default: '' },
    lastLoginAt: { type: Date },
    failedAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }
);

AdminUserSchema.index({ identifier: 1 }, { unique: true });

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
export default AdminUser;
