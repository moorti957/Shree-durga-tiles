import { createHash, randomBytes } from 'crypto';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, AppError, NotFoundError } from '../middlewares/errorHandler';
import { Bill, BillCounter, BillItem, Payment } from '../models/Bill';
import { Setting } from '../models/Setting';
import { calculateBill as calculateBillValues } from '../services/billCalculator';
import { renderBillPdf } from '../services/billPdf';
import { PUBLIC_API_URL } from '../config/network';

type BillItemInput = {
  productId?: string;
  name: string;
  size?: string;
  hsn?: string;
  qty: number;
  unit: 'sq_ft' | 'box' | 'piece';
  rate: number;
  gstRate?: number;
};

type BillInput = {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerState?: string;
  isGstBill?: boolean;
  gstRate?: number;
  deliveryType?: 'pickup' | 'home_delivery';
  deliveryAddress?: string;
  deliveryCharge?: number;
  discount?: number;
  advanceAmount?: number;
  advanceMode?: 'upi' | 'cash' | 'bank' | 'cheque' | 'none';
  isCod?: boolean;
  notes?: string;
  enquiryId?: string;
  items: BillItemInput[];
};

const toPaise = (value: number, field: string): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new AppError(`${field} must be a non-negative number.`, 400, 'VALIDATION_ERROR');
  }
  const amount = Math.round(value * 100);
  if (!Number.isSafeInteger(amount)) {
    throw new AppError(`${field} exceeds the supported amount.`, 400, 'VALIDATION_ERROR');
  }
  return amount;
};

const decimal = (paise: number): mongoose.Types.Decimal128 =>
  mongoose.Types.Decimal128.fromString((paise / 100).toFixed(2));

