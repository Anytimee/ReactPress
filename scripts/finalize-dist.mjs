/**
 * Finalisasi output build package:
 *  - dist/esm/package.json -> {"type":"module"}
 *  - dist/cjs/package.json -> {"type":"commonjs"}
 *  - dist/tokens.css       -> salinan dari src/tokens.css (kalau ada)
 *
 * Dijalankan dari root folder package (npm run build).
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const esmDir = resolve(dist, 'esm');
const cjsDir = resolve(dist, 'cjs');

if (!existsSync(esmDir) || !existsSync(cjsDir)) {
  console.error(`[finalize-dist] output build tidak lengkap di ${dist}`);
  process.exit(1);
}

writeFileSync(resolve(esmDir, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
writeFileSync(
  resolve(cjsDir, 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);

const cssSource = resolve(root, 'src', 'tokens.css');
if (existsSync(cssSource)) {
  copyFileSync(cssSource, resolve(dist, 'tokens.css'));
}

console.log(`[finalize-dist] ${root} siap dipakai (esm + cjs)`);
