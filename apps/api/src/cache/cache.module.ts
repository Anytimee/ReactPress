import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import type { AppConfig } from '../config/configuration.js';
import { CacheInvalidationService } from './cache-invalidation.service.js';
import { CacheService } from './cache.service.js';

const logger = new Logger('CacheModule');

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const cache = config.getOrThrow<AppConfig['cache']>('cache');
        const ttl = cache.ttl * 1000;

        if (!cache.enabled) {
          logger.warn('Cache dimatikan lewat CACHE_ENABLED=false');
          return { ttl, max: 1000 };
        }

        try {
          const store = await redisStore({
            url: cache.redisUrl ?? undefined,
            password: cache.redisPassword ?? undefined,
            database: cache.redisDb,
          });
          logger.log(`Cache memakai Redis di ${cache.redisHost}:${cache.redisPort}`);
          return { ttl, max: 5000, stores: [store] };
        } catch (error) {
          if (cache.redisRequired) {
            throw error;
          }
          logger.warn(
            `Redis tidak bisa diakses (${(error as Error).message}) — fallback ke cache in-memory`,
          );
          return { ttl, max: 1000 };
        }
      },
    }),
  ],
  providers: [CacheService, CacheInvalidationService],
  exports: [CacheService, CacheInvalidationService],
})
export class ReactPressCacheModule {}
