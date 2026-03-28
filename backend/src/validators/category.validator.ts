import { z } from 'zod';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color must be a valid hex color (e.g. #6366f1)')
    .default('#6366f1'),
  icon: z.string().max(50).default('tag'),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ type: true });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
