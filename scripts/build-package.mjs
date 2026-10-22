/**
 * Build satu package (ESM + CJS + deklarasi + marker package.json).
 *
 * Dijalankan dari folder package: `npm run build -w @reactpress/types`.
 * Package tanpa file sumber dilewati tanpa error.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const packageDir = process.cwd();
const root = resolve(import.meta.dirname, '..');
const tsc = join(root, 'node_modules', '.bin', 'tsc');

function hasSources(dir) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { recursive: true }).some(
    (entry) => typeof entry === 'string' && /\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts'),
  );
}

if (!hasSources(resolve(packageDir, 'src'))) {
  console.log(`[build] ${packageDir} belum ada sumber, dilewati`);
  process.exit(0);
}

const steps = [
  [tsc, ['-p', 'tsconfig.build.json']],
  [tsc, ['-p', 'tsconfig.cjs.json']],
  [process.execPath, [join(root, 'scripts', 'finalize-dist.mjs')]],
];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, { cwd: packageDir, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`[build] ${packageDir} GAGAL pada: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`[build] ${packageDir} selesai`);
