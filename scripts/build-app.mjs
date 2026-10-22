/**
 * Build satu app (API NestJS, admin & web Vite).
 *
 * Dijalankan dari folder app: `npm run build -w @reactpress/admin`.
 * App tanpa file sumber dilewati tanpa error.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const appDir = process.cwd();
const root = resolve(import.meta.dirname, '..');
const bin = join(root, 'node_modules', '.bin');

function hasSources(dir) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { recursive: true }).some(
    (entry) => typeof entry === 'string' && /\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts'),
  );
}

const manifest = JSON.parse(readFileSync(resolve(appDir, 'package.json'), 'utf8'));
const name = manifest.name;

const sourceDirs = name === '@reactpress/web' ? ['src', 'pages', 'renderer'] : ['src'];
const hasAnySource = sourceDirs.some((dir) => hasSources(resolve(appDir, dir)));

if (!hasAnySource) {
  console.log(`[build] ${name} belum ada sumber, dilewati`);
  process.exit(0);
}

const steps =
  name === '@reactpress/api'
    ? [[join(bin, 'nest'), ['build']]]
    : [
        [join(bin, 'tsc'), ['--noEmit', '-p', 'tsconfig.json']],
        [join(bin, 'vite'), ['build']],
      ];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, { cwd: appDir, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`[build] ${name} GAGAL pada: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`[build] ${name} selesai`);
