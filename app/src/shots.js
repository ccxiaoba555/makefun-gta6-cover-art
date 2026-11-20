// Vice City Nights — deterministic screenshot states.
// `?shot=cover&size=wide&caption=...` renders one fixed cover or editor
// state so headless Chromium can screenshot the app repeatably. Only used
// for the entry's own screenshots; the normal app ignores these params.

export const SHOT_PRESETS = {
  cover: {
    layout: 'nights', theme: 'sunset', size: 'wide',
    caption: 'VICE CITY', caption2: 'NIGHTS',
    sub: 'Grand Theft Auto VI · Out Now',
    captionScale: 1, panelPhoto: [0, 1, 0],
  },
  'cover-portrait': {
    layout: 'nights', theme: 'neon', size: 'portrait',
    caption: 'VICE CITY', caption2: 'AFTER DARK',
    sub: 'Grand Theft Auto VI · Out Now',
    captionScale: 1, panelPhoto: [1, 0, 1],
  },
  'cover-square': {
    layout: 'strip', theme: 'midnight', size: 'square',
    caption: 'LEONIDA', caption2: 'NIGHTS',
    sub: 'Grand Theft Auto VI · Out Now',
    captionScale: 0.95, panelPhoto: [0, 1, 0],
  },
  editor: {
    layout: 'nights', theme: 'sunset', size: 'wide',
    caption: 'VICE CITY', caption2: 'NIGHTS',
    sub: 'Grand Theft Auto VI · Out Now',
    captionScale: 1, panelPhoto: [0, 1, 0],
  },
};

// Apply a shot preset (plus any query overrides) to the editor state.
// `loadSample` loads a bundled sample photo into a slot. Cover shots hide
// the editor chrome so the screenshot is the exported cover itself.
export async function applyShot(state, params, loadSample) {
  const name = params.get('shot') || 'cover';
  const preset = SHOT_PRESETS[name] || SHOT_PRESETS.cover;
  state.layout = params.get('layout') || preset.layout;
  state.theme = params.get('theme') || preset.theme;
  state.size = params.get('size') || preset.size;
  state.caption = (params.get('caption') || preset.caption).toUpperCase();
  state.caption2 = (params.get('caption2') || preset.caption2 || '').toUpperCase();
  state.sub = params.get('sub') || preset.sub;
  state.captionScale = Number(params.get('capscale') || preset.captionScale);
  state.panelPhoto = preset.panelPhoto.slice();
  state.selectedPanel = 0;
  // A cover shot shows the bare cover; an editor shot keeps the UI.
  if (name === 'cover' || name === 'cover-portrait' || name === 'cover-square') {
    document.body.classList.add('shot-cover');
  }
  // Load the samples the panels need (slots 0 and 1 cover every preset).
  try { await loadSample(0); } catch (e) { /* keep the gradient panel */ }
  try { await loadSample(1); } catch (e) { /* keep the gradient panel */ }
  if (state.panelPhoto.includes(2)) {
    try { await loadSample(2); } catch (e) { /* keep the gradient panel */ }
  }
}
