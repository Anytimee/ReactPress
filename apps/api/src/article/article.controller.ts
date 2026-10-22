import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@reactpress/types';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { apiError } from '../common/api-error.js';
import { RevisionService } from '../revision/revision.service.js';
import { ArticleService } from './article.service.js';
import {
  createArticleSchema,
  duplicateSchema,
  listArticlesSchema,
  scheduleSchema,
  setTermsSchema,
  updateArticleSchema,
  type CreateArticleInput,
  type DuplicateInput,
  type ListArticlesInput,
  type SetTermsInput,
  type UpdateArticleInput,
} from './dto/article.dto.js';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articles: ArticleService,
    private readonly revisions: RevisionService,
  ) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listArticlesSchema)) query: ListArticlesInput) {
    return this.articles.list(query);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createArticleSchema)) body: CreateArticleInput,
    @CurrentUser() actor: User,
  ) {
    return this.articles.create(body, actor);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const article = await this.articles.findById(id);
    return this.articles.toDto(article);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateArticleSchema)) body: UpdateArticleInput,
    @CurrentUser() actor: User,
  ) {
    return this.articles.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async trash(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.articles.trash(id, actor);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.articles.publish(id, actor);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.articles.unpublish(id, actor);
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  async postTrash(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.articles.trash(id, actor);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.articles.restore(id, actor);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    await this.articles.destroy(id, actor);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(duplicateSchema)) body: DuplicateInput,
    @CurrentUser() actor: User,
  ) {
    return this.articles.duplicate(id, body, actor);
  }

  @Post(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(scheduleSchema)) body: { scheduledAt: string },
    @CurrentUser() actor: User,
  ) {
    return this.articles.schedule(id, body.scheduledAt, actor);
  }

  @Post(':id/preview-token')
  @HttpCode(HttpStatus.OK)
  async previewToken(@Param('id', ParseUUIDPipe) id: string) {
    await this.articles.findById(id);
    return { token: this.articles.createPreviewTokenFor(id) };
  }

  @Get(':id/revisions')
  async listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    await this.articles.findById(id);
    return this.revisions.list('article', id);
  }

  @Get(':id/revisions/:revisionId')
  async getRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
  ) {
    const revision = await this.revisions.findOne(revisionId);
    if (revision.contentId !== id || revision.contentType !== 'article') {
      throw apiError('Revisi tidak ditemukan untuk artikel ini', HttpStatus.NOT_FOUND);
    }
    return this.revisions.toDto(revision);
  }

  @Post(':id/revisions/:revisionId/restore')
  @HttpCode(HttpStatus.OK)
  async restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @CurrentUser() actor: User,
  ) {
    const revision = await this.revisions.findOne(revisionId);
    if (revision.contentId !== id || revision.contentType !== 'article') {
      throw apiError('Revisi tidak ditemukan untuk artikel ini', HttpStatus.NOT_FOUND);
    }

    return this.articles.update(
      id,
      { title: revision.title, content: revision.content as any },
      actor,
    );
  }

  @Post(':id/terms')
  @HttpCode(HttpStatus.OK)
  async setTerms(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(setTermsSchema)) body: SetTermsInput,
    @CurrentUser() actor: User,
  ) {
    return this.articles.setTerms(id, body, actor);
  }
}
