import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Media } from './media.entity.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { Article } from '../article/article.entity.js';
import { Page } from '../page/page.entity.js';
import { Pattern } from '../pattern/pattern.entity.js';
import type { AppConfig } from '../config/configuration.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Article, Page, Pattern]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const storage = config.getOrThrow<AppConfig['storage']>('storage');
        return { limits: { fileSize: storage.maxUploadSizeMb * 1024 * 1024 } };
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
