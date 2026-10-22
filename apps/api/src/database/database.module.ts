import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { entities } from './entities.js';
import type { AppConfig } from '../config/configuration.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const database = config.getOrThrow<AppConfig['database']>('database');

        return {
          type: 'postgres' as const,
          url: database.url ?? undefined,
          host: database.url ? undefined : database.host,
          port: database.url ? undefined : database.port,
          username: database.url ? undefined : database.user,
          password: database.url ? undefined : database.password,
          database: database.url ? undefined : database.name,
          ssl: database.ssl ? { rejectUnauthorized: false } : false,
          entities,
          synchronize: false,
          migrationsRun: true,
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsTableName: 'migrations',
          logging: config.get<string>('app.logLevel') === 'debug' ? ['query', 'error'] : ['error'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
