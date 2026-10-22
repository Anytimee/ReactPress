# ReactPress

Fullstack CMS (clone WordPress) — **100% React**, self-hosted, API sendiri. Dibangun dari nol.

- **Backend** — NestJS 10, TypeORM, PostgreSQL 16, Zod, passport-jwt, bcrypt, sharp, nodemailer, @nestjs/schedule
- **Admin SPA** — React 18, Vite, TanStack Router, TanStack Query, Zustand, @dnd-kit, TipTap, Radix UI, TailwindCSS
- **Public** — Vike (Vite SSR) + React. **SSR wajib** — SEO adalah fitur inti
- **Cache** — Redis via @nestjs/cache-manager, fallback in-memory
- **Deploy** — docker-compose: postgres 16, redis 7, api, admin, web, nginx

Node **20 LTS**.

---

## Struktur

```
reactpress/
├── package.json              # npm workspaces (apps/*, packages/*)
├── docker-compose.yml
├── .env.example
├── nginx/nginx.conf          # reverse proxy
├── docker/backup.sh          # pg_dump + tar uploads, retensi 7 hari
├── apps/
│   ├── api/                  # NestJS REST API
│   │   └── src/{auth,user,article,page,media,category,tag,pattern,
│   │            template,settings,revision,scheduler,cache,mail,public}/
│   ├── admin/                # React SPA (editor, dashboard, settings)
│   │   └── src/{routes,editor,components,stores,lib}/
│   └── web/                  # Vike SSR (public site)
│       └── {pages,renderer}/
└── packages/
    ├── blocks/               # 14 block: schema zod, registry, render SSR-safe
    ├── types/                # shared TypeScript types
    └── ui/                   # design tokens + komponen dasar
```

---

## Prasyarat

| Tool             | Versi      |
| ---------------- | ---------- |
| Node.js          | 20 LTS     |
| npm              | 10+        |
| Docker + Compose | v24+ / v2+ |

PostgreSQL & Redis **tidak** wajib di dev lokal: API bisa jalan dengan database eksternal, dan
cache otomatis jatuh ke in-memory bila Redis tidak ada.

---

## Quick start (dev lokal)

```bash
cp .env.example .env
# isi minimal: JWT_SECRET, SETTINGS_KEY, SEED_ADMIN_PASSWORD, DATABASE_*
npm install

# database (pakai container postgres saja)
docker run -d --name reactpress-db -p 5432:5432 \
  -e POSTGRES_USER=reactpress -e POSTGRES_PASSWORD=reactpress_password \
  -e POSTGRES_DB=reactpress postgres:16-alpine

npm run dev
```

`npm run dev` membangun package shared dulu, lalu menjalankan API (`:3000`), admin (`:5173`),
dan web (`:5174`) bersamaan.

| Service    | URL dev                          |
| ---------- | -------------------------------- |
| Admin      | http://localhost:5173            |
| Web publik | http://localhost:5174            |
| API        | http://localhost:3000/api        |
| Health     | http://localhost:3000/api/health |

Login admin memakai `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` dari `.env`.

---

## Deploy (docker compose)

```bash
cp .env.example .env     # wajib isi JWT_SECRET & SETTINGS_KEY
docker compose up -d --build
```

| Service    | URL                                  |
| ---------- | ------------------------------------ |
| Web publik | http://localhost:${NGINX_PORT}/      |
| Admin      | http://localhost:${NGINX_PORT}/admin |
| API        | http://localhost:${NGINX_PORT}/api   |

Nginx mem-proxy: `/api` → `api:3000`, `/admin` → static admin, `/uploads` → volume uploads,
`/` → `web:3000` (SSR).

### Backup & restore

```bash
# backup (pg_dump + tar folder uploads, retensi 7 hari)
./docker/backup.sh

# restore
docker compose exec -T postgres pg_restore -U reactpress -d reactpress --clean < backup.dump
docker compose exec -T api tar -xzf - -C /app/uploads < uploads.tar.gz
```

---

## Perintah npm

