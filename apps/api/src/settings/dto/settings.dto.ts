import { z } from 'zod';
import { HOMEPAGE_MODES, PERMALINK_STRUCTURES } from '@reactpress/types';

export const globalStylesSchema = z.object({
  accent: z.string().min(1).max(32),
  background: z.string().min(1).max(32),
  ink: z.string().min(1).max(32),
  muted: z.string().min(1).max(32),
  fontFamily: z.string().min(1).max(80),
  fontSize: z.number().int().min(12).max(24),
  radius: z.number().int().min(0).max(24),
  spacing: z.number().int().min(2).max(12),
  containerWidth: z.number().int().min(480).max(1600),
});

export const updateSettingsSchema = z.object({
  siteName: z.string().min(1).max(150).optional(),
  tagline: z.string().max(300).optional(),
  logoMediaId: z.string().uuid().nullable().optional(),
  faviconMediaId: z.string().uuid().nullable().optional(),
  permalinkStructure: z.enum(PERMALINK_STRUCTURES).optional(),
  postsPerPage: z.number().int().min(1).max(100).optional(),
  homepageMode: z.enum(HOMEPAGE_MODES).optional(),
  homepagePageId: z.string().uuid().nullable().optional(),
  seoTitleTemplate: z.string().max(200).optional(),
  seoDefaultDescription: z.string().max(500).optional(),
  seoOgImageMediaId: z.string().uuid().nullable().optional(),
  smtpHost: z.string().max(200).nullable().optional(),
  smtpPort: z.number().int().min(1).max(65535).nullable().optional(),
  smtpUser: z.string().max(200).nullable().optional(),
  smtpPass: z.string().max(300).nullable().optional(),
  smtpFromEmail: z.string().email().max(200).nullable().optional(),
  smtpFromName: z.string().max(200).nullable().optional(),
  smtpSecure: z.boolean().optional(),
  globalStyles: globalStylesSchema.partial().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const smtpTestSchema = z.object({
  to: z.string().email(),
});
