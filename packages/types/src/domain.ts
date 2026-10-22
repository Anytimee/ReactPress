import type { BlockDocument } from './blocks.js';

export const USER_ROLES = ['super_admin', 'admin', 'editor', 'author'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CONTENT_STATUSES = ['draft', 'published', 'scheduled', 'trash'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_TYPES = ['article', 'page'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const TERM_TYPES = ['category', 'tag'] as const;
export type TermType = (typeof TERM_TYPES)[number];

export const PERMALINK_STRUCTURES = [
  '/%postname%',
  '/blog/%postname%',
  '/%year%/%monthnum%/%postname%',
] as const;
export type PermalinkStructure = (typeof PERMALINK_STRUCTURES)[number];

export const HOMEPAGE_MODES = ['latest', 'static'] as const;
export type HomepageMode = (typeof HOMEPAGE_MODES)[number];

export const TEMPLATE_SLUGS = ['header', 'footer', '404'] as const;
export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInfo {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  current: boolean;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: BlockDocument;
  excerpt: string;
  status: ContentStatus;
  seo: SeoMeta | null;
  authorId: string;
  author?: User;
  templateSlug: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  trashedAt: string | null;
  categories: Category[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: BlockDocument;
  excerpt: string;
  status: ContentStatus;
  isTemplate: boolean;
  templateSlug: string | null;
  seo: SeoMeta | null;
  authorId: string;
  author?: User;
  scheduledAt: string | null;
  publishedAt: string | null;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  thumbnailUrl: string | null;
  alt: string | null;
  caption: string | null;
  title: string | null;
  createdAt: string;
}

export interface MediaUsage {
  mediaId: string;
  articles: { id: string; title: string; slug: string }[];
  pages: { id: string; title: string; slug: string }[];
  patterns: { id: string; name: string; slug: string }[];
  total: number;
}

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  content: BlockDocument;
  thumbnailUrl: string | null;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalStyles {
  accent: string;
  background: string;
  ink: string;
  muted: string;
  fontFamily: string;
  fontSize: number;
  radius: number;
  spacing: number;
  containerWidth: number;
}

export interface Settings {
  id: string;
  siteName: string;
  tagline: string;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  permalinkStructure: PermalinkStructure;
  postsPerPage: number;
  homepageMode: HomepageMode;
  homepagePageId: string | null;
  seoTitleTemplate: string;
  seoDefaultDescription: string;
  seoOgImageMediaId: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
  smtpSecure: boolean;
  smtpPassSet: boolean;
  globalStyles: GlobalStyles;
  updatedAt: string;
}

export interface TemplateLayout {
  id: string;
  slug: TemplateSlug;
  title: string;
  content: BlockDocument;
  updatedAt: string;
}

export interface ContentRevision {
  id: string;
  contentType: ContentType;
  contentId: string;
  title: string;
  content: BlockDocument;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  createdAt: string;
}

export interface PreviewToken {
  token: string;
  contentType: ContentType;
  contentId: string;
  expiresAt: string;
}
