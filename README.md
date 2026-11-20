# Vice City Nights — multi-panel GTA 6-style cover maker

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your own photos into a multi-panel GTA 6-style poster — hero panel plus two
smaller tilted panels, a retro Vice City sunset with a vector skyline and palm
silhouettes, and bold condensed lettering with a neon outline. GTA VI is out
(released 19 Nov 2026), so this is art about the real Vice City: Leonida, 2026.

Everything runs offline in the browser. Photos are read on your machine and never
uploaded. No build step, no network requests, no Rockstar artwork, logo,
character or font anywhere — the skyline, palms, sun and grain are all drawn
procedurally on canvas, and the display type is the OFL-licensed Anton.

## What it does

- **Multi-panel poster** — three layouts (Vice City Nights hero + two, Split,
  three vertical Strips), panels tilted with thick keyline borders, a diagonal
  neon slash across the hero panel.
- **Any photo** — upload 1–3 of your own photos, one per panel; drag on the
  preview to reposition, scroll to zoom, or fill all panels with one photo.
  Two free sample photos ship as defaults.
- **Lettering** — edit the title and sub-line, resize the title; Anton with a
  neon outline, glow and drop shadow over a skyline title band.
- **Colour grades** — Sunset (orange/pink), Neon (pink/cyan), Midnight (blue/gold),
  plus film grain and vignette toggles.
- **Fast export** — one click exports a PNG in 1080 × 1080, 1080 × 1350 or
  1920 × 1080.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Pick a panel, load a photo (or a sample), drag it into place, type a title,
hit an export size. That's the whole flow.

## Screenshots

- `screenshots/1-cover.jpg` — landscape 1920 × 1080 exported cover
- `screenshots/2-editor.jpg` — the editor with a photo loaded
- `screenshots/3-cover.jpg` — portrait 1080 × 1350 exported cover (Strip, Neon)
- `screenshots/4-cover.jpg` — square 1080 × 1080 exported cover (Split, Midnight)

## Notes

Fan-made cover maker, not affiliated with Rockstar Games. Sample photos were
made for make.fun with an image model and are free to use. Anton Regular is
licensed under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).

Entered on [make.fun](https://make.fun/?ref=102db11r&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
