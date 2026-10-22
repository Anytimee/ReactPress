import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity.js';
import { ArticleTerm } from './article-term.entity.js';
import { Category } from '../category/category.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { ArticleController } from './article.controller.js';
import { ArticleService } from './article.service.js';
import { ArticleTermsService } from './article-terms.service.js';
import { RevisionModule } from '../revision/revision.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleTerm, Category, Tag]), RevisionModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleTermsService],
  exports: [ArticleService, ArticleTermsService],
})
export class ArticleModule {}
