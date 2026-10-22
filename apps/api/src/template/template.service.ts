import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TEMPLATE_SLUGS, type TemplateLayout, type TemplateSlug } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { TemplateLayout as TemplateEntity } from './template-layout.entity.js';
import type { CreateTemplateInput, UpdateTemplateInput } from './dto/template.dto.js';

const DEFAULT_TITLES: Record<TemplateSlug, string> = {
  header: 'Header',
  footer: 'Footer',
  '404': 'Halaman 404',
};

const DEFAULT_CONTENT: Record<TemplateSlug, { version: 1; blocks: [] }> = {
  header: { version: 1, blocks: [] },
  footer: { version: 1, blocks: [] },
  '404': { version: 1, blocks: [] },
};

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateEntity) private readonly templates: Repository<TemplateEntity>,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private toDto(entity: TemplateEntity): TemplateLayout {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      content: entity.content,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  /** Pastikan header, footer, dan 404 selalu ada. */
  async ensureDefaults(): Promise<void> {
    for (const slug of TEMPLATE_SLUGS) {
      const existing = await this.templates.findOne({ where: { slug } });
      if (existing) continue;
      await this.templates.save(
        this.templates.create({
          slug,
          title: DEFAULT_TITLES[slug],
          content: DEFAULT_CONTENT[slug],
        }),
      );
    }
  }

  async listGrouped(): Promise<Record<TemplateSlug, TemplateLayout | null>> {
    await this.ensureDefaults();
    const rows = await this.templates.find();

    const grouped: Record<TemplateSlug, TemplateLayout | null> = {
      header: null,
      footer: null,
      '404': null,
    };

    for (const row of rows) {
      grouped[row.slug] = this.toDto(row);
    }
    return grouped;
  }

  async findBySlug(slug: string): Promise<TemplateEntity> {
    await this.ensureDefaults();
    const entity = await this.templates.findOne({ where: { slug: slug as TemplateSlug } });
    if (!entity) {
      throw apiError('Template tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async findById(id: string): Promise<TemplateEntity> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw apiError('Template tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async create(input: CreateTemplateInput): Promise<TemplateLayout> {
    await this.ensureDefaults();
    const existing = await this.templates.findOne({ where: { slug: input.slug } });

    if (existing) {
      existing.title = input.title ?? existing.title;
      existing.content = input.content;
      const saved = await this.templates.save(existing);
      await this.cacheInvalidation.invalidateTemplate(input.slug);
      return this.toDto(saved);
    }

    const entity = this.templates.create({
      slug: input.slug,
      title: input.title ?? DEFAULT_TITLES[input.slug],
      content: input.content,
    });

    const saved = await this.templates.save(entity);
    await this.cacheInvalidation.invalidateTemplate(input.slug);
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateTemplateInput): Promise<TemplateLayout> {
    const entity = await this.findById(id);
    if (input.title !== undefined) entity.title = input.title;
    if (input.content !== undefined) entity.content = input.content;

    const saved = await this.templates.save(entity);
    await this.cacheInvalidation.invalidateTemplate(entity.slug);
    return this.toDto(saved);
  }

  /** Guard: header dan footer tidak boleh dihapus. */
  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (entity.slug === 'header' || entity.slug === 'footer') {
      throw apiError(
        'Template header dan footer wajib ada dan tidak bisa dihapus',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.templates.remove(entity);
    await this.cacheInvalidation.invalidateTemplate(entity.slug);
  }
}
