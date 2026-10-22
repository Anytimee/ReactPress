import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { CacheService } from '../cache/cache.service.js';
import { PublicService } from './public.service.js';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

@Public()
@Controller()
export class FeedController {
  constructor(
    private readonly publicService: PublicService,
    private readonly cache: CacheService,
  ) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async sitemap(): Promise<string> {
    return this.cache.wrap('sitemap', 'xml', async () => {
      const { articles, pages } = await this.publicService.publishedSlugs();
      const base = this.publicService.siteUrl;

      const urls = [
        ...pages.map((slug) => ({ loc: `${base}/${slug}`, changefreq: 'monthly', priority: '0.6' })),
        ...articles.map((slug) => ({ loc: `${base}/${slug}`, changefreq: 'weekly', priority: '0.8' })),
      ];

      const body = urls
        .map(
          (url) =>
            `  <url><loc>${escapeXml(url.loc)}</loc><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`,
        )
        .join('\n');

      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
    }, this.cache.sitemapTtl);
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async robots(): Promise<string> {
    const base = this.publicService.siteUrl;
    return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  }

  @Get('rss.xml')
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async rss(): Promise<string> {
    return this.cache.wrap('sitemap', 'rss', async () => {
      const site = await this.publicService.getSite();
      const articles = await this.publicService.recentPublished(20);
      const base = this.publicService.siteUrl;

      const items = articles
        .map((article) => {
          const link = `${base}/${article.slug}`;
          const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : '';
          return [
            '    <item>',
            `      <title>${escapeXml(article.title)}</title>`,
            `      <link>${escapeXml(link)}</link>`,
            `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
            article.excerpt ? `      <description>${escapeXml(article.excerpt)}</description>` : '',
            pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
            '    </item>',
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n');

      return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.siteName)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(site.tagline ?? '')}</description>
    <language>id</language>
${items}
  </channel>
</rss>`;
    }, this.cache.sitemapTtl);
  }

  @Get('feed.xml')
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async feed(): Promise<string> {
    return this.rss();
  }
}
