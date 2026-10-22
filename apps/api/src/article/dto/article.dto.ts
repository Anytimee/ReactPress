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

export const listArticlesSchema = z.object({
  status: z.enum(CONTENT_STATUSES).optional(),
  q: z.string().max(120).optional(),
  category: z.string().max(150).optional(),
  tag: z.string().max(150).optional(),
  authorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(300),
  slug: z.string().min(1).max(200).optional(),
  content: contentSchema.optional(),
  excerpt: z.string().max(1000).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  seo: seoSchema.nullable().optional(),
  templateSlug: z.string().max(120).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(200).optional(),
  content: contentSchema.optional(),
  excerpt: z.string().max(1000).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  seo: seoSchema.nullable().optional(),
  templateSlug: z.string().max(120).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export const setTermsSchema = z.object({
  categoryIds: z.array(z.string().uuid()).max(20).default([]),
  tagIds: z.array(z.string().uuid()).max(50).default([]),
});

export const duplicateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(200).optional(),
});

export type ListArticlesInput = z.infer<typeof listArticlesSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type SetTermsInput = z.infer<typeof setTermsSchema>;
export type DuplicateInput = z.infer<typeof duplicateSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
