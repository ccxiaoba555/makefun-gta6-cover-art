[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice City Nights — multi-panel GTA 6-style cover art maker

Turn your own photos into a GTA 6-style multi-panel poster: a big tilted hero
panel, two stacked side panels, a Vice City sunset grade with neon pink and cyan,
original vector skyline and palm silhouettes, and heavy Archivo Black caption
lettering with outline and drop shadow. GTA VI is out now — this is a fan-made
way to make your own poster for it.

## What it does

- **Multi-panel poster** — four layouts (Diagonal hero, Triptych, Stack,
  Billboard), thick neon-framed panels, a slatted sun disc with glow, and
  vector skyline/palms drawn fresh on canvas.
- **Colour grades** — three presets (Sunset, Neon Nights, Dawn) plus grade,
  neon glow, and film grain sliders. The grain is a seeded tile, so preview
  and export look identical.
- **Any photo** — upload 1–3 of your own photos (they never leave your browser),
  assign any photo to any panel, drag to reposition, scroll to zoom, or tune
  zoom/shift with sliders. One photo can fill several panels.
- **Caption** — edit the headline and sub-caption, pick solid or hollow outline
  lettering, and set size, height, tilt, and letter spacing. Two free sample
  photos ship in `app/samples/` so it works immediately.
- **Fast export** — one click downloads a PNG at **1080×1080**, **1080×1350**, or
  **1920×1080**.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: every script, font, and image is a file
under `app/`. The display font is Archivo Black (SIL Open Font License 1.1,
see `app/fonts/OFL.txt`).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json`. It only ever clears the *contents* of the output directory —
never the directory itself — so it works when the output path is a mount point
owned by another user.

## Fan-made

Not affiliated with, endorsed by, or connected to Rockstar Games or Take-Two
Interactive. No Rockstar logo, wordmark, official artwork, character, or font is
used: the skyline, palms, and lettering are original work.

Entered on [make.fun](https://make.fun/?ref=steady-ibis-93&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
