# Vice City Nights — multi-panel GTA 6-style cover art maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your own photos into a multi-panel GTA-style poster. **Vice City Nights**
draws a sunset sky, a synthwave sun, vector skyline and palm silhouettes in
canvas, lays your photos into tilted panels with thick borders, and sets a big
outlined caption over the top — then exports a PNG in the post size you pick.

## What it does

- **The art** — hero panel + two smaller panels (Billboard, Triptych or
  Diagonal layouts), Vice City sunset / Neon Nights / Midnight grades, bold
  Russo One caption with dark outline and neon drop shadow, vignette + grain.
  The skyline and palms are original vector silhouettes drawn in code.
- **Any photo** — upload 1–3 of your own photos, one per panel; drag a photo
  inside its panel to reposition it, zoom per panel, edit the caption text,
  size and height. Two free sample photos ship as defaults.
- **Fast and easy** — photo → PNG in three steps; exports **1080×1080**,
  **1080×1350** and **1920×1080** PNG.
- **Polish** — live preview, clear editor, deterministic screenshot states
  (`?shot=cover|editor`) for reproducible captures.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Static files only, no build step, no network requests: every script, style,
font and sample image lives under `app/`. Photos are read on your machine and
never uploaded.

## Files

- `app/index.html` — the editor page
- `app/style.css` — dark neon editor chrome
- `app/src/cover.js` — the poster drawing engine (sky, sun, skyline, palms,
  panels, caption, grain)
- `app/src/main.js` — editor wiring: uploads, drag-to-reposition, export
- `app/src/shots.js` — deterministic `?shot=` states for screenshots
- `app/fonts/RussoOne.ttf` — Russo One (SIL OFL 1.1, see `app/fonts/OFL.txt`)
- `main.ts` — hands the entry in: copies `app/` + `screenshots/` to `/output`
  and writes `/output/dossier.json`
- `shots.json` — the four screenshot definitions

Original fan-style art: no Rockstar logo, wordmark, official artwork,
character or game font is used anywhere.

---

Entered on [make.fun](https://make.fun/?ref=steady-ibis-93&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
