import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Category, Tag } from '@reactpress/types';
import { ArticleTerm } from './article-term.entity.js';
import { Category as CategoryEntity } from '../category/category.entity.js';
import { Tag as TagEntity } from '../tag/tag.entity.js';

export interface ArticleTerms {
  categories: Category[];
  tags: Tag[];
}

/**
 * Relasi artikel <-> kategori/tag disimpan di tabel article_terms
 * (relasi polimorf: satu termId bisa kategori atau tag).
 */
@Injectable()
export class ArticleTermsService {
  constructor(
    @InjectRepository(ArticleTerm) private readonly terms: Repository<ArticleTerm>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(TagEntity) private readonly tags: Repository<TagEntity>,
  ) {}

  async findForArticles(articleIds: string[]): Promise<Map<string, ArticleTerms>> {
    const result = new Map<string, ArticleTerms>();
    for (const id of articleIds) {
      result.set(id, { categories: [], tags: [] });
    }
    if (articleIds.length === 0) return result;

    const rows = await this.terms.find({ where: articleIds.map((articleId) => ({ articleId })) });
    if (rows.length === 0) return result;

    const categoryIds = rows.filter((row) => row.termType === 'category').map((row) => row.termId);
    const tagIds = rows.filter((row) => row.termType === 'tag').map((row) => row.termId);

    const [categoryEntities, tagEntities] = await Promise.all([
      categoryIds.length ? this.categories.findByIds(categoryIds) : Promise.resolve([]),
      tagIds.length ? this.tags.findByIds(tagIds) : Promise.resolve([]),
    ]);

    const categoryMap = new Map(categoryEntities.map((entity) => [entity.id, entity]));
    const tagMap = new Map(tagEntities.map((entity) => [entity.id, entity]));

    for (const row of rows) {
      const entry = result.get(row.articleId);
      if (!entry) continue;

      if (row.termType === 'category') {
        const entity = categoryMap.get(row.termId);
        if (entity) {
          entry.categories.push({
            id: entity.id,
            name: entity.name,
            slug: entity.slug,
            description: entity.description,
            parentId: entity.parentId,
          });
        }
      } else {
        const entity = tagMap.get(row.termId);
        if (entity) {
          entry.tags.push({ id: entity.id, name: entity.name, slug: entity.slug });
        }
      }
    }

    return result;
  }

  async replace(articleId: string, categoryIds: string[], tagIds: string[]): Promise<void> {
    await this.terms.delete({ articleId });
    const rows: ArticleTerm[] = [
      ...categoryIds.map((termId) =>
        this.terms.create({ articleId, termId, termType: 'category' as const }),
      ),
      ...tagIds.map((termId) =>
        this.terms.create({ articleId, termId, termType: 'tag' as const }),
      ),
    ];
    if (rows.length > 0) {
      await this.terms.save(rows);
    }
  }

  async findArticleIdsByCategory(categoryId: string): Promise<string[]> {
    const rows = await this.terms.find({ where: { termId: categoryId, termType: 'category' } });
    return rows.map((row) => row.articleId);
  }

  async findArticleIdsByTag(tagId: string): Promise<string[]> {
    const rows = await this.terms.find({ where: { termId: tagId, termType: 'tag' } });
    return rows.map((row) => row.articleId);
  }
}
