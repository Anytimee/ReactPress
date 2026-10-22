import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { PublicService, type PublicListQuery } from './public.service.js';

@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('articles')
  async articles(@Query() query: PublicListQuery) {
    return this.publicService.listArticles(query);
  }

  @Get('articles/:slug')
  async article(@Param('slug') slug: string) {
    const article = await this.publicService.getArticleBySlug(slug);
    return { found: Boolean(article), article };
  }

  @Get('pages/:slug')
  async page(@Param('slug') slug: string) {
    const page = await this.publicService.getPageBySlug(slug);
    return { found: Boolean(page), page };
  }

  @Get('categories')
  async categories() {
    return this.publicService.listCategories();
  }

  @Get('tags')
  async tags() {
    return this.publicService.listTags();
  }

  @Get('patterns')
  async patterns() {
    return this.publicService.listPatterns();
  }

  @Get('templates/:slug')
  async template(@Param('slug') slug: string) {
    return this.publicService.getTemplate(slug);
  }

  @Get('global-styles')
  async globalStyles() {
    return this.publicService.getGlobalStyles();
  }

  @Get('site')
  async site() {
    return this.publicService.getSite();
  }

  @Get('preview/:token')
  async preview(@Param('token') token: string) {
    return this.publicService.getPreview(token);
  }
}
