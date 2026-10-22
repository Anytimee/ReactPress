import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module.js';
import { PageModule } from '../page/page.module.js';
import { CategoryModule } from '../category/category.module.js';
import { TagModule } from '../tag/tag.module.js';
import { PatternModule } from '../pattern/pattern.module.js';
import { TemplateModule } from '../template/template.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { MediaModule } from '../media/media.module.js';
import { FeedController } from './feed.controller.js';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';

@Module({
  imports: [
    ArticleModule,
    PageModule,
    CategoryModule,
    TagModule,
    PatternModule,
    TemplateModule,
    SettingsModule,
    MediaModule,
  ],
  controllers: [PublicController, FeedController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
