import { z } from 'zod';

const transactionBaseSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').multipleOf(0.01),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Description is required').max(255),
  notes: z.string().max(1000).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  categoryId: z.string().cuid('Invalid category ID'),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
});

export const createTransactionSchema = transactionBaseSchema.refine(
  (data) => !data.isRecurring || data.recurringInterval !== undefined,
  { message: 'recurringInterval is required when isRecurring is true', path: ['recurringInterval'] }
);

export const updateTransactionSchema = transactionBaseSchema.partial();

export const transactionFiltersSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().cuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
  sortBy: z.enum(['date', 'amount', 'description']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>;
