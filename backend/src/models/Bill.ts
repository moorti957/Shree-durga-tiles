import mongoose, { Document, Schema } from 'mongoose';

export type Money = mongoose.Types.Decimal128;

export interface IBill extends Document {
  billNo?: string;
  idempotencyKey?: string;
  billDate: Date;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerState?: string;
  isGstBill: boolean;
  gstRate: Money;
  deliveryType: 'pickup' | 'home_delivery';
  deliveryAddress?: string;
  deliveryCharge: Money;
  discount: Money;
  advanceAmount: Money;
  advanceMode: 'upi' | 'cash' | 'bank' | 'cheque' | 'none';
  isCod: boolean;
  status: 'draft' | 'final' | 'cancelled';
  notes?: string;
  enquiryId?: mongoose.Types.ObjectId;
  subtotal: Money;
  taxableAmount: Money;
  cgst: Money;
  sgst: Money;
  igst: Money;
  roundOff: Money;
  grandTotal: Money;
  balanceDue: Money;
  amountInWords: string;
  pdfUrl?: string;
  verificationUrl?: string;
  verifyTokenHash?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const zero = () => mongoose.Types.Decimal128.fromString('0');

const BillSchema = new Schema<IBill>(
  {
    billNo: { type: String, unique: true, sparse: true, trim: true },
    idempotencyKey: { type: String, unique: true, sparse: true, trim: true, maxlength: 200 },
    billDate: { type: Date, required: true, default: Date.now },
    customerName: { type: String, required: true, trim: true, maxlength: 150 },
    customerPhone: { type: String, trim: true, maxlength: 20 },
    customerAddress: { type: String, trim: true, maxlength: 2000 },
    customerGstin: { type: String, trim: true, uppercase: true, maxlength: 15 },
    customerState: { type: String, trim: true, maxlength: 100 },
    isGstBill: { type: Boolean, default: true },
    gstRate: { type: Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('18') },
    deliveryType: { type: String, enum: ['pickup', 'home_delivery'], default: 'pickup' },
    deliveryAddress: { type: String, trim: true, maxlength: 2000 },
    deliveryCharge: { type: Schema.Types.Decimal128, default: zero },
    discount: { type: Schema.Types.Decimal128, default: zero },
    advanceAmount: { type: Schema.Types.Decimal128, default: zero },
    advanceMode: { type: String, enum: ['upi', 'cash', 'bank', 'cheque', 'none'], default: 'none' },
    isCod: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'final', 'cancelled'], default: 'draft' },
    notes: { type: String, trim: true, maxlength: 5000 },
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry' },
    subtotal: { type: Schema.Types.Decimal128, default: zero },
    taxableAmount: { type: Schema.Types.Decimal128, default: zero },
    cgst: { type: Schema.Types.Decimal128, default: zero },
    sgst: { type: Schema.Types.Decimal128, default: zero },
    igst: { type: Schema.Types.Decimal128, default: zero },
    roundOff: { type: Schema.Types.Decimal128, default: zero },
    grandTotal: { type: Schema.Types.Decimal128, default: zero },
    balanceDue: { type: Schema.Types.Decimal128, default: zero },
    amountInWords: { type: String, default: '' },
    pdfUrl: { type: String, trim: true },
    verificationUrl: { type: String, trim: true },
    verifyTokenHash: { type: String, select: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BillSchema.index({ status: 1, billDate: -1 });
BillSchema.index({ deletedAt: 1 });
BillSchema.index({ enquiryId: 1 });
BillSchema.index({ verifyTokenHash: 1 }, { unique: true, sparse: true });

export interface IBillItem extends Document {
  billId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  name: string;
  size?: string;
  hsn?: string;
  qty: Money;
  unit: 'sq_ft' | 'box' | 'piece';
  rate: Money;
  amount: Money;
  gstRate?: Money;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>(
  {
    billId: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    size: { type: String, trim: true, maxlength: 100 },
    hsn: { type: String, trim: true, maxlength: 20 },
    qty: { type: Schema.Types.Decimal128, required: true },
    unit: { type: String, enum: ['sq_ft', 'box', 'piece'], required: true },
    rate: { type: Schema.Types.Decimal128, required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    gstRate: { type: Schema.Types.Decimal128 },
  },
  { timestamps: true }
);

BillItemSchema.index({ billId: 1 });

export interface IPayment extends Document {
  billId: mongoose.Types.ObjectId;
  idempotencyKey?: string;
  amount: Money;
  mode: 'upi' | 'cash' | 'bank' | 'cheque';
  paidAt: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    billId: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    idempotencyKey: { type: String, unique: true, sparse: true, trim: true, maxlength: 200 },
    amount: { type: Schema.Types.Decimal128, required: true },
    mode: { type: String, enum: ['upi', 'cash', 'bank', 'cheque'], required: true },
    paidAt: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

PaymentSchema.index({ billId: 1, paidAt: 1 });

export interface IBillCounter extends Document {
  key: string;
  nextValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const BillCounterSchema = new Schema<IBillCounter>(
  {
    key: { type: String, required: true, unique: true },
    nextValue: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

export const Bill = mongoose.model<IBill>('Bill', BillSchema);
export const BillItem = mongoose.model<IBillItem>('BillItem', BillItemSchema);
export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export const BillCounter = mongoose.model<IBillCounter>('BillCounter', BillCounterSchema);
export default Bill;
