import { z } from 'zod';

export const billSchema = z.object({
  customerName: z.string().trim().min(2, 'Enter the customer name.').max(150),
  customerPhone: z.string().trim().max(20).optional(),
  customerAddress: z.string().trim().max(2000).optional(),
  isGstBill: z.boolean().default(true),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  customerState: z.string().trim().max(100).optional(),
  deliveryType: z.enum(['pickup', 'home_delivery']).default('pickup'),
  deliveryCharge: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  advanceAmount: z.coerce.number().min(0).default(0),
  advanceMode: z.enum(['upi', 'cash', 'bank', 'cheque', 'none']).default('none'),
  isCod: z.boolean().default(true),
  notes: z.string().max(5000).optional(),
  items: z.array(z.object({
    name: z.string().trim().min(1),
    size: z.string().optional(),
    qty: z.coerce.number().positive(),
    unit: z.enum(['sq_ft', 'box', 'piece']),
    rate: z.coerce.number().min(0),
  })).min(1, 'Add at least one item.'),
});

export type BillFormInput = z.input<typeof billSchema>;
export type BillFormValues = z.output<typeof billSchema>;
