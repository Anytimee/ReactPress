import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { buildConfig, type AppConfig } from './config/configuration.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { ReactPressCacheModule } from './cache/cache.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { ArticleModule } from './article/article.module.js';
import { PageModule } from './page/page.module.js';
import { MediaModule } from './media/media.module.js';
import { CategoryModule } from './category/category.module.js';
import { TagModule } from './tag/tag.module.js';
import { PatternModule } from './pattern/pattern.module.js';
import { TemplateModule } from './template/template.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { RevisionModule } from './revision/revision.module.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';
import { MailModule } from './mail/mail.module.js';
import { PublicModule } from './public/public.module.js';
import { HealthModule } from './health/health.module.js';
import { SeedModule } from './seed/seed.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['../../.env', '.env', '../../.env.local', '.env.local'],
      validate: (raw: Record<string, unknown>) => validateEnv(raw),
      load: [() => buildConfig(validateEnv(process.env as Record<string, unknown>))],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const auth = config.getOrThrow<AppConfig['auth']>('auth');
        return {
          throttlers: [
            {
              name: 'default',
              ttl: auth.rateLimitTtl * 1000,
              limit: 60,
            },
          ],
          // Batas login dihitung per kombinasi IP + email.
          getTracker: (request: Record<string, unknown>) => {
            const body = request.body as { email?: unknown } | undefined;
            const email = typeof body?.email === 'string' ? body.email.toLowerCase() : '';
            const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
            return `${ip}:${email}`;
          },
        };
      },
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const storage = config.getOrThrow<AppConfig['storage']>('storage');
        return [
          {
            rootPath: storage.uploadDir,
            serveRoot: storage.publicPath.replace(/^\//, ''),
            serveStaticOptions: { index: false, fallthrough: true },
          },
        ];
      },
    }),
    DatabaseModule,
    ReactPressCacheModule,
    AuthModule,
    UserModule,
    ArticleModule,
    PageModule,
    MediaModule,
    CategoryModule,
    TagModule,
    PatternModule,
    TemplateModule,
    SettingsModule,
    RevisionModule,
    SchedulerModule,
    MailModule,
    PublicModule,
    HealthModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
