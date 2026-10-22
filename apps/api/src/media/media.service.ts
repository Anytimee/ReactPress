import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import DOMPurify from 'isomorphic-dompurify';
import type { Media, MediaUsage, Paginated } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { Media as MediaEntity } from './media.entity.js';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { Pattern } from '../pattern/pattern.entity.js';
import type { ListMediaInput, UpdateMediaInput } from './dto/media.dto.js';
import type { AppConfig } from '../config/configuration.js';

const SVG_MIME = 'image/svg+xml';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity) private readonly media: Repository<MediaEntity>,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    @InjectRepository(Page) private readonly pages: Repository<Page>,
    @InjectRepository(Pattern) private readonly patterns: Repository<Pattern>,
    private readonly config: ConfigService,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private get storage(): AppConfig['storage'] {
    return this.config.getOrThrow<AppConfig['storage']>('storage');
  }

  private get uploadDir(): string {
    return resolve(process.cwd(), this.storage.uploadDir);
  }

  private publicUrl(filename: string): string {
    return `${this.storage.publicPath.replace(/\/$/, '')}/${filename}`;
  }

  async ensureUploadDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async list(query: ListMediaInput): Promise<Paginated<Media>> {
    const where: Record<string, unknown> = {};
    if (query.q) {
      where.originalName = ILike(`%${query.q}%`);
    }
    if (query.type === 'image') {
      where.mime = ILike('image/%');
    } else if (query.type === 'other') {
      where.mime = Not(ILike('image/%'));
    }

    const [rows, total] = await this.media.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    });

    return {
      data: rows.map((row) => this.toDto(row)),
      total,
      page: query.page,
      perPage: query.perPage,
    };
  }

  toDto(entity: MediaEntity): Media {
    return {
      id: entity.id,
      filename: entity.filename,
      originalName: entity.originalName,
      mime: entity.mime,
      size: entity.size,
      width: entity.width,
      height: entity.height,
      url: entity.url,
      thumbnailUrl: entity.thumbnailUrl,
      alt: entity.alt,
      caption: entity.caption,
      title: entity.title,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<MediaEntity> {
    const entity = await this.media.findOne({ where: { id } });
    if (!entity) {
      throw apiError('Media tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  async findByIds(ids: string[]): Promise<MediaEntity[]> {
    if (ids.length === 0) return [];
    return this.media.find({ where: ids.map((id) => ({ id })) });
  }

  async upload(file: Express.Multer.File): Promise<Media> {
    await this.ensureUploadDir();

    const isSvg = file.mimetype === SVG_MIME;
    const id = randomUUID();

    let filename: string;
    let mime: string;
    let width: number | null = null;
    let height: number | null = null;
    let thumbnailUrl: string | null = null;
    let buffer = file.buffer;

    if (isSvg) {
      const clean = DOMPurify.sanitize(file.buffer.toString('utf8'), {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ['script', 'foreignObject'],
        FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
      });
      buffer = Buffer.from(clean, 'utf8');
      filename = `${id}.svg`;
      mime = SVG_MIME;
    } else if (file.mimetype.startsWith('image/')) {
      filename = `${id}.webp`;
      mime = 'image/webp';

      const image = sharp(file.buffer, { failOn: 'none' }).rotate();
      const metadata = await image.metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;

      buffer = await image
        .resize({ width: this.storage.imageMaxWidth, withoutEnlargement: true })
        .webp({ quality: this.storage.imageQuality })
        .toBuffer();

      const thumbBuffer = await sharp(file.buffer, { failOn: 'none' })
        .rotate()
        .resize({ width: this.storage.thumbWidth, withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer();

      const thumbName = `${id}-thumb.webp`;
      await fs.writeFile(join(this.uploadDir, thumbName), thumbBuffer);
      thumbnailUrl = this.publicUrl(thumbName);
    } else {
      const extension = file.originalname.includes('.')
        ? `.${file.originalname.split('.').pop()?.toLowerCase() ?? 'bin'}`
        : '.bin';
      filename = `${id}${extension}`;
      mime = file.mimetype || 'application/octet-stream';
    }

    await fs.writeFile(join(this.uploadDir, filename), buffer);

    const entity = this.media.create({
      filename,
      originalName: file.originalname,
      mime,
      size: buffer.byteLength,
      width,
      height,
      url: this.publicUrl(filename),
      thumbnailUrl,
      alt: null,
      caption: null,
      title: null,
    });

    const saved = await this.media.save(entity);
    await this.cacheInvalidation.invalidateSettings();
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateMediaInput): Promise<Media> {
    const entity = await this.findById(id);
    if (input.alt !== undefined) entity.alt = input.alt;
    if (input.caption !== undefined) entity.caption = input.caption;
    if (input.title !== undefined) entity.title = input.title;

    const saved = await this.media.save(entity);
    return this.toDto(saved);
  }

  async usage(id: string): Promise<MediaUsage> {
    const entity = await this.findById(id);
    const pattern = `%${entity.id}%`;

    const [articleRows, pageRows, patternRows] = await Promise.all([
      this.articles.query(
        `SELECT id, title, slug FROM ${this.articles.metadata.tableName} WHERE content::text LIKE $1`,
        [pattern],
      ) as Promise<{ id: string; title: string; slug: string }[]>,
      this.pages.query(
        `SELECT id, title, slug FROM ${this.pages.metadata.tableName} WHERE content::text LIKE $1`,
        [pattern],
      ) as Promise<{ id: string; title: string; slug: string }[]>,
      this.patterns.query(
        `SELECT id, name, slug FROM ${this.patterns.metadata.tableName} WHERE content::text LIKE $1`,
        [pattern],
      ) as Promise<{ id: string; name: string; slug: string }[]>,
    ]);

    return {
      mediaId: entity.id,
      articles: articleRows,
      pages: pageRows,
      patterns: patternRows.map((row) => ({ id: row.id, name: row.name, slug: row.slug })),
      total: articleRows.length + pageRows.length + patternRows.length,
    };
  }

  async remove(id: string, force = false): Promise<void> {
    const entity = await this.findById(id);

    if (!force) {
      const usage = await this.usage(id);
      if (usage.total > 0) {
        throw apiError(
          'Media masih dipakai pada konten lain. Gunakan ?force=true untuk menghapusnya.',
          HttpStatus.CONFLICT,
          usage,
        );
      }
    }

    await fs.rm(join(this.uploadDir, entity.filename), { force: true });
    if (entity.thumbnailUrl) {
      const thumbName = entity.thumbnailUrl.split('/').pop();
      if (thumbName) {
        await fs.rm(join(this.uploadDir, thumbName), { force: true });
      }
    }

    await this.media.remove(entity);
    await this.cacheInvalidation.invalidateSettings();
  }

  async urlFor(mediaId: string | null): Promise<string | null> {
    if (!mediaId) return null;
    const entity = await this.media.findOne({ where: { id: mediaId } });
    return entity?.url ?? null;
  }
}