| Perintah            | Fungsi                                       |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | dev semua app (packages dibangun lebih dulu) |
| `npm run build`     | build packages → apps                        |
| `npm run typecheck` | `tsc --noEmit` per workspace                 |
| `npm run lint`      | ESLint flat config seluruh repo              |
| `npm run format`    | Prettier                                     |
| `npm run clean`     | hapus artefak build                          |

---

## Environment variables

Semua variabel ada di `.env.example` (satu-satunya sumber kebenaran).

| Variabel                                | Default                       | Keterangan                                               |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------- |
| `NODE_ENV`                              | development                   | `production` untuk deploy                                |
| `APP_PORT`                              | 3000                          | port API                                                 |
| `APP_TIMEZONE`                          | Asia/Jakarta                  | timezone cron scheduler                                  |
| `API_URL`                               | http://localhost:3000         | base URL API (server-to-server)                          |
| `WEB_URL`                               | http://localhost:5174         | base URL situs publik (canonical/sitemap/rss)            |
| `ADMIN_URL`                             | http://localhost:5173         | base URL admin                                           |
| `CORS_ORIGINS`                          | daftar origin                 | origin yang boleh memanggil API                          |
| `DATABASE_URL`                          | kosong                        | bila kosong disusun dari `DATABASE_*`                    |
| `DATABASE_HOST/PORT/NAME/USER/PASSWORD` | localhost/5432/reactpress/... | PostgreSQL                                               |
| `DATABASE_SSL`                          | false                         | `true` untuk managed DB                                  |
| `REDIS_URL`                             | kosong                        | bila kosong disusun dari `REDIS_*`                       |
| `REDIS_HOST/PORT/PASSWORD/DB`           | localhost/6379                | Redis 7                                                  |
| `CACHE_ENABLED`                         | true                          | matikan cache publik                                     |
| `CACHE_REDIS_REQUIRED`                  | false                         | `true` → API gagal start tanpa Redis                     |
| `CACHE_TTL`                             | 300                           | TTL cache endpoint publik (detik)                        |
| `CACHE_SITEMAP_TTL`                     | 3600                          | TTL sitemap.xml                                          |
| `JWT_SECRET`                            | —                             | **wajib**, min 32 karakter. Ganti ⇒ semua sesi logout    |
| `JWT_ACCESS_TTL`                        | 15m                           | masa berlaku access token                                |
| `JWT_REFRESH_TTL_DAYS`                  | 7                             | masa berlaku refresh token                               |
| `JWT_ISSUER`                            | reactpress                    | issuer token                                             |
| `AUTH_RATE_LIMIT_MAX`                   | 5                             | percobaan login per periode                              |
| `AUTH_RATE_LIMIT_TTL`                   | 900                           | periode rate limit (detik)                               |
| `COOKIE_SECURE`                         | false                         | `true` di produksi (HTTPS)                               |
| `COOKIE_DOMAIN`                         | kosong                        | domain cookie refresh                                    |
| `REFRESH_COOKIE_PATH`                   | /api/auth/refresh             | path cookie refresh token                                |
| `SETTINGS_KEY`                          | —                             | **wajib**, 32 byte hex untuk AES-256-GCM (password SMTP) |
| `MAIL_ENABLED`                          | false                         | nyalakan mailer                                          |
| `SMTP_HOST/PORT/USER/PASS`              | —                             | SMTP default (bisa ditimpa di UI)                        |
| `SMTP_FROM_EMAIL/SMTP_FROM_NAME`        | —                             | pengirim                                                 |
| `SMTP_SECURE`                           | false                         | `true` untuk port 465                                    |
| `SEED_ADMIN_EMAIL/PASSWORD/NAME`        | —                             | admin                                                    | super_admin hasil seed |
| `SEED_DEMO_CONTENT`                     | true                          | seed header/footer/artikel/kategori/tag/pattern contoh   |
| `UPLOAD_DIR`                            | ./uploads                     | lokasi file upload                                       |
| `UPLOADS_PUBLIC_PATH`                   | /uploads                      | path publik file upload                                  |
| `MAX_UPLOAD_SIZE_MB`                    | 10                            | batas ukuran upload                                      |
| `IMAGE_MAX_WIDTH`                       | 2400                          | lebar maksimum gambar (WebP)                             |
| `IMAGE_QUALITY`                         | 80                            | kualitas WebP                                            |
| `THUMB_WIDTH`                           | 400                           | lebar thumbnail                                          |
| `VITE_API_URL`                          | http://localhost:3000/api     | base API untuk admin (build-time)                        |
| `VITE_WEB_URL`                          | http://localhost:5174         | base situs publik untuk tombol preview                   |
| `WEB_CACHE_MAX_AGE`                     | 60                            | `Cache-Control` HTML (detik)                             |
| `WEB_CACHE_STALE_WHILE_REVALIDATE`      | 300                           | `stale-while-revalidate`                                 |
| `COMPOSE_PROJECT_NAME`                  | reactpress                    | prefix container/volume                                  |
| `POSTGRES_DB/USER/PASSWORD/PORT`        | —                             | kredensial service postgres                              |
| `REDIS_PORT_HOST`                       | 6379                          | port redis yang diekspos ke host                         |
| `NGINX_PORT`                            | 8080                          | port nginx yang diekspos ke host                         |
| `LOG_LEVEL`                             | info                          | level log API                                            |

