import { z } from 'zod';
import { blockDocumentSchema } from '@reactpress/blocks/schema';

export const createPatternSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(150),
  slug: z.string().min(1).max(180).optional(),
  category: z.string().max(100).nullable().optional(),
  content: blockDocumentSchema,
  thumbnailUrl: z.string().max(500).nullable().optional(),
});

export const updatePatternSchema = createPatternSchema.partial();

export type CreatePatternInput = z.infer<typeof createPatternSchema>;
export type UpdatePatternInput = z.infer<typeof updatePatternSchema>;
