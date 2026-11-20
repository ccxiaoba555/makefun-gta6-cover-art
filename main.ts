// Vice City Nights — a gta6-cover-art-01 entry (Node 22, standard library only).
//
// The app is this directory's app/ folder: plain static files a desktop browser
// loads offline (app/index.html and its ES modules, one OFL display font, no
// library, no network request). This program hands it in: it copies app/ and
// screenshots/ from beside this file into /output and writes /output/dossier.json
// with the vendored make.fun library (vendor/makefun-app.ts, byte-identical).
//
// Output-directory safety (the fix for the round-3 run_completes refusal):
// in the grading sandbox /output is a root-owned mount point and the grader
// runs as uid 65534, so deleting the directory itself fails with EPERM and the
// run exits 1. This program therefore NEVER removes the output directory. It
// only removes the directory's *contents*, one entry at a time, then writes
// fresh files into the directory that is still there. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Create the output directory if it is missing, then empty only its contents.
// The directory itself is never removed: in the grading sandbox it is a
// root-owned mount point the unprivileged grader cannot delete (EPERM).
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Vice City Nights handed in to ${out}`);
