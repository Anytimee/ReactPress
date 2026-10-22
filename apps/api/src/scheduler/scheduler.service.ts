import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { RevisionService } from '../revision/revision.service.js';
import type { AppConfig } from '../config/configuration.js';

/**
 * Cron publish: memindahkan artikel/halaman berstatus "scheduled" menjadi
 * "published" ketika waktu publikasinya tiba. Dijalankan tiap menit.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    @InjectRepository(Page) private readonly pages: Repository<Page>,
    private readonly revisions: RevisionService,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled(): Promise<void> {
    const now = new Date();

    const articles = await this.articles.find({
      where: { status: 'scheduled', scheduledAt: LessThanOrEqual(now) },
    });

    for (const article of articles) {
      try {
        await this.revisions.snapshot({
          contentType: 'article',
          contentId: article.id,
          title: article.title,
          content: article.content,
          authorId: article.authorId,
        });

        article.status = 'published';
        article.publishedAt = now;
        article.scheduledAt = null;
        await this.articles.save(article);
        await this.cacheInvalidation.invalidateArticle(article.id, article.slug);
        this.logger.log(`Artikel "${article.title}" dipublikasikan otomatis`);
      } catch (error) {
        this.logger.error(`Gagal mempublikasikan artikel ${article.id}: ${(error as Error).message}`);
      }
    }

    const pages = await this.pages.find({
      where: { status: 'scheduled', scheduledAt: LessThanOrEqual(now) },
    });

    for (const page of pages) {
      try {
        await this.revisions.snapshot({
          contentType: 'page',
          contentId: page.id,
          title: page.title,
          content: page.content,
          authorId: page.authorId,
        });

        page.status = 'published';
        page.publishedAt = now;
        page.scheduledAt = null;
        await this.pages.save(page);
        await this.cacheInvalidation.invalidatePage(page.slug);
        this.logger.log(`Halaman "${page.title}" dipublikasikan otomatis`);
      } catch (error) {
        this.logger.error(`Gagal mempublikasikan halaman ${page.id}: ${(error as Error).message}`);
      }
    }
  }

  get timezone(): string {
    return this.config.getOrThrow<AppConfig['app']>('app').timezone;
  }
}
