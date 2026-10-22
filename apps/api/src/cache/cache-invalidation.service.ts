import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service.js';

/**
 * Invalidasi cache. Dipanggil setiap kali konten, template, atau settings berubah.
 */
@Injectable()
export class CacheInvalidationService {
  constructor(private readonly cache: CacheService) {}

  async invalidateArticle(_id: string, slug: string): Promise<void> {
    await this.cache.bump('articles');
    await this.cache.bump(`article:${slug}`);
    await this.cache.bump('sitemap');
  }

  async invalidateArticles(): Promise<void> {
    await this.cache.bump('articles');
    await this.cache.bump('sitemap');
  }

  async invalidatePage(slug: string): Promise<void> {
    await this.cache.bump('pages');
    await this.cache.bump(`page:${slug}`);
    await this.cache.bump('sitemap');
  }

  async invalidateSettings(): Promise<void> {
    await this.cache.bump('settings');
    await this.cache.bump('site');
    await this.cache.bump('sitemap');
  }

  async invalidateTemplate(slug: string): Promise<void> {
    await this.cache.bump(`template:${slug}`);
    await this.cache.bump('site');
  }

  async invalidateCategories(): Promise<void> {
    await this.cache.bump('categories');
    await this.cache.bump('sitemap');
  }

  async invalidateTags(): Promise<void> {
    await this.cache.bump('tags');
  }

  async invalidatePatterns(): Promise<void> {
    await this.cache.bump('patterns');
  }

  async invalidateAll(): Promise<void> {
    await this.cache.resetEpoch();
  }
}
