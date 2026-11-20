// Deterministic screenshot states for headless captures.
// The page reads ?shot=... and renders one fixed state, so every
// screenshot is reproducible: same photos, same caption, same grade.
//
//   ?shot=cover&ratio=landscape   full-bleed exported-style cover
//   ?shot=cover&ratio=portrait    tall cover (1080x1350 look)
//   ?shot=cover&ratio=square      square cover (1080x1080 look)
//   ?shot=editor                  the editor with sample photos loaded

export const SHOT_RATIOS = {
  landscape: { w: 1920, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  square: { w: 1080, h: 1080 },
};

export function parseShot(search) {
  const params = new URLSearchParams(search || '');
  const shot = params.get('shot') || '';
  const ratio = params.get('ratio') || 'landscape';
  const layout = params.get('layout') || '';
  const grade = params.get('grade') || '';
  return { shot, ratio, layout, grade };
}

export function isShotMode(search) {
  return parseShot(search).shot !== '';
}

// Fixed cover states used by the screenshots. The caption differs per
// ratio only in size/placement, so each exported size reads well.
export function shotCoverState(ratio, layout, grade) {
  const base = {
    caption: 'VICE CITY',
    subcaption: 'NIGHTS',
    captionSize: 1,
    captionY: 0.83,
    grade: grade || 'sunset',
    layout: layout || 'billboard',
    panels: [
      { zoom: 1.05, ox: 0, oy: 0 },
      { zoom: 1.1, ox: 0, oy: -0.04 },
      { zoom: 1, ox: 0.03, oy: 0 },
    ],
  };
  if (ratio === 'portrait') {
    base.captionSize = 0.92;
    base.captionY = 0.86;
    base.layout = layout || 'billboard';
  }
  if (ratio === 'square') {
    base.captionSize = 0.95;
    base.captionY = 0.84;
    base.layout = layout || 'triptych';
    base.grade = grade || 'neon';
  }
  return base;
}

export function shotEditorState() {
  return {
    caption: 'VICE CITY',
    subcaption: 'NIGHTS',
    captionSize: 1,
    captionY: 0.83,
    grade: 'sunset',
    layout: 'billboard',
    panels: [
      { zoom: 1.05, ox: 0, oy: 0 },
      { zoom: 1.1, ox: 0, oy: -0.04 },
      { zoom: 1, ox: 0.03, oy: 0 },
    ],
  };
}
