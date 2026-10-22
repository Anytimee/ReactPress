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
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { TemplateService } from './template.service.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from './dto/template.dto.js';

@Controller('templates')
export class TemplateController {
  constructor(private readonly templates: TemplateService) {}

  @Get()
  async list() {
    return this.templates.listGrouped();
  }

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    const entity = await this.templates.findBySlug(slug);
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      content: entity.content,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createTemplateSchema)) body: CreateTemplateInput) {
    return this.templates.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTemplateSchema)) body: UpdateTemplateInput,
  ) {
    return this.templates.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.templates.remove(id);
  }
}
