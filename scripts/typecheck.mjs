/**
 * Typecheck per workspace.
 *
 * Workspace yang belum punya file sumber dilewati (bukan error) supaya pipeline
 * hijau sejak tahap paling awal.Begitu sumber muncul, `tsc --noEmit` dijalankan.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const tsc = join(root, 'node_modules', '.bin', 'tsc');

const workspaces = [
  'packages/types',
  'packages/ui',
  'packages/blocks',
  'apps/api',
  'apps/admin',
  'apps/web',
];

function hasSources(dir) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { recursive: true }).some((entry) => {
    if (typeof entry !== 'string') return false;
    return /\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts');
  });
}

let failed = 0;

for (const workspace of workspaces) {
  const dir = resolve(root, workspace);
  if (!hasSources(resolve(dir, 'src')) && !hasSources(resolve(dir, 'pages'))) {
    console.log(`[typecheck] ${workspace} — belum ada sumber, dilewati`);
    continue;
  }

  console.log(`[typecheck] ${workspace}`);
  const result = spawnSync(tsc, ['--noEmit', '-p', 'tsconfig.json'], {
    cwd: dir,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    failed += 1;
    console.error(`[typecheck] ${workspace} GAGAL`);
  }
}

if (failed > 0) {
  console.error(`[typecheck] ${failed} workspace gagal`);
  process.exit(1);
}

console.log('[typecheck] semua workspace hijau');
