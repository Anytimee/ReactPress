import { z } from 'zod';
import { CONTENT_STATUSES } from '@reactpress/types';

export const seoSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  canonical: z.string().max(500).optional(),
  noindex: z.boolean().optional(),
  ogImage: z.string().max(500).optional(),
});

const contentSchema = z.object({
  version: z.number().optional(),
  blocks: z.array(z.any()).optional(),
  puck: z.any().optional(),
}).passthrough();

export const listPagesSchema = z.object({
  status: z.enum(CONTENT_STATUSES).optional(),
  q: z.string().max(120).optional(),
  isTemplate: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export const createPageSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).optional(),
  content: contentSchema.optional(),
  excerpt: z.string().max(1000).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  isTemplate: z.boolean().optional(),
  templateSlug: z.string().max(120).nullable().optional(),
  seo: seoSchema.nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const updatePageSchema = createPageSchema.partial();

export const setTemplateSchema = z.object({
  templateSlug: z.string().min(1).max(120),
});

export type ListPagesInput = z.infer<typeof listPagesSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type SetTemplateInput = z.infer<typeof setTemplateSchema>;
