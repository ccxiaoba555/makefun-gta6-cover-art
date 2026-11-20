// Vice City Nights — entry program (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-app.ts, exactly as the bounty scorer recomputes it.
// Run locally: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
// The grader runs it with /output as the target instead.

import { buildDossier } from './vendor/makefun-app.ts';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

function copyTreeInto(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir)) {
    const src = join(srcDir, entry);
    const dest = join(destDir, entry);
    if (statSync(src).isDirectory()) {
      copyTreeInto(src, dest);
    } else {
      cpSync(src, dest);
    }
  }
}

function handIn() {
  // Start from an empty output directory so two runs write identical bytes.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir)) throw new Error('missing app/ in ' + repoRoot);
  copyTreeInto(appDir, join(outDir, 'app'));
  if (existsSync(shotsDir)) copyTreeInto(shotsDir, join(outDir, 'screenshots'));

  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
