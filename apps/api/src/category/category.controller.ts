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
import { CategoryService } from './category.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './dto/category.dto.js';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categories: CategoryService) {}

  @Get()
  async list() {
    return this.categories.list();
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput) {
    return this.categories.create(body);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.categories.findById(id);
    return this.categories.list().then((items) => items.find((item) => item.id === id) ?? entity);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    return this.categories.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categories.remove(id);
  }
}
