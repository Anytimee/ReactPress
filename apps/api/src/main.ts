import 'reflect-metadata';
import { Logger, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { SeedService } from './seed/seed.service.js';
import type { AppConfig } from './config/configuration.js';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  const appConfig = config.getOrThrow<AppConfig['app']>('app');
  const urls = config.getOrThrow<AppConfig['urls']>('urls');

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'sitemap.xml', method: RequestMethod.GET },
      { path: 'robots.txt', method: RequestMethod.GET },
      { path: 'rss.xml', method: RequestMethod.GET },
      { path: 'feed.xml', method: RequestMethod.GET },
      { path: 'uploads/(.*)', method: RequestMethod.ALL },
    ],
  });

  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());

  app.enableCors({
    origin: urls.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.enableShutdownHooks();

  await app.listen(appConfig.port, '0.0.0.0');
  logger.log(`API berjalan di http://localhost:${appConfig.port}/api`);

  try {
    const seed = app.get(SeedService);
    await seed.run();
  } catch (error) {
    logger.error(`Seed gagal: ${(error as Error).message}`);
  }
}

void bootstrap();
