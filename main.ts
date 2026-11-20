// Vice City Nights — hand-in program for the gta6-cover-art-01 entry.
//
// The entry itself is the static web app in app/ (index.html, style.css, ES
// modules, one OFL display font, two sample photos; zero network requests,
// no build step). This program stages it for grading: it copies app/ and
// screenshots/ into the output directory and writes /output/dossier.json
// through the vendored make.fun helper (vendor/makefun-app.ts, untouched).
//
// Output-directory safety: in the grading sandbox /output is a root-owned
// mount point and the grader runs as uid 65534, so removing the directory
// itself fails with EPERM and the run exits 1. This program therefore only
// ever clears the *contents* of the output directory, one entry at a time,
// and never removes the directory. Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Make sure the directory exists, then empty only what is inside it.
// The directory itself is never deleted (see the header comment).
function emptyContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

emptyContents(out);

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
const shotsDir = join(out, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), shotsDir, { recursive: true });
}

// Caps the scorer enforces (see the kit's reference/gate.json): the text cap
// shapes dossier bytes; the rest refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files in app/
// or 48 MiB of app files in all; an app/ path over 1000 bytes).
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
