import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import { Readable } from 'node:stream';
import type { BlockDocument } from '@reactpress/types';
import { createBlockId } from '@reactpress/blocks/schema';
import { hashPassword } from '../common/utils/password.js';
import { User } from '../user/user.entity.js';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { Category } from '../category/category.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { Pattern } from '../pattern/pattern.entity.js';
import { ArticleTerm } from '../article/article-term.entity.js';
import { TemplateLayout } from '../template/template-layout.entity.js';
import { Media } from '../media/media.entity.js';
import { MediaService } from '../media/media.service.js';
import type { AppConfig } from '../config/configuration.js';

function block(
  type: string,
  attrs: Record<string, unknown> = {},
  innerBlocks: BlockDocument['blocks'] = [],
): BlockDocument['blocks'][number] {
  return { id: createBlockId(), type, attrs, innerBlocks, meta: { classes: [] } };
}

function document(blocks: BlockDocument['blocks']): BlockDocument {
  return { version: 1, blocks };
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    @InjectRepository(Page) private readonly pages: Repository<Page>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
    @InjectRepository(Pattern) private readonly patterns: Repository<Pattern>,
    @InjectRepository(ArticleTerm) private readonly articleTerms: Repository<ArticleTerm>,
    @InjectRepository(TemplateLayout) private readonly templates: Repository<TemplateLayout>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
    private readonly mediaService: MediaService,
    private readonly config: ConfigService,
  ) {}

  private get seedConfig(): AppConfig['seed'] {
    return this.config.getOrThrow<AppConfig['seed']>('seed');
  }

  async run(): Promise<void> {
    const admin = await this.ensureAdmin();
    if (!this.seedConfig.demoContent) return;
    await this.ensureDemoContent(admin);
  }

  private async ensureAdmin(): Promise<User> {
    const email = this.seedConfig.adminEmail.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });

    if (existing) return existing;

    const user = this.users.create({
      email,
      name: this.seedConfig.adminName,
      role: 'super_admin',
      password: await hashPassword(this.seedConfig.adminPassword),
    });

    const saved = await this.users.save(user);
    this.logger.log(`Seed: admin ${email} dibuat`);
    return saved;
  }

  private async ensureDemoContent(admin: User): Promise<void> {
    await this.ensureCategory();
    const tag = await this.ensureTag();
    const media = await this.ensureSampleMedia();
    await this.ensureTemplates();
    await this.ensureHelloPage(admin);
    await this.ensureSampleArticle(admin, media?.id ?? null, tag.id);
    await this.ensureHeroPattern(admin);
  }

  private async ensureCategory(): Promise<Category> {
    const existing = await this.categories.findOne({ where: { slug: 'umum' } });
    if (existing) return existing;

    const saved = await this.categories.save(
      this.categories.create({ name: 'Umum', slug: 'umum', description: 'Kategori bawaan ReactPress' }),
    );
    this.logger.log('Seed: kategori "Umum" dibuat');
    return saved;
  }

  private async ensureTag(): Promise<Tag> {
    const existing = await this.tags.findOne({ where: { slug: 'contoh' } });
    if (existing) return existing;

    const saved = await this.tags.save(this.tags.create({ name: 'contoh', slug: 'contoh' }));
    this.logger.log('Seed: tag "contoh" dibuat');
    return saved;
  }

  private async ensureSampleMedia(): Promise<Media | null> {
    const existing = await this.media.findOne({ where: { originalName: 'reactpress-sample.png' } });
    if (existing) return existing;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111111"/>
  <text x="60" y="330" font-family="Inter, sans-serif" font-size="64" fill="#fafaf9">ReactPress</text>
  <text x="60" y="390" font-family="Inter, sans-serif" font-size="28" fill="#e5e5e3">100% React — self-hosted CMS</text>
</svg>`;

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'reactpress-sample.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: buffer.byteLength,
      buffer,
      stream: new Readable(),
      destination: '',
      filename: 'reactpress-sample.png',
      path: '',
    };

    const media = await this.mediaService.upload(file);
    this.logger.log('Seed: media contoh dibuat');
    return this.media.findOneBy({ id: media.id });
  }

  private async ensureTemplates(): Promise<void> {
    const header = await this.templates.findOne({ where: { slug: 'header' } });
    if (!header) {
      await this.templates.save(
        this.templates.create({
          slug: 'header',
          title: 'Header',
          content: document([
            block('core/group', { layout: 'flex', gap: 16, padding: 16, bg: 'transparent', radius: 0 }, [
              block('core/paragraph', {
                html: '<p><strong>ReactPress</strong></p>',
                text: 'ReactPress',
              }),
              block('core/group', { layout: 'flex', gap: 8, padding: 0, bg: 'transparent', radius: 0 }, [
                block('core/button', { text: 'Beranda', url: '/', variant: 'ghost', size: 'sm' }),
                block('core/button', { text: 'Blog', url: '/blog', variant: 'ghost', size: 'sm' }),
              ]),
            ]),
          ]),
        }),
      );
    }

    const footer = await this.templates.findOne({ where: { slug: 'footer' } });
    if (!footer) {
      await this.templates.save(
        this.templates.create({
          slug: 'footer',
          title: 'Footer',
          content: document([
            block('core/group', { layout: 'stack', gap: 8, padding: 24, bg: 'bg', radius: 0 }, [
              block('core/paragraph', {
                html: '<p>© 2026 ReactPress. Dibangun dengan React, NestJS, dan PostgreSQL.</p>',
                text: '© 2026 ReactPress. Dibangun dengan React, NestJS, dan PostgreSQL.',
              }),
            ]),
          ]),
        }),
      );
    }

    const notFound = await this.templates.findOne({ where: { slug: '404' } });
    if (!notFound) {
      await this.templates.save(
        this.templates.create({
          slug: '404',
          title: 'Halaman 404',
          content: document([
            block('core/heading', { level: 1, align: 'left', text: 'Halaman tidak ditemukan' }),
            block('core/paragraph', {
              html: '<p>Alamat yang kamu tuju sudah tidak ada.</p>',
              text: 'Alamat yang kamu tuju sudah tidak ada.',
            }),
            block('core/button', { text: 'Kembali ke beranda', url: '/', variant: 'primary', size: 'md' }),
          ]),
        }),
      );
    }
  }

  private async ensureHelloPage(admin: User): Promise<void> {
    const existing = await this.pages.findOne({ where: { slug: 'hello-reactpress' } });
    if (existing) return;

    await this.pages.save(
      this.pages.create({
        title: 'Hello ReactPress',
        slug: 'hello-reactpress',
        status: 'published',
        isTemplate: false,
        content: document([
          block('core/heading', { level: 1, align: 'left', text: 'Hello dari ReactPress' }),
          block('core/paragraph', {
            html: '<p>ReactPress adalah CMS self-hosted dengan antarmuka 100% React. Konten disimpan sebagai dokumen blok, dirender di server, dan di-cache di Redis.</p>',
            text: 'ReactPress adalah CMS self-hosted dengan antarmuka 100% React.',
          }),
          block('core/button', { text: 'Baca selengkapnya', url: '/blog', variant: 'primary', size: 'md' }),
        ]),
        excerpt: 'Halaman perkenalan ReactPress.',
        authorId: admin.id,
        publishedAt: new Date(),
      }),
    );

    this.logger.log('Seed: halaman "Hello ReactPress" dibuat');
  }

  private async ensureSampleArticle(
    admin: User,
    mediaId: string | null,
    tagId: string,
  ): Promise<void> {
    const existing = await this.articles.findOne({ where: { slug: 'selamat-datang-di-reactpress' } });
    if (existing) return;

    const media = mediaId ? await this.media.findOne({ where: { id: mediaId } }) : null;

    const article = await this.articles.save(
      this.articles.create({
        title: 'Selamat Datang di ReactPress',
        slug: 'selamat-datang-di-reactpress',
        status: 'published',
        content: document([
          block('core/paragraph', {
            html: '<p>Ini artikel contoh yang dibuat otomatis oleh seed. Buka editor di admin untuk mencoba blok, pattern, dan revisi.</p>',
            text: 'Ini artikel contoh yang dibuat otomatis oleh seed.',
          }),
          ...(media
            ? [
                block('core/image', {
                  mediaId: media.id,
                  url: media.url,
                  alt: 'Logo ReactPress',
                  caption: 'Gambar contoh dari seed.',
                  align: 'center',
                  width: 100,
                }),
              ]
            : []),
          block('core/heading', { level: 2, align: 'left', text: 'Yang bisa dicoba' }),
          block('core/list', { ordered: false }, [
            block('core/list-item', { text: 'Susun konten dengan 14 blok inti' }),
            block('core/list-item', { text: 'Jadwalkan publikasi otomatis lewat cron' }),
            block('core/list-item', { text: 'Kelola kategori, tag, dan pattern' }),
          ]),
        ]),
        excerpt: 'Artikel contoh untuk memastikan instalasi ReactPress berjalan.',
        authorId: admin.id,
        publishedAt: new Date(),
      }),
    );

    const category = await this.categories.findOne({ where: { slug: 'umum' } });
    if (category) {
      await this.articleTerms.save([
        this.articleTerms.create({
          articleId: article.id,
          termId: category.id,
          termType: 'category',
        }),
        this.articleTerms.create({ articleId: article.id, termId: tagId, termType: 'tag' }),
      ]);
    }

    this.logger.log('Seed: artikel contoh dibuat');
  }

  private async ensureHeroPattern(admin: User): Promise<void> {
    const existing = await this.patterns.findOne({ where: { slug: 'hero-section' } });
    if (existing) return;

    await this.patterns.save(
      this.patterns.create({
        name: 'Hero Section',
        slug: 'hero-section',
        category: 'Layout',
        content: document([
          block('core/group', { layout: 'stack', gap: 16, padding: 48, bg: 'bg', radius: 8 }, [
            block('core/heading', { level: 1, align: 'left', text: 'Judul utama yang mencolok' }),
            block('core/paragraph', {
              html: '<p>Teks pendukung singkat yang menjelaskan nilai utama produk Anda.</p>',
              text: 'Teks pendukung singkat yang menjelaskan nilai utama produk Anda.',
            }),
            block('core/button', { text: 'Mulai sekarang', url: '/', variant: 'primary', size: 'lg' }),
          ]),
        ]),
        authorId: admin.id,
      }),
    );

    this.logger.log('Seed: pattern "Hero Section" dibuat');
  }
}