const verificationUrl = (req: Request, token: string) => {
  const apiBase = PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api`;
  return `${apiBase}/public/bills/verify/${token}`;
};

const calculate = (input: BillInput) => {
  let result;
  try {
    result = calculateBillValues(input);
  } catch (error) {
    if (error instanceof Error) throw new AppError(error.message, 400, 'VALIDATION_ERROR');
    throw error;
  }
  const asMoney = (value: number) => decimal(value);
  return {
    subtotal: asMoney(result.subtotalPaise),
    taxableAmount: asMoney(result.taxableAmountPaise),
    cgst: asMoney(result.cgstPaise),
    sgst: asMoney(result.sgstPaise),
    igst: asMoney(result.igstPaise),
    roundOff: asMoney(result.roundOffPaise),
    deliveryCharge: asMoney(result.deliveryChargePaise),
    discount: asMoney(result.discountPaise),
    advanceAmount: asMoney(result.advanceAmountPaise),
    grandTotal: asMoney(result.grandTotalPaise),
    balanceDue: asMoney(result.balanceDuePaise),
    amountInWords: result.amountInWords,
    amounts: result.itemAmountsPaise,
  };
};

const loadBill = async (id: string) => {
  const bill = await Bill.findOne({ _id: id, deletedAt: null }).lean();
  if (!bill) throw new NotFoundError('Bill not found.');
  const [items, payments] = await Promise.all([
    BillItem.find({ billId: bill._id }).sort({ createdAt: 1 }).lean(),
    Payment.find({ billId: bill._id }).sort({ paidAt: 1 }).lean(),
  ]);
  return { ...bill, items, payments };
};

const inputFields = [
  'customerName', 'customerPhone', 'customerAddress', 'customerGstin', 'customerState',
  'isGstBill', 'gstRate', 'deliveryType', 'deliveryAddress', 'deliveryCharge', 'discount',
  'advanceAmount', 'advanceMode', 'isCod', 'notes',
] as const;

const readBillInput = (body: Record<string, unknown>): BillInput => {
  const { items, ...fields } = body;
  return {
    ...Object.fromEntries(inputFields.filter((field) => field in fields).map((field) => [field, fields[field]])),
    items: items as BillItemInput[],
  } as BillInput;
};

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

const compensatePaymentBalance = async (billId: mongoose.Types.ObjectId, amount: mongoose.Types.Decimal128) => {
  const result = await Bill.updateOne({ _id: billId }, { $inc: { balanceDue: amount } });
  if (result.modifiedCount !== 1) {
    throw new AppError(
      'Payment could not be recorded and the bill balance requires reconciliation.',
      500,
      'PAYMENT_RECONCILIATION_REQUIRED'
    );
  }
};

export const MobileBillController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const key = req.get('Idempotency-Key')?.trim();
    if (key) {
      const previous = await Bill.findOne({ idempotencyKey: key, deletedAt: null }).lean();
      if (previous) {
        res.status(200).json({ success: true, data: await loadBill(String(previous._id)) });
        return;
      }
    }
    const setting = await Setting.findOne({}).select('defaultGstRate');
    const input = readBillInput({
      ...req.body,
      gstRate: req.body.gstRate ?? setting?.defaultGstRate ?? 18,
    });
    const totals = calculate(input);
    let bill;
    try {
      bill = await Bill.create({
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      customerGstin: input.customerGstin,
      customerState: input.customerState,
      isGstBill: input.isGstBill !== false,
      gstRate: mongoose.Types.Decimal128.fromString(String(input.gstRate)),
      deliveryType: input.deliveryType ?? 'pickup',
      deliveryAddress: input.deliveryAddress,
      deliveryCharge: totals.deliveryCharge,
      discount: totals.discount,
      advanceAmount: totals.advanceAmount,
      advanceMode: input.advanceMode ?? 'none',
      isCod: input.isCod ?? false,
      notes: input.notes,
      enquiryId: input.enquiryId,
      subtotal: totals.subtotal,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      grandTotal: totals.grandTotal,
      roundOff: totals.roundOff,
      balanceDue: totals.balanceDue,
      amountInWords: totals.amountInWords,
      status: 'draft',
      ...(key ? { idempotencyKey: key } : {}),
      });
    } catch (error) {
      if (key && isDuplicateKeyError(error)) {
        const duplicate = await Bill.findOne({ idempotencyKey: key, deletedAt: null }).lean();
        if (duplicate) {
          res.status(200).json({ success: true, data: await loadBill(String(duplicate._id)) });
          return;
        }
      }
      throw error;
    }
    try {
      await BillItem.insertMany(input.items.map((item, index) => ({
        billId: bill._id,
        productId: item.productId,
        name: item.name.trim(),
        size: item.size,
        hsn: item.hsn,
        qty: mongoose.Types.Decimal128.fromString(String(item.qty)),
        unit: item.unit,
        rate: mongoose.Types.Decimal128.fromString(String(item.rate)),
        amount: totals.amounts[index] !== undefined ? decimal(totals.amounts[index]) : decimal(0),
        gstRate: item.gstRate === undefined ? undefined : mongoose.Types.Decimal128.fromString(String(item.gstRate)),
      })));
    } catch (error) {
      await Promise.all([
        BillItem.deleteMany({ billId: bill._id }),
        Bill.deleteOne({ _id: bill._id }),
      ]);
      throw error;
    }
    res.status(201).json({ success: true, data: await loadBill(String(bill._id)) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const bill = await Bill.findOne({ _id: req.params.id, status: 'draft', deletedAt: null });
    if (!bill) throw new NotFoundError('Draft bill not found.');
    const currentItems = await BillItem.find({ billId: bill._id }).sort({ createdAt: 1 }).lean();
    const input = readBillInput({
      customerName: bill.customerName,
      customerPhone: bill.customerPhone,
      customerAddress: bill.customerAddress,
      customerGstin: bill.customerGstin,
      customerState: bill.customerState,
      isGstBill: bill.isGstBill,
      gstRate: Number(bill.gstRate.toString()),
      deliveryType: bill.deliveryType,
      deliveryAddress: bill.deliveryAddress,
      deliveryCharge: Number(bill.deliveryCharge.toString()),
      discount: Number(bill.discount.toString()),
      advanceAmount: Number(bill.advanceAmount.toString()),
      advanceMode: bill.advanceMode,
      isCod: bill.isCod,
      notes: bill.notes,
      ...req.body,
      items: req.body.items ?? currentItems.map((item) => ({
        productId: item.productId?.toString(),
        name: item.name,
        size: item.size,
        hsn: item.hsn,
        qty: Number(item.qty.toString()),
        unit: item.unit,
        rate: Number(item.rate.toString()),
        gstRate: item.gstRate ? Number(item.gstRate.toString()) : undefined,
      })),
    });
    const totals = calculate(input);
    for (const field of inputFields) {
      if (field in req.body) bill.set(field, req.body[field]);
    }
    bill.set({
      subtotal: totals.subtotal,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      deliveryCharge: totals.deliveryCharge,
      discount: totals.discount,
      advanceAmount: totals.advanceAmount,
      grandTotal: totals.grandTotal,
      roundOff: totals.roundOff,
      balanceDue: totals.balanceDue,
      amountInWords: totals.amountInWords,
      gstRate: mongoose.Types.Decimal128.fromString(String(input.gstRate ?? 18)),
    });
    await bill.save();
    if (req.body.items) {
      await BillItem.deleteMany({ billId: bill._id });
      await BillItem.insertMany(input.items.map((item, index) => ({
        billId: bill._id,
        productId: item.productId,
        name: item.name.trim(),
        size: item.size,
        hsn: item.hsn,
        qty: mongoose.Types.Decimal128.fromString(String(item.qty)),
        unit: item.unit,
        rate: mongoose.Types.Decimal128.fromString(String(item.rate)),
        amount: decimal(totals.amounts[index] ?? 0),
        gstRate: item.gstRate === undefined ? undefined : mongoose.Types.Decimal128.fromString(String(item.gstRate)),
      })));
    }
    res.json({ success: true, data: await loadBill(String(bill._id)) });
  }),

  finalize: asyncHandler(async (req: Request, res: Response) => {
    const draft = await Bill.findOne({ _id: req.params.id, status: 'draft', deletedAt: null });
    if (!draft) throw new AppError('Only a draft bill can be finalized.', 409, 'BILL_NOT_DRAFT');
    const settings = await Setting.findOne({}).select('invoicePrefix');
    const prefix = settings?.invoicePrefix?.trim() || 'SDT-';
    const year = new Date(draft.billDate).getFullYear();
    const counter = await BillCounter.findOneAndUpdate(
      { key: `${prefix}${year}` },
      { $inc: { nextValue: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: false }
    );
    const billNo = `${prefix}${year}-${String(counter.nextValue).padStart(5, '0')}`;
    const token = randomBytes(32).toString('base64url');
    const bill = await Bill.findOneAndUpdate(
      { _id: draft._id, status: 'draft', deletedAt: null },
      {
        $set: {
          status: 'final',
          billNo,
          verifyTokenHash: createHash('sha256').update(token).digest('hex'),
          verificationUrl: verificationUrl(req, token),
        },
      },
      { new: true, runValidators: true }
    );
    if (!bill) throw new AppError('Bill was finalized by another request.', 409, 'BILL_ALREADY_FINAL');
    res.json({ success: true, data: await loadBill(String(bill._id)) });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['draft', 'final'] }, deletedAt: null },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!bill) throw new NotFoundError('Bill not found or already cancelled.');
    res.json({ success: true, data: await loadBill(String(bill._id)) });
  }),

  addPayment: asyncHandler(async (req: Request, res: Response) => {
    const key = req.get('Idempotency-Key')?.trim();
    if (key) {
      const existingPayment = await Payment.findOne({ idempotencyKey: key });
      if (existingPayment) {
        if (String(existingPayment.billId) !== req.params.id) {
          throw new AppError('Idempotency key was already used for another bill.', 409, 'IDEMPOTENCY_KEY_REUSED');
        }
        res.json({ success: true, data: await loadBill(String(existingPayment.billId)) });
        return;
      }
    }
    const amountPaise = toPaise(Number(req.body.amount), 'Payment amount');
    if (amountPaise === 0) throw new AppError('Payment amount must be greater than zero.', 400, 'VALIDATION_ERROR');
    const bill = await Bill.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'final',
        deletedAt: null,
        balanceDue: { $gte: decimal(amountPaise) },
      },
      { $inc: { balanceDue: decimal(-amountPaise) } },
      { new: true }
    );
    if (!bill) throw new AppError('Bill not found or payment exceeds the balance due.', 409, 'PAYMENT_EXCEEDS_BALANCE');
    try {
      await Payment.create({
        billId: bill._id,
        amount: decimal(amountPaise),
        mode: req.body.mode,
        paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date(),
        note: req.body.note,
        ...(key ? { idempotencyKey: key } : {}),
      });
    } catch (error) {
      await compensatePaymentBalance(bill._id, decimal(amountPaise));
      if (key && isDuplicateKeyError(error)) {
        const duplicate = await Payment.findOne({ idempotencyKey: key });
        if (duplicate) {
          if (String(duplicate.billId) !== req.params.id) {
            throw new AppError('Idempotency key was already used for another bill.', 409, 'IDEMPOTENCY_KEY_REUSED');
          }
          res.json({ success: true, data: await loadBill(String(duplicate.billId)) });
          return;
        }
      }
      throw error;
    }
    res.status(201).json({ success: true, data: await loadBill(String(bill._id)) });
  }),

  shareLink: asyncHandler(async (req: Request, res: Response) => {
    const bill = await Bill.findOne({ _id: req.params.id, status: 'final', deletedAt: null });
    if (!bill) throw new NotFoundError('Finalized bill not found.');
    if (!bill.verificationUrl) {
      const token = randomBytes(32).toString('base64url');
      bill.verifyTokenHash = createHash('sha256').update(token).digest('hex');
      bill.verificationUrl = verificationUrl(req, token);
      await bill.save();
    }
    res.json({
      success: true,
      data: {
        url: bill.verificationUrl,
        message: `Verify bill ${bill.billNo} for ${bill.customerName}: ${bill.verificationUrl}`,
      },
    });
  }),

  pdf: asyncHandler(async (req: Request, res: Response) => {
    const bill = await Bill.findOne({ _id: req.params.id, status: 'final', deletedAt: null }).lean();
    if (!bill) throw new NotFoundError('Finalized bill not found.');
    const [items, settings] = await Promise.all([
      BillItem.find({ billId: bill._id }).sort({ createdAt: 1 }).lean(),
      Setting.findOne({}).select('shopName phone address gstin invoiceTerms invoiceFooterNote').lean(),
    ]);
    const pdf = await renderBillPdf(bill, items, settings);
    const filename = `${(bill.billNo || 'bill').replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);
  }),
};
