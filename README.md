# Vice City Nights — multi-panel GTA 6-style cover maker

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your own photos into a multi-panel **Vice City Nights** cover in the
style of a GTA 6 poster — a tilted hero panel plus smaller panels over an
original vector sunset skyline, with big condensed Bebas Neue caption
lettering, a neon sun, palms, grain and vignette — and export it as a PNG
to share. GTA VI is out now, so the default caption celebrates the launch.

## What it does

- **Multi-panel poster art**: three layouts (Vice Nights, Ocean Strip,
  Spotlight) with tilted panels, thick white frames and drop shadows over
  a hand-drawn sunset: slatted neon sun, skyline with lit windows, palm
  silhouettes, sea reflections, grain and vignette.
- **Any photo**: upload 1–3 of your own photos, or use the two bundled
  samples. Click a panel to select it, drag inside it to reposition its
  photo, scroll to zoom, or use the zoom / move sliders. One photo can
  fill several panels.
- **Caption**: edit the main line, second line, ribbon line
  ("Grand Theft Auto VI · Out Now") and lettering size. The lettering has
  a neon echo, dark outline and drop shadow.
- **Fast and easy**: photo → PNG in a few clicks. Export sizes
  1080×1080, 1080×1350 and 1920×1080.
- **Offline**: static files under `app/` only, zero network requests.
  Photos are read on your machine and never uploaded. No build step.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Pick photos, choose a layout and grade, edit the caption, hit
**Download PNG**. Screenshot states for the entry live in `shots.json`
(`?shot=cover|editor|cover-portrait|cover-square`).

## Notes

- Fan-made tribute. Not affiliated with Rockstar Games. No Rockstar logo,
  artwork, character or font is used anywhere in the app.
- Display type is Bebas Neue, licensed under the SIL Open Font License
  1.1 — see `app/fonts/OFL.txt`.
- The skyline, palms, sun and grain are original vector art drawn in
  canvas by `app/src/cover.js`.
- `main.ts` hands the entry in: it copies `app/` + `screenshots/` to the
  output directory and writes `dossier.json` via `vendor/makefun-app.ts`.

Entered on [make.fun](https://make.fun/?ref=102db11r&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