### Mengganti `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Setelah diganti, **semua sesi aktif langsung logout** (access token lama tidak valid lagi
dan refresh token ikut ditolak karena signature/issuer berubah). Pengguna cukup login ulang.

---

## Kontrak API (ringkas)

Semua error memakai bentuk `{ "error": string, "details"?: unknown }`.

| Grup     | Endpoint                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth     | `POST /api/auth/login`, `/refresh`, `/logout`, `/logout-all`, `PATCH /api/auth/password`, `GET /api/auth/me`                                                      |
| Article  | `GET/POST /api/articles`, `GET/PATCH/DELETE /api/articles/:id`, `POST /api/articles/:id/{publish,unpublish,trash,restore,duplicate,schedule,preview-token,terms}` |
| Revisi   | `GET /api/articles/:id/revisions`, `GET .../revisions/:revId`, `POST .../revisions/:revId/restore`                                                                |
| Page     | `GET/POST /api/pages`, `GET/PATCH/DELETE /api/pages/:id`, `POST /api/pages/:id/set-template`                                                                      |
| Media    | `POST /api/media/upload`, `GET /api/media`, `PATCH/DELETE /api/media/:id`, `GET /api/media/:id/usage`                                                             |
| Taxonomy | `GET/POST/PATCH/DELETE /api/categories`, `GET/POST/PATCH/DELETE /api/tags`                                                                                        |
| Pattern  | `GET/POST/PATCH/DELETE /api/patterns`                                                                                                                             |
| Template | `GET /api/templates`, `GET /api/templates/by-slug/:slug`, `POST /api/templates`, `PATCH /api/templates/:id`                                                       |
| Settings | `GET/PATCH /api/settings`, `POST /api/settings/smtp-test`                                                                                                         |
| User     | `GET/POST/PATCH/DELETE /api/users`                                                                                                                                |
| Public   | `GET /api/public/{articles,articles/:slug,pages/:slug,categories,tags,patterns,templates/:slug,global-styles,site,preview/:token}`                                |
| Feed     | `GET /sitemap.xml`, `/robots.txt`, `/rss.xml`, `/feed.xml`                                                                                                        |
| Health   | `GET /api/health` → `{ status, db, cache }`                                                                                                                       |

---

## Catatan desain

- **Monokrom + 1 aksen.** Tanpa gradient, tanpa ungu-biru, tanpa glassmorphism, tanpa emoji sebagai ikon.
- Border 1px `var(--line)`, radius maksimal 8px, shadow maksimal `0 1px 2px rgba(0,0,0,.04)`.
- Ikon Lucide stroke 1.75, 16px di tombol 32px.
- Tipografi: Inter (UI 15px/1.55) + JetBrains Mono (kode). Heading 600–700, `tracking-tight`.
- Token warna berada di `packages/ui/src/tokens.css` dan dipakai bersama oleh admin & web.

---

## Lisensi

MIT
