import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import type { Article, Paginated, User } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { slugify, uniqueSlug } from '../common/utils/slug.js';
import { createPreviewToken } from '../common/utils/preview-token.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { RevisionService } from '../revision/revision.service.js';
import { Article as ArticleEntity } from './article.entity.js';
import { ArticleTermsService } from './article-terms.service.js';
import type {
  CreateArticleInput,
  DuplicateInput,
  ListArticlesInput,
  SetTermsInput,
  UpdateArticleInput,
} from './dto/article.dto.js';
import type { AppConfig } from '../config/configuration.js';

const EDITOR_ROLES = ['super_admin', 'admin', 'editor'] as const;

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articles: Repository<ArticleEntity>,
    private readonly terms: ArticleTermsService,
    private readonly revisions: RevisionService,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly config: ConfigService,
  ) {}

  private get jwtSecret(): string {
    return this.config.getOrThrow<AppConfig['auth']>('auth').jwtSecret;
  }

  async list(query: ListArticlesInput): Promise<Paginated<Article>> {
    let articleIds: string[] | undefined;

    if (query.category) {
      articleIds = await this.terms.findArticleIdsByCategory(query.category);
    } else if (query.tag) {
      articleIds = await this.terms.findArticleIdsByTag(query.tag);
    }

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.authorId) where.authorId = query.authorId;
    if (query.q) where.title = ILike(`%${query.q}%`);
    if (articleIds) where.id = In(articleIds.length > 0 ? articleIds : ['00000000-0000-0000-0000-000000000000']);

    const [rows, total] = await this.articles.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      relations: { author: true },
    });

    const termMap = await this.terms.findForArticles(rows.map((row) => row.id));
    const data = await Promise.all(
      rows.map((row) => this.toDto(row, termMap.get(row.id))),
    );

    return {
      data,
      total,
      page: query.page,
      perPage: query.perPage,
    };
  }

  async findById(id: string): Promise<ArticleEntity> {
    const article = await this.articles.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!article) {
      throw apiError('Artikel tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return article;
  }

  async findBySlug(slug: string): Promise<ArticleEntity | null> {
    return this.articles.findOne({ where: { slug }, relations: { author: true } });
  }

  /** Query artikel terbit — dipakai endpoint publik. */
  async findPublished(options: {
    articleIds?: string[];
    search?: string;
    page: number;
    perPage: number;
  }): Promise<{ rows: ArticleEntity[]; total: number }> {
    const where: Record<string, unknown> = { status: 'published' };

    if (options.articleIds) {
      where.id =
        options.articleIds.length > 0
          ? options.articleIds
          : ['00000000-0000-0000-0000-000000000000'];
    }
    if (options.search) {
      where.title = ILike(`%${options.search}%`);
    }

    const [rows, total] = await this.articles.findAndCount({
      where,
      order: { publishedAt: 'DESC' },
      skip: (options.page - 1) * options.perPage,
      take: options.perPage,
      relations: { author: true },
    });

    return { rows, total };
  }

  async publishedSlugs(): Promise<string[]> {
    const rows = await this.articles.find({ where: { status: 'published' }, select: { slug: true } });
    return rows.map((row) => row.slug);
  }

  async recentPublished(limit = 20): Promise<ArticleEntity[]> {
    return this.articles.find({
      where: { status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: { author: true },
    });
  }

  async toDto(entity: ArticleEntity, terms?: { categories: Article['categories']; tags: Article['tags'] }): Promise<Article> {
    const termMap = terms ?? (await this.terms.findForArticles([entity.id])).get(entity.id);

    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      content: entity.content,
      excerpt: entity.excerpt,
      status: entity.status,
      seo: entity.seo,
      authorId: entity.authorId,
      author: entity.author
        ? {
            id: entity.author.id,
            email: entity.author.email,
            name: entity.author.name,
            role: entity.author.role,
            createdAt: entity.author.createdAt.toISOString(),
            updatedAt: entity.author.updatedAt.toISOString(),
          }
        : undefined,
      templateSlug: entity.templateSlug,
      scheduledAt: entity.scheduledAt ? entity.scheduledAt.toISOString() : null,
      publishedAt: entity.publishedAt ? entity.publishedAt.toISOString() : null,
      trashedAt: entity.trashedAt ? entity.trashedAt.toISOString() : null,
      categories: termMap?.categories ?? [],
      tags: termMap?.tags ?? [],
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private assertCanEdit(actor: User, article: ArticleEntity): void {
    if ((EDITOR_ROLES as readonly string[]).includes(actor.role)) return;
    if (article.authorId === actor.id) return;
    throw apiError('Anda tidak boleh mengubah konten ini', HttpStatus.FORBIDDEN);
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.articles.findOne({ where: { slug } });
    return Boolean(existing && existing.id !== exceptId);
  }

  async create(input: CreateArticleInput, actor: User): Promise<Article> {
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(input.title, (candidate) => this.slugExists(candidate));

    const article = this.articles.create({
      title: input.title,
      slug,
      content: input.content ?? { version: 1, blocks: [] },
      excerpt: input.excerpt ?? '',
      status: input.status ?? 'draft',
      seo: input.seo ?? null,
      authorId: actor.id,
      templateSlug: input.templateSlug ?? null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      publishedAt: null,
      trashedAt: null,
    });

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticles();
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateArticleInput, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    if (input.title !== undefined) article.title = input.title;
    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (await this.slugExists(slug, article.id)) {
        throw apiError('Slug sudah dipakai artikel lain', HttpStatus.CONFLICT);
      }
      article.slug = slug;
    }
    if (input.content !== undefined) article.content = input.content;
    if (input.excerpt !== undefined) article.excerpt = input.excerpt;
    if (input.seo !== undefined) article.seo = input.seo;
    if (input.templateSlug !== undefined) article.templateSlug = input.templateSlug;
    if (input.scheduledAt !== undefined) {
      article.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    }
    if (input.status !== undefined && input.status !== article.status) {
      if (input.status === 'published') {
        await this.applyPublish(article, actor);
      } else {
        article.status = input.status;
        if (input.status === 'trash') {
          article.trashedAt = new Date();
        }
      }
    }

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  private async applyPublish(article: ArticleEntity, actor: User): Promise<void> {
    await this.revisions.snapshot({
      contentType: 'article',
      contentId: article.id,
      title: article.title,
      content: article.content,
      authorId: actor.id,
    });

    article.status = 'published';
    article.publishedAt = new Date();
    article.scheduledAt = null;
    article.trashedAt = null;
  }

  async publish(id: string, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);
    await this.applyPublish(article, actor);

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  async unpublish(id: string, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    article.status = 'draft';
    article.publishedAt = null;
    article.scheduledAt = null;

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  async schedule(id: string, scheduledAt: string, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      throw apiError('Tanggal jadwal tidak valid', HttpStatus.BAD_REQUEST);
    }

    article.status = 'scheduled';
    article.scheduledAt = date;
    article.publishedAt = null;

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  async trash(id: string, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    article.status = 'trash';
    article.trashedAt = new Date();

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  async restore(id: string, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    article.status = 'draft';
    article.trashedAt = null;

    const saved = await this.articles.save(article);
    await this.cacheInvalidation.invalidateArticle(saved.id, saved.slug);
    return this.toDto(saved);
  }

  async destroy(id: string, actor: User): Promise<void> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    await this.terms.replace(article.id, [], []);
    await this.articles.remove(article);
    await this.cacheInvalidation.invalidateArticle(article.id, article.slug);
  }

  async duplicate(id: string, input: DuplicateInput, actor: User): Promise<Article> {
    const source = await this.findById(id);

    const title = input.title ?? `${source.title} (salinan)`;
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(title, (candidate) => this.slugExists(candidate));

    const copy = this.articles.create({
      title,
      slug,
      content: source.content,
      excerpt: source.excerpt,
      status: 'draft',
      seo: source.seo,
      authorId: actor.id,
      templateSlug: source.templateSlug,
      scheduledAt: null,
      publishedAt: null,
      trashedAt: null,
    });

    const saved = await this.articles.save(copy);

    const termMap = await this.terms.findForArticles([source.id]);
    const sourceTerms = termMap.get(source.id);
    if (sourceTerms) {
      await this.terms.replace(
        saved.id,
        sourceTerms.categories.map((category) => category.id),
        sourceTerms.tags.map((tag) => tag.id),
      );
    }

    await this.cacheInvalidation.invalidateArticles();
    return this.toDto(saved);
  }

  async setTerms(id: string, input: SetTermsInput, actor: User): Promise<Article> {
    const article = await this.findById(id);
    this.assertCanEdit(actor, article);

    await this.terms.replace(article.id, input.categoryIds, input.tagIds);
    await this.cacheInvalidation.invalidateArticle(article.id, article.slug);
    return this.toDto(article);
  }

  createPreviewTokenFor(id: string): string {
    return createPreviewToken({ id, type: 'article' }, this.jwtSecret);
  }
}
