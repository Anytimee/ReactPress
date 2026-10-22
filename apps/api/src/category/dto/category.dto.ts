import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(120),
  slug: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
