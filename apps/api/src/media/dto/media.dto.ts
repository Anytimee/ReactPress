import { z } from 'zod';

export const listMediaSchema = z.object({
  q: z.string().max(120).optional(),
  type: z.enum(['image', 'other']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateMediaSchema = z.object({
  alt: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  title: z.string().max(300).nullable().optional(),
});

export type ListMediaInput = z.infer<typeof listMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
