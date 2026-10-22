import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity.js';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { ArticleTerm } from '../article/article-term.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ArticleTerm])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
