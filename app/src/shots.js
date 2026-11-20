// Screenshot scenes for Vice City Nights.
// Parses the ?shot= query string into one plain preset object so main.js can
// set up a fixed, repeatable scene (layout, grade, caption, export size) and
// headless Chromium can screenshot it. No drawing happens here.

export const SHOT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** Reads layout / grade / caption / subtitle / size out of a URLSearchParams. */
export function shotPreset(query) {
  const size = SHOT_SIZES[query.get('size') ?? ''] ?? null;
  return {
    photo: query.get('photo') ?? 'boulevard',
    photo2: query.get('photo2') ?? 'pier',
    layout: query.get('layout') ?? null,
    grade: query.get('grade') ?? null,
    caption: query.get('caption') ?? null,
    sub: query.get('sub') ?? null,
    size,
    sizeName: query.get('size') ?? null,
  };
}

/** Marks the page ready for a screenshot once two frames have painted. */
export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
