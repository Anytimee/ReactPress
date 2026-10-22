import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Category } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { slugify, uniqueSlug } from '../common/utils/slug.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { Category as CategoryEntity } from './category.entity.js';
import { ArticleTerm } from '../article/article-term.entity.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './dto/category.dto.js';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ArticleTerm) private readonly terms: Repository<ArticleTerm>,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private toDto(entity: CategoryEntity, articleCount = 0): Category {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      parentId: entity.parentId,
      articleCount,
    };
  }

  async list(): Promise<Category[]> {
    const rows = await this.categories.find({ order: { name: 'ASC' } });
    const counts = await this.countArticles();
    return rows.map((row) => this.toDto(row, counts.get(row.id) ?? 0));
  }

  private async countArticles(): Promise<Map<string, number>> {
    const links = await this.terms.find({ where: { termType: 'category' } });
    const counts = new Map<string, number>();
    for (const link of links) {
      counts.set(link.termId, (counts.get(link.termId) ?? 0) + 1);
    }
    return counts;
  }

  async findById(id: string): Promise<CategoryEntity> {
    const entity = await this.categories.findOne({ where: { id } });
    if (!entity) {
      throw apiError('Kategori tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categories.findOne({ where: { slug } });
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.categories.findOne({ where: { slug } });
    return Boolean(existing && existing.id !== exceptId);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug
      ? await uniqueSlug(input.slug, (candidate) => this.slugExists(candidate))
      : await uniqueSlug(input.name, (candidate) => this.slugExists(candidate));

    const entity = this.categories.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
    });

    const saved = await this.categories.save(entity);
    await this.cacheInvalidation.invalidateCategories();
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const entity = await this.findById(id);

    if (input.name !== undefined) entity.name = input.name;
    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (await this.slugExists(slug, entity.id)) {
        throw apiError('Slug sudah dipakai kategori lain', HttpStatus.CONFLICT);
      }
      entity.slug = slug;
    }
    if (input.description !== undefined) entity.description = input.description;
    if (input.parentId !== undefined) {
      if (input.parentId === entity.id) {
        throw apiError('Kategori tidak bisa jadi induk dirinya sendiri', HttpStatus.BAD_REQUEST);
      }
      entity.parentId = input.parentId;
    }

    const saved = await this.categories.save(entity);
    await this.cacheInvalidation.invalidateCategories();
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.terms.delete({ termId: id, termType: 'category' });
    await this.categories.remove(entity);
    await this.cacheInvalidation.invalidateCategories();
  }
}
