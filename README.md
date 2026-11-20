[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ccxiaoba555/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice City Nights — GTA-style cover maker

GTA VI is out (19 November 2026). Vice City Nights is a free, offline web app
that turns your own photos into a multi-panel GTA-style poster — the kind of
cover you'd post in launch week — and exports it as a PNG ready to share.

## What it does

- **Three photos, three panels.** Load up to three photos from your machine
  (they never leave it). Each panel takes any photo, or the built-in sunset
  art if a panel has none. Two sample photos ship with the app so you can try
  it with one click.
- **Crop by dragging.** Click a panel to select it, drag the photo inside the
  preview to reposition it, and use the zoom slider to frame it.
- **Three layouts.** Hero + two panels, a tilted trio, and a polaroid spread
  over a full-bleed photo.
- **Three colour grades.** Sunset, Neon nights, and Palm noir — plus a
  vector skyline and palm strip, film grain and a vignette, all drawn in code.
- **Your words.** Edit the big condensed title and the subtitle, resize the
  title and move it top or bottom. The lettering is Anton (SIL Open Font
  License, vendored under `app/fonts/` with its licence text).
- **One-click export.** Square 1080 × 1080, portrait 1080 × 1350, or wide
  1920 × 1080 PNG — photo to PNG in a few steps.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. No build step, no
network requests: every script, font and image is a file under `app/`.

## Screenshots

- `screenshots/1-cover.jpg` — a wide 1920 × 1080 cover the app exported.
- `screenshots/2-editor.jpg` — the editor with a photo loaded.
- `screenshots/3-cover.jpg` — a portrait 1080 × 1350 cover, tilted layout, neon grade.
- `screenshots/4-cover.jpg` — a square 1080 × 1080 cover, polaroid layout.

## Fan-made

This is a fan-made tool. It is not affiliated with, endorsed by, or connected
to Rockstar Games. It uses no Rockstar logo, wordmark, official artwork,
character or font — the skyline, palms, sun and lettering are all original
work drawn in code, and the photos are the maker's samples or your own.

## License

MIT — see `LICENSE`.

---

Entered on [make.fun](https://make.fun/?ref=102db11r&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
