import { z } from 'zod';

/**
 * Skema environment. Semua variabel yang dibaca kode divalidasi di satu tempat
 * supaya konfigurasi salah ketahuan saat boot, bukan saat request.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('ReactPress'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_TIMEZONE: z.string().default('Asia/Jakarta'),
  LOG_LEVEL: z.string().default('info'),

  API_URL: z.string().default('http://localhost:3000'),
  WEB_URL: z.string().default('http://localhost:5174'),
  ADMIN_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),

  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().default('reactpress'),
  DATABASE_USER: z.string().default('reactpress'),
  DATABASE_PASSWORD: z.string().default('reactpress_password'),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  CACHE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  CACHE_REDIS_REQUIRED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  CACHE_TTL: z.coerce.number().int().positive().default(300),
  CACHE_SITEMAP_TTL: z.coerce.number().int().positive().default(3600),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET minimal 16 karakter'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  JWT_ISSUER: z.string().default('reactpress'),

  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RATE_LIMIT_TTL: z.coerce.number().int().positive().default(900),

  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  COOKIE_DOMAIN: z.string().optional(),
  REFRESH_COOKIE_PATH: z.string().default('/api/auth/refresh'),

  SETTINGS_KEY: z.string().min(16, 'SETTINGS_KEY minimal 16 karakter'),

  MAIL_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().default('no-reply@reactpress.local'),
  SMTP_FROM_NAME: z.string().default('ReactPress'),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@reactpress.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('change-me-seed-password'),
  SEED_ADMIN_NAME: z.string().default('Super Admin'),
  SEED_DEMO_CONTENT: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),

  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOADS_PUBLIC_PATH: z.string().default('/uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),
  IMAGE_MAX_WIDTH: z.coerce.number().int().positive().default(2400),
  IMAGE_QUALITY: z.coerce.number().int().min(40).max(100).default(80),
  THUMB_WIDTH: z.coerce.number().int().positive().default(400),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Konfigurasi environment tidak valid -> ${issues}`);
  }
  return result.data;
}
