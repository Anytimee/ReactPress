import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity.js';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { Category } from '../category/category.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { Pattern } from '../pattern/pattern.entity.js';
import { ArticleTerm } from '../article/article-term.entity.js';
import { TemplateLayout } from '../template/template-layout.entity.js';
import { Media } from '../media/media.entity.js';
import { MediaModule } from '../media/media.module.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Article,
      Page,
      Category,
      Tag,
      Pattern,
      ArticleTerm,
      TemplateLayout,
      Media,
    ]),
    MediaModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
