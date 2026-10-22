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
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '@reactpress/types';
import { PatternService } from './pattern.service.js';
import {
  createPatternSchema,
  updatePatternSchema,
  type CreatePatternInput,
  type UpdatePatternInput,
} from './dto/pattern.dto.js';

@Controller('patterns')
export class PatternController {
  constructor(private readonly patterns: PatternService) {}

  @Get()
  async list() {
    return this.patterns.list();
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPatternSchema)) body: CreatePatternInput,
    @CurrentUser() actor: User,
  ) {
    return this.patterns.create(body, actor.id);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.patterns.findById(id);
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      category: entity.category,
      content: entity.content,
      thumbnailUrl: entity.thumbnailUrl,
      authorId: entity.authorId,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePatternSchema)) body: UpdatePatternInput,
  ) {
    return this.patterns.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.patterns.remove(id);
  }
}
