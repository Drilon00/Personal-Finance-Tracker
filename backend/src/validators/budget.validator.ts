import { z } from 'zod';

export const createBudgetSchema = z.object({
  amount: z.number().positive('Budget amount must be greater than 0').multipleOf(0.01),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  categoryId: z.string().cuid('Invalid category ID'),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Budget amount must be greater than 0').multipleOf(0.01),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
