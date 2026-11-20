// Vice City Nights v7 — entry program (make.fun gta6-cover-art-01).
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-app.ts.
// Node standard library only; runs as `node main.ts`, no build step.
//
// The output directory itself is NEVER removed: in the grading sandbox
// /output is a mount point owned by another user, so deleting it fails
// with EPERM. Only its contents are cleared, then rewritten.

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function clearContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const from = join(src, entry.name);
    const to = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
    }
  }
}

function main(): void {
  clearContents(outputDir);
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    copyTree(shotsDir, join(outputDir, 'screenshots'));
  }
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`Vice City Nights v7 wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
}

main();
