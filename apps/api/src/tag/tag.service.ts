import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Tag } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { slugify, uniqueSlug } from '../common/utils/slug.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { Tag as TagEntity } from './tag.entity.js';
import { ArticleTerm } from '../article/article-term.entity.js';
import type { CreateTagInput, UpdateTagInput } from './dto/tag.dto.js';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity) private readonly tags: Repository<TagEntity>,
    @InjectRepository(ArticleTerm) private readonly terms: Repository<ArticleTerm>,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private toDto(entity: TagEntity, articleCount = 0): Tag {
    return { id: entity.id, name: entity.name, slug: entity.slug, articleCount };
  }

  async list(): Promise<Tag[]> {
    const rows = await this.tags.find({ order: { name: 'ASC' } });
    const links = await this.terms.find({ where: { termType: 'tag' } });
    const counts = new Map<string, number>();
    for (const link of links) {
      counts.set(link.termId, (counts.get(link.termId) ?? 0) + 1);
    }
    return rows.map((row) => this.toDto(row, counts.get(row.id) ?? 0));
  }

  async findById(id: string): Promise<TagEntity> {
    const entity = await this.tags.findOne({ where: { id } });
    if (!entity) {
      throw apiError('Tag tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async findBySlug(slug: string): Promise<TagEntity | null> {
    return this.tags.findOne({ where: { slug } });
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.tags.findOne({ where: { slug } });
    return Boolean(existing && existing.id !== exceptId);
  }

  async create(input: CreateTagInput): Promise<Tag> {
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(input.name, (candidate) => this.slugExists(candidate));

    const saved = await this.tags.save(this.tags.create({ name: input.name, slug }));
    await this.cacheInvalidation.invalidateTags();
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag> {
    const entity = await this.findById(id);

    if (input.name !== undefined) entity.name = input.name;
    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (await this.slugExists(slug, entity.id)) {
        throw apiError('Slug sudah dipakai tag lain', HttpStatus.CONFLICT);
      }
      entity.slug = slug;
    }

    const saved = await this.tags.save(entity);
    await this.cacheInvalidation.invalidateTags();
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.terms.delete({ termId: id, termType: 'tag' });
    await this.tags.remove(entity);
    await this.cacheInvalidation.invalidateTags();
  }
}
