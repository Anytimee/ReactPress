import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { randomUUID } from 'node:crypto';
import type { Cache } from 'cache-manager';
import type { AppConfig } from '../config/configuration.js';

const EPOCH_KEY = 'rp:epoch';
const VERSION_PREFIX = 'rp:ver:';

export type CacheScope = string;

/**
 * Cache dengan invalidasi berbasis versi.
 *
 * Setiap key tersusun dari: epoch global + versi scope + key.
 * - `bump(scope)` membuat key lama tidak terpakai lagi (invalidasi selektif).
 * - `resetEpoch()` membuat seluruh key lama tidak terpakai lagi (invalidasi total).
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly config: ConfigService,
  ) {}

  get defaultTtl(): number {
    return this.config.getOrThrow<AppConfig['cache']>('cache').ttl;
  }

  get sitemapTtl(): number {
    return this.config.getOrThrow<AppConfig['cache']>('cache').sitemapTtl;
  }

  async epoch(): Promise<string> {
    const current = await this.cache.get<string>(EPOCH_KEY);
    if (current) return current;
    const fresh = randomUUID();
    await this.cache.set(EPOCH_KEY, fresh, 0);
    return fresh;
  }

  async version(scope: CacheScope): Promise<string> {
    const key = `${VERSION_PREFIX}${scope}`;
    const current = await this.cache.get<string>(key);
    if (current) return current;
    const fresh = randomUUID();
    await this.cache.set(key, fresh, 0);
    return fresh;
  }

  async bump(scope: CacheScope): Promise<void> {
    await this.cache.set(`${VERSION_PREFIX}${scope}`, randomUUID(), 0);
  }

  async resetEpoch(): Promise<void> {
    await this.cache.set(EPOCH_KEY, randomUUID(), 0);
  }

  private async buildKey(scope: CacheScope, key: string): Promise<string> {
    const [epoch, version] = await Promise.all([this.epoch(), this.version(scope)]);
    return `rp:${epoch}:${version}:${key}`;
  }

  async get<T>(scope: CacheScope, key: string): Promise<T | undefined> {
    try {
      const fullKey = await this.buildKey(scope, key);
      return await this.cache.get<T>(fullKey);
    } catch (error) {
      this.logger.warn(`Cache get gagal: ${(error as Error).message}`);
      return undefined;
    }
  }

  async set<T>(scope: CacheScope, key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = await this.buildKey(scope, key);
      const ttl = (ttlSeconds ?? this.defaultTtl) * 1000;
      await this.cache.set(fullKey, value, ttl);
    } catch (error) {
      this.logger.warn(`Cache set gagal: ${(error as Error).message}`);
    }
  }

  async del(scope: CacheScope, key: string): Promise<void> {
    try {
      const fullKey = await this.buildKey(scope, key);
      await this.cache.del(fullKey);
    } catch (error) {
      this.logger.warn(`Cache del gagal: ${(error as Error).message}`);
    }
  }

  /** Ambil dari cache; bila belum ada, panggil factory lalu simpan hasilnya. */
  async wrap<T>(
    scope: CacheScope,
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(scope, key);
    if (cached !== undefined) return cached;

    const value = await factory();
    await this.set(scope, key, value, ttlSeconds);
    return value;
  }

  async health(): Promise<'up' | 'down' | 'memory'> {
    try {
      const probe = `health:${randomUUID()}`;
      await this.cache.set(probe, 'ok', 1000);
      const value = await this.cache.get<string>(probe);
      await this.cache.del(probe);
      if (value !== 'ok') return 'down';
      return this.isRedis() ? 'up' : 'memory';
    } catch {
      return 'down';
    }
  }

  private isRedis(): boolean {
    const store = (this.cache as Cache & { store?: unknown }).store;
    const candidates = Array.isArray(store) ? store : [store];
    return candidates.some((entry) => {
      if (typeof entry !== 'object' || entry === null) return false;
      const name = (entry as { name?: unknown }).name;
      return name === 'redis' || name === 'redis-cluster';
    });
  }
}
