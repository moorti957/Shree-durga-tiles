import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter a product name.').max(100),
  categoryId: z.string().min(1, 'Choose a category.'),
  description: z.string().trim().min(1, 'Enter a short description.'),
  size: z.string().optional(),
  finish: z.string().optional(),
  quality: z.enum(['Premium', 'Standard', 'Economy']).optional(),
  price: z.coerce.number().min(0).nullable().optional(),
  priceUnit: z.enum(['sq_ft', 'box', 'piece']).default('sq_ft'),
  status: z.enum(['draft', 'published']).default('draft'),
  images: z.array(z.string()).max(8).default([]),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
