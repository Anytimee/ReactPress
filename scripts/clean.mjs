/**
 * Bersihkan seluruh artefak build pada semua workspace.
 */
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targets = [
  'packages/types/dist',
  'packages/ui/dist',
  'packages/blocks/dist',
  'apps/api/dist',
  'apps/admin/dist',
  'apps/web/dist',
  'apps/web/.vike',
];

for (const target of targets) {
  rmSync(resolve(root, target), { recursive: true, force: true });
  console.log(`[clean] ${target}`);
}
