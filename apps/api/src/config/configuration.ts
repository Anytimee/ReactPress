import type { Env } from './env.validation.js';

export interface AppConfig {
  app: {
    name: string;
    env: string;
    port: number;
    timezone: string;
    logLevel: string;
  };
  urls: {
    api: string;
    web: string;
    admin: string;
    corsOrigins: string[];
  };
  database: {
    url: string | null;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  cache: {
    enabled: boolean;
    redisRequired: boolean;
    redisUrl: string | null;
    redisHost: string;
    redisPort: number;
    redisPassword: string | null;
    redisDb: number;
    ttl: number;
    sitemapTtl: number;
  };
  auth: {
    jwtSecret: string;
    accessTtl: string;
    refreshTtlDays: number;
    issuer: string;
    rateLimitMax: number;
    rateLimitTtl: number;
    cookieSecure: boolean;
    cookieDomain: string | null;
    refreshCookiePath: string;
  };
  security: {
    settingsKey: string;
  };
  mail: {
    enabled: boolean;
    host: string | null;
    port: number;
    user: string | null;
    pass: string | null;
    fromEmail: string;
    fromName: string;
    secure: boolean;
  };
  seed: {
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    demoContent: boolean;
  };
  storage: {
    uploadDir: string;
    publicPath: string;
    maxUploadSizeMb: number;
    imageMaxWidth: number;
    imageQuality: number;
    thumbWidth: number;
  };
}

function buildDatabaseUrl(env: Env): string | null {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  return `postgres://${env.DATABASE_USER}:${encodeURIComponent(env.DATABASE_PASSWORD)}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`;
}

function buildRedisUrl(env: Env): string | null {
  if (env.REDIS_URL) return env.REDIS_URL;
  const auth = env.REDIS_PASSWORD ? `:${encodeURIComponent(env.REDIS_PASSWORD)}@` : '';
  return `redis://${auth}${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`;
}

export function buildConfig(env: Env): AppConfig {
  return {
    app: {
      name: env.APP_NAME,
      env: env.NODE_ENV,
      port: env.APP_PORT,
      timezone: env.APP_TIMEZONE,
      logLevel: env.LOG_LEVEL,
    },
    urls: {
      api: env.API_URL,
      web: env.WEB_URL,
      admin: env.ADMIN_URL,
      corsOrigins: env.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    },
    database: {
      url: buildDatabaseUrl(env),
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      name: env.DATABASE_NAME,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      ssl: env.DATABASE_SSL,
    },
    cache: {
      enabled: env.CACHE_ENABLED,
      redisRequired: env.CACHE_REDIS_REQUIRED,
      redisUrl: buildRedisUrl(env),
      redisHost: env.REDIS_HOST,
      redisPort: env.REDIS_PORT,
      redisPassword: env.REDIS_PASSWORD ?? null,
      redisDb: env.REDIS_DB,
      ttl: env.CACHE_TTL,
      sitemapTtl: env.CACHE_SITEMAP_TTL,
    },
    auth: {
      jwtSecret: env.JWT_SECRET,
      accessTtl: env.JWT_ACCESS_TTL,
      refreshTtlDays: env.JWT_REFRESH_TTL_DAYS,
      issuer: env.JWT_ISSUER,
      rateLimitMax: env.AUTH_RATE_LIMIT_MAX,
      rateLimitTtl: env.AUTH_RATE_LIMIT_TTL,
      cookieSecure: env.COOKIE_SECURE,
      cookieDomain: env.COOKIE_DOMAIN ?? null,
      refreshCookiePath: env.REFRESH_COOKIE_PATH,
    },
    security: {
      settingsKey: env.SETTINGS_KEY,
    },
    mail: {
      enabled: env.MAIL_ENABLED,
      host: env.SMTP_HOST ?? null,
      port: env.SMTP_PORT,
      user: env.SMTP_USER ?? null,
      pass: env.SMTP_PASS ?? null,
      fromEmail: env.SMTP_FROM_EMAIL,
      fromName: env.SMTP_FROM_NAME,
      secure: env.SMTP_SECURE,
    },
    seed: {
      adminEmail: env.SEED_ADMIN_EMAIL,
      adminPassword: env.SEED_ADMIN_PASSWORD,
      adminName: env.SEED_ADMIN_NAME,
      demoContent: env.SEED_DEMO_CONTENT,
    },
    storage: {
      uploadDir: env.UPLOAD_DIR,
      publicPath: env.UPLOADS_PUBLIC_PATH,
      maxUploadSizeMb: env.MAX_UPLOAD_SIZE_MB,
      imageMaxWidth: env.IMAGE_MAX_WIDTH,
      imageQuality: env.IMAGE_QUALITY,
      thumbWidth: env.THUMB_WIDTH,
    },
  };
}

export type { Env };
