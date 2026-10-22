import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildConfig } from '../config/configuration.js';
import { validateEnv } from '../config/env.validation.js';
import { entities } from './entities.js';

// CLI TypeORM tidak memuat .env otomatis — cari di folder app lalu root repo.
for (const candidate of [
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '.env'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate });
    break;
  }
}

const env = validateEnv(process.env as Record<string, unknown>);
const config = buildConfig(env);

/** DataSource untuk CLI TypeORM (migration:generate, migration:run). */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url ?? undefined,
  host: config.database.url ? undefined : config.database.host,
  port: config.database.url ? undefined : config.database.port,
  username: config.database.url ? undefined : config.database.user,
  password: config.database.url ? undefined : config.database.password,
  database: config.database.url ? undefined : config.database.name,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
});
