import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { RevisionModule } from '../revision/revision.module.js';
import { SchedulerService } from './scheduler.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Page]), RevisionModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
