import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(120),
  slug: z.string().min(1).max(150).optional(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
