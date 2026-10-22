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
import { TagService } from './tag.service.js';
import { createTagSchema, updateTagSchema, type CreateTagInput, type UpdateTagInput } from './dto/tag.dto.js';

@Controller('tags')
export class TagController {
  constructor(private readonly tags: TagService) {}

  @Get()
  async list() {
    return this.tags.list();
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createTagSchema)) body: CreateTagInput) {
    return this.tags.create(body);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    await this.tags.findById(id);
    const items = await this.tags.list();
    return items.find((item) => item.id === id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTagSchema)) body: UpdateTagInput,
  ) {
    return this.tags.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tags.remove(id);
  }
}
