import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Article,
  Category,
  Page,
  PublicSiteInfo,
  Tag,
  TemplateLayout,
} from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { verifyPreviewToken } from '../common/utils/preview-token.js';
import { CacheService } from '../cache/cache.service.js';
import { ArticleService } from '../article/article.service.js';
import { ArticleTermsService } from '../article/article-terms.service.js';
import { PageService } from '../page/page.service.js';
import { CategoryService } from '../category/category.service.js';
import { TagService } from '../tag/tag.service.js';
import { PatternService } from '../pattern/pattern.service.js';
import { TemplateService } from '../template/template.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { MediaService } from '../media/media.service.js';
import type { AppConfig } from '../config/configuration.js';

export interface PublicListQuery {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  q?: string;
}

export interface PublicListResult {
  data: Article[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

@Injectable()
export class PublicService {
  constructor(
    private readonly articles: ArticleService,
    private readonly terms: ArticleTermsService,
    private readonly pages: PageService,
    private readonly categories: CategoryService,
    private readonly tags: TagService,
    private readonly patterns: PatternService,
    private readonly templates: TemplateService,
    private readonly settings: SettingsService,
    private readonly media: MediaService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {}

  private get webUrl(): string {
    return this.config.getOrThrow<AppConfig['urls']>('urls').web.replace(/\/$/, '');
  }

  async listArticles(query: PublicListQuery): Promise<PublicListResult> {
    const page = query.page ?? 1;
    const settings = await this.settings.getSettings();
    const perPage = query.perPage ?? settings.postsPerPage;

    const key = JSON.stringify({
      page,
      perPage,
      category: query.category,
      tag: query.tag,
      q: query.q,
    });

    return this.cache.wrap('articles', `list:${key}`, async () => {
      let articleIds: string[] | undefined;
      if (query.category) {
        const category = await this.categories.findBySlug(query.category);
        articleIds = category
          ? await this.terms.findArticleIdsByCategory(category.id)
          : ['00000000-0000-0000-0000-000000000000'];
      } else if (query.tag) {
        const tag = await this.tags.findBySlug(query.tag);
        articleIds = tag
          ? await this.terms.findArticleIdsByTag(tag.id)
          : ['00000000-0000-0000-0000-000000000000'];
      }

      const { rows, total } = await this.articles.findPublished({
        articleIds,
        search: query.q,
        page,
        perPage,
      });

      const termMap = await this.terms.findForArticles(rows.map((row) => row.id));
      const data = await Promise.all(
        rows.map((row) => this.articles.toDto(row, termMap.get(row.id))),
      );

      return {
        data,
        total,
        page,
        perPage,
        pages: Math.max(1, Math.ceil(total / perPage)),
      };
    });
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return this.cache.wrap('articles', `by-slug:${slug}`, async () => {
      const entity = await this.articles.findBySlug(slug);
      if (!entity || entity.status !== 'published') return null;
      return this.articles.toDto(entity);
    });
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    return this.cache.wrap('pages', `by-slug:${slug}`, async () => {
      const entity = await this.pages.findBySlug(slug);
      if (!entity || entity.status !== 'published') return null;
      return this.pages.toDto(entity);
    });
  }

  async listCategories(): Promise<Category[]> {
    return this.cache.wrap('categories', 'all', async () => this.categories.list());
  }

  async listTags(): Promise<Tag[]> {
    return this.cache.wrap('tags', 'all', async () => this.tags.list());
  }

  async listPatterns(): Promise<Awaited<ReturnType<PatternService['list']>>> {
    return this.cache.wrap('patterns', 'all', async () => this.patterns.list());
  }

  async getTemplate(slug: string): Promise<TemplateLayout | null> {
    return this.cache.wrap(`template:${slug}`, 'layout', async () => {
      try {
        const entity = await this.templates.findBySlug(slug);
        return {
          id: entity.id,
          slug: entity.slug,
          title: entity.title,
          content: entity.content,
          updatedAt: entity.updatedAt.toISOString(),
        };
      } catch {
        return null;
      }
    });
  }

  async getGlobalStyles(): Promise<PublicSiteInfo['globalStyles']> {
    return this.cache.wrap('settings', 'global-styles', async () => {
      const settings = await this.settings.getSettings();
      return settings.globalStyles;
    });
  }

  async getSite(): Promise<PublicSiteInfo> {
    return this.cache.wrap('site', 'info', async () =>
      this.settings.getPublicSite((mediaId) => this.media.urlFor(mediaId)),
    );
  }

  async getPreview(token: string): Promise<{ type: 'article' | 'page'; content: Article | Page }> {
    const payload = verifyPreviewToken(token, this.config.getOrThrow<AppConfig['auth']>('auth').jwtSecret);
    if (!payload) {
      throw apiError('Token preview tidak valid atau kedaluwarsa', 401);
    }

    if (payload.type === 'article') {
      const entity = await this.articles.findById(payload.id);
      return { type: 'article', content: await this.articles.toDto(entity) };
    }

    const entity = await this.pages.findById(payload.id);
    return { type: 'page', content: this.pages.toDto(entity) };
  }

  async publishedSlugs(): Promise<{ articles: string[]; pages: string[] }> {
    const [articleSlugs, pageSlugs] = await Promise.all([
      this.articles.publishedSlugs(),
      this.pages.publishedSlugs(),
    ]);
    return { articles: articleSlugs, pages: pageSlugs };
  }

  async recentPublished(limit = 20): Promise<Article[]> {
    const rows = await this.articles.recentPublished(limit);
    const termMap = await this.terms.findForArticles(rows.map((row) => row.id));
    return Promise.all(rows.map((row) => this.articles.toDto(row, termMap.get(row.id))));
  }

  get siteUrl(): string {
    return this.webUrl;
  }
}
