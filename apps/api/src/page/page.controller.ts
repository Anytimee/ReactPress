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
import { PageService } from './page.service.js';
import {
  createPageSchema,
  listPagesSchema,
  setTemplateSchema,
  updatePageSchema,
  type CreatePageInput,
  type ListPagesInput,
  type UpdatePageInput,
} from './dto/page.dto.js';

@Controller('pages')
export class PageController {
  constructor(
    private readonly pages: PageService,
    private readonly revisions: RevisionService,
  ) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listPagesSchema)) query: ListPagesInput) {
    return this.pages.list(query);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPageSchema)) body: CreatePageInput,
    @CurrentUser() actor: User,
  ) {
    return this.pages.create(body, actor);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const page = await this.pages.findById(id);
    return this.pages.toDto(page);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePageSchema)) body: UpdatePageInput,
    @CurrentUser() actor: User,
  ) {
    return this.pages.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async trash(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.trash(id, actor);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.publish(id, actor);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.unpublish(id, actor);
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  async postTrash(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.trash(id, actor);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.restore(id, actor);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    await this.pages.destroy(id, actor);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    return this.pages.duplicate(id, actor);
  }

  @Post(':id/set-template')
  @HttpCode(HttpStatus.OK)
  async setTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(setTemplateSchema)) body: { templateSlug: string | null },
    @CurrentUser() actor: User,
  ) {
    return this.pages.setTemplate(id, body.templateSlug, actor);
  }

  @Post(':id/preview-token')
  @HttpCode(HttpStatus.OK)
  async previewToken(@Param('id', ParseUUIDPipe) id: string) {
    await this.pages.findById(id);
    return { token: this.pages.createPreviewTokenFor(id) };
  }

  @Get(':id/revisions')
  async listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    await this.pages.findById(id);
    return this.revisions.list('page', id);
  }

  @Post(':id/revisions/:revisionId/restore')
  @HttpCode(HttpStatus.OK)
  async restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @CurrentUser() actor: User,
  ) {
    const revision = await this.revisions.findOne(revisionId);
    if (revision.contentId !== id || revision.contentType !== 'page') {
      throw apiError('Revisi tidak ditemukan untuk halaman ini', HttpStatus.NOT_FOUND);
    }
    return this.pages.update(id, { title: revision.title, content: revision.content as any }, actor);
  }
}
