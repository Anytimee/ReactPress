import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity.js';
import { PageController } from './page.controller.js';
import { PageService } from './page.service.js';
import { RevisionModule } from '../revision/revision.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), RevisionModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
