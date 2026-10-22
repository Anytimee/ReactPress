import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator.js';
import { CacheService } from '../cache/cache.service.js';
import type { HealthStatus } from '@reactpress/types';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cache: CacheService,
  ) {}

  @Public()
  @Get()
  async check(): Promise<HealthStatus> {
    const db = await this.checkDatabase();
    const cacheState = await this.cache.health();

    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      cache: cacheState,
      uptime: Math.round(process.uptime()),
      version: process.env.npm_package_version ?? '1.0.0',
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }
}
