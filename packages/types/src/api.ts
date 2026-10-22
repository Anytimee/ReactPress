import type {
  Article,
  Category,
  ContentRevision,
  Media,
  Page,
  Pattern,
  Settings,
  Tag,
  TemplateLayout,
  User,
} from './domain.js';

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: User['role'];
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: User['role'];
}

export interface UpsertSettingsRequest {
  siteName?: string;
  tagline?: string;
  logoMediaId?: string | null;
  faviconMediaId?: string | null;
  permalinkStructure?: Settings['permalinkStructure'];
  postsPerPage?: number;
  homepageMode?: Settings['homepageMode'];
  homepagePageId?: string | null;
  seoTitleTemplate?: string;
  seoDefaultDescription?: string;
  seoOgImageMediaId?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFromEmail?: string | null;
  smtpFromName?: string | null;
  smtpSecure?: boolean;
  globalStyles?: Partial<Settings['globalStyles']>;
}

export interface UpsertArticleRequest {
  title?: string;
  slug?: string;
  content?: Article['content'];
  excerpt?: string;
  status?: Article['status'];
  seo?: Article['seo'];
  templateSlug?: string | null;
  scheduledAt?: string | null;
}

export interface UpsertPageRequest {
  title?: string;
  slug?: string;
  content?: Page['content'];
  excerpt?: string;
  status?: Page['status'];
  isTemplate?: boolean;
  templateSlug?: string | null;
  seo?: Page['seo'];
  scheduledAt?: string | null;
}

export interface SetTermsRequest {
  categoryIds: string[];
  tagIds: string[];
}

export interface ScheduleRequest {
  scheduledAt: string;
}

export interface DuplicateRequest {
  title?: string;
  slug?: string;
}

export interface PublicSiteInfo {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  permalinkStructure: Settings['permalinkStructure'];
  postsPerPage: number;
  homepageMode: Settings['homepageMode'];
  homepagePageId: string | null;
  seoTitleTemplate: string;
  seoDefaultDescription: string;
  ogImageUrl: string | null;
  globalStyles: Settings['globalStyles'];
}

export interface PublicArticleList {
  data: Article[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

export interface PublicTemplate {
  slug: string;
  title: string;
  content: TemplateLayout['content'];
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
  cache: 'up' | 'down' | 'memory';
  uptime: number;
  version: string;
}

export interface RevisionDiff {
  changed: boolean;
  titleChanged: boolean;
  titleBefore: string | null;
  titleAfter: string | null;
  contentChanged: boolean;
  blockCountBefore: number;
  blockCountAfter: number;
  changedBlockTypes: string[];
}

export type {
  Article,
  Category,
  ContentRevision,
  Media,
  Page,
  Pattern,
  Settings,
  Tag,
  TemplateLayout,
  User,
};
