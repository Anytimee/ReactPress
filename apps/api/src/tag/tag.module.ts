import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity.js';
import { TagController } from './tag.controller.js';
import { TagService } from './tag.service.js';
import { ArticleTerm } from '../article/article-term.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, ArticleTerm])],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
