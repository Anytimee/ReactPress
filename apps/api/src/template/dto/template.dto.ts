import { z } from 'zod';
import { blockDocumentSchema } from '@reactpress/blocks/schema';
import { TEMPLATE_SLUGS } from '@reactpress/types';

export const createTemplateSchema = z.object({
  slug: z.enum(TEMPLATE_SLUGS),
  title: z.string().max(150).optional(),
  content: blockDocumentSchema,
});

export const updateTemplateSchema = z.object({
  title: z.string().max(150).optional(),
  content: blockDocumentSchema.optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
