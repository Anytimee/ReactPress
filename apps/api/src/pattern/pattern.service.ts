import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Pattern } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { slugify, uniqueSlug } from '../common/utils/slug.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { Pattern as PatternEntity } from './pattern.entity.js';
import type { CreatePatternInput, UpdatePatternInput } from './dto/pattern.dto.js';

export interface PatternSummary {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
}

@Injectable()
export class PatternService {
  constructor(
    @InjectRepository(PatternEntity) private readonly patterns: Repository<PatternEntity>,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private toDto(entity: PatternEntity): Pattern {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      category: entity.category,
      content: entity.content,
      thumbnailUrl: entity.thumbnailUrl,
      authorId: entity.authorId,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toSummary(entity: PatternEntity): PatternSummary {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      category: entity.category,
      thumbnailUrl: entity.thumbnailUrl,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  async list(): Promise<PatternSummary[]> {
    const rows = await this.patterns.find({ order: { updatedAt: 'DESC' } });
    return rows.map((row) => this.toSummary(row));
  }

  async findById(id: string): Promise<PatternEntity> {
    const entity = await this.patterns.findOne({ where: { id } });
    if (!entity) {
      throw apiError('Pattern tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.patterns.findOne({ where: { slug } });
    return Boolean(existing && existing.id !== exceptId);
  }

  async create(input: CreatePatternInput, authorId: string): Promise<Pattern> {
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(input.name, (candidate) => this.slugExists(candidate));

    const entity = this.patterns.create({
      name: input.name,
      slug,
      category: input.category ?? null,
      content: input.content,
      thumbnailUrl: input.thumbnailUrl ?? null,
      authorId,
    });

    const saved = await this.patterns.save(entity);
    await this.cacheInvalidation.invalidatePatterns();
    return this.toDto(saved);
  }

  async update(id: string, input: UpdatePatternInput): Promise<Pattern> {
    const entity = await this.findById(id);

    if (input.name !== undefined) entity.name = input.name;
    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (await this.slugExists(slug, entity.id)) {
        throw apiError('Slug sudah dipakai pattern lain', HttpStatus.CONFLICT);
      }
      entity.slug = slug;
    }
    if (input.category !== undefined) entity.category = input.category;
    if (input.content !== undefined) entity.content = input.content;
    if (input.thumbnailUrl !== undefined) entity.thumbnailUrl = input.thumbnailUrl;

    const saved = await this.patterns.save(entity);
    await this.cacheInvalidation.invalidatePatterns();
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.patterns.remove(entity);
    await this.cacheInvalidation.invalidatePatterns();
  }
}
