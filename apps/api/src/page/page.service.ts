import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { Page, Paginated, User } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { slugify, uniqueSlug } from '../common/utils/slug.js';
import { createPreviewToken } from '../common/utils/preview-token.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { RevisionService } from '../revision/revision.service.js';
import { Page as PageEntity } from './page.entity.js';
import type {
  CreatePageInput,
  ListPagesInput,
  UpdatePageInput,
} from './dto/page.dto.js';
import type { AppConfig } from '../config/configuration.js';

const EDITOR_ROLES = ['super_admin', 'admin', 'editor'] as const;

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity) private readonly pages: Repository<PageEntity>,
    private readonly revisions: RevisionService,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly config: ConfigService,
  ) {}

  private get jwtSecret(): string {
    return this.config.getOrThrow<AppConfig['auth']>('auth').jwtSecret;
  }

  async list(query: ListPagesInput): Promise<Paginated<Page>> {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.isTemplate !== undefined) where.isTemplate = query.isTemplate;
    if (query.q) where.title = ILike(`%${query.q}%`);

    const [rows, total] = await this.pages.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      relations: { author: true },
    });

    return {
      data: rows.map((row) => this.toDto(row)),
      total,
      page: query.page,
      perPage: query.perPage,
    };
  }

  async findById(id: string): Promise<PageEntity> {
    const page = await this.pages.findOne({ where: { id }, relations: { author: true } });
    if (!page) {
      throw apiError('Halaman tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return page;
  }

  async findBySlug(slug: string, includeTemplates = false): Promise<PageEntity | null> {
    const page = await this.pages.findOne({ where: { slug }, relations: { author: true } });
    if (!page) return null;
    if (page.isTemplate && !includeTemplates) return null;
    return page;
  }

  async publishedSlugs(): Promise<string[]> {
    const rows = await this.pages.find({ where: { status: 'published' }, select: { slug: true } });
    return rows.map((row) => row.slug);
  }

  toDto(entity: PageEntity): Page {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      content: entity.content,
      excerpt: entity.excerpt,
      status: entity.status,
      isTemplate: entity.isTemplate,
      templateSlug: entity.templateSlug,
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
      scheduledAt: entity.scheduledAt ? entity.scheduledAt.toISOString() : null,
      publishedAt: entity.publishedAt ? entity.publishedAt.toISOString() : null,
      trashedAt: entity.trashedAt ? entity.trashedAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private assertCanEdit(actor: User, page: PageEntity): void {
    if ((EDITOR_ROLES as readonly string[]).includes(actor.role)) return;
    if (page.authorId === actor.id) return;
    throw apiError('Anda tidak boleh mengubah konten ini', HttpStatus.FORBIDDEN);
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.pages.findOne({ where: { slug } });
    return Boolean(existing && existing.id !== exceptId);
  }

  async create(input: CreatePageInput, actor: User): Promise<Page> {
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(input.title, (candidate) => this.slugExists(candidate));

    const page = this.pages.create({
      title: input.title,
      slug,
      content: (input.content as any) ?? { version: 1, blocks: [] },
      excerpt: input.excerpt ?? '',
      status: input.status ?? 'draft',
      isTemplate: input.isTemplate ?? false,
      templateSlug: input.templateSlug ?? null,
      seo: input.seo ?? null,
      authorId: actor.id,
      publishedAt: null,
      trashedAt: null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    });

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async update(id: string, input: UpdatePageInput, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);

    if (input.title !== undefined) page.title = input.title;
    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (await this.slugExists(slug, page.id)) {
        throw apiError('Slug sudah dipakai halaman lain', HttpStatus.CONFLICT);
      }
      page.slug = slug;
    }
    if (input.content !== undefined) page.content = input.content as any;
    if (input.excerpt !== undefined) page.excerpt = input.excerpt;
    if (input.seo !== undefined) page.seo = input.seo;
    if (input.templateSlug !== undefined) page.templateSlug = input.templateSlug;
    if (input.isTemplate !== undefined) page.isTemplate = input.isTemplate;
    if (input.scheduledAt !== undefined) {
      page.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    }
    if (input.status !== undefined && input.status !== page.status) {
      if (input.status === 'published') {
        await this.applyPublish(page, actor);
      } else {
        page.status = input.status;
        if (input.status === 'trash') page.trashedAt = new Date();
      }
    }

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  private async applyPublish(page: PageEntity, actor: User): Promise<void> {
    await this.revisions.snapshot({
      contentType: 'page',
      contentId: page.id,
      title: page.title,
      content: page.content,
      authorId: actor.id,
    });

    page.status = 'published';
    page.publishedAt = new Date();
    page.scheduledAt = null;
    page.trashedAt = null;
  }

  async publish(id: string, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);
    await this.applyPublish(page, actor);

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async unpublish(id: string, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);

    page.status = 'draft';
    page.publishedAt = null;
    page.scheduledAt = null;

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async trash(id: string, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);

    page.status = 'trash';
    page.trashedAt = new Date();

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async restore(id: string, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);

    page.status = 'draft';
    page.trashedAt = null;

    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async destroy(id: string, actor: User): Promise<void> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);
    await this.pages.remove(page);
    await this.cacheInvalidation.invalidatePage(page.slug);
  }

  async setTemplate(id: string, templateSlug: string | null, actor: User): Promise<Page> {
    const page = await this.findById(id);
    this.assertCanEdit(actor, page);

    page.templateSlug = templateSlug;
    const saved = await this.pages.save(page);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  async duplicate(id: string, actor: User): Promise<Page> {
    const source = await this.findById(id);
    const title = `${source.title} (salinan)`;
    const slug = await uniqueSlug(title, (candidate) => this.slugExists(candidate));

    const copy = this.pages.create({
      title,
      slug,
      content: source.content,
      excerpt: source.excerpt,
      status: 'draft',
      isTemplate: source.isTemplate,
      templateSlug: source.templateSlug,
      seo: source.seo,
      authorId: actor.id,
    });

    const saved = await this.pages.save(copy);
    await this.cacheInvalidation.invalidatePage(saved.slug);
    return this.toDto(saved);
  }

  createPreviewTokenFor(id: string): string {
    return createPreviewToken({ id, type: 'page' }, this.jwtSecret);
  }
}
