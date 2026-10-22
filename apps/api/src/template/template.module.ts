import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateLayout } from './template-layout.entity.js';
import { TemplateController } from './template.controller.js';
import { TemplateService } from './template.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateLayout])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
