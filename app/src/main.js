// Vice City Nights — editor.
// Wires the controls in index.html to the cover engine in cover.js:
// photo slots, panel picking (click / chips), drag-to-pan and wheel zoom,
// caption editing, layout / grade / export-size switching, PNG export.
// Photos are read locally with FileReader and object URLs; nothing is
// uploaded anywhere. Deterministic `?shot=` states live in shots.js.

import { EXPORT_SIZES, THEMES, LAYOUTS, drawCover, panelAt } from './cover.js';
import { applyShot } from './shots.js';

const SAMPLES = ['samples/boulevard.jpg', 'samples/pier.jpg', 'samples/boulevard.jpg'];
const SAMPLE_NAMES = ['Boulevard (sample)', 'Pier (sample)', 'Boulevard (sample)'];

function freshCrop() {
  return { scale: 1, dx: 0, dy: 0 };
}

export function defaultState() {
  return {
    photos: [null, null, null],
    photoNames: ['Empty slot', 'Empty slot', 'Empty slot'],
    panelPhoto: [0, 1, 2],
    crops: [freshCrop(), freshCrop(), freshCrop()],
    caption: 'VICE CITY',
    caption2: 'NIGHTS',
    sub: 'Grand Theft Auto VI · Out Now',
    captionScale: 1,
    layout: 'nights',
    theme: 'sunset',
    size: 'wide',
    selectedPanel: 0,
  };
}

const state = defaultState();
const stage = document.getElementById('stage');
const stageCtx = stage.getContext('2d');

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function loadSample(slot) {
  const img = await loadImage(SAMPLES[slot]);
  state.photos[slot] = img;
  state.photoNames[slot] = SAMPLE_NAMES[slot];
  document.getElementById('name-' + slot).textContent = SAMPLE_NAMES[slot];
}

function render() {
  const size = EXPORT_SIZES[state.size];
  if (stage.width !== size.w || stage.height !== size.h) {
    stage.width = size.w;
    stage.height = size.h;
  }
  const view = {
    photos: state.photos,
    panelPhoto: state.panelPhoto,
    crops: state.crops,
    caption: state.caption + (state.caption2 ? '\n' + state.caption2 : ''),
    sub: state.sub,
    captionScale: state.captionScale,
    layout: state.layout,
    theme: state.theme,
  };
  drawCover(stageCtx, size.w, size.h, view);
  document.getElementById('size-readout').textContent =
    size.label + ' · ' + LAYOUTS[state.layout].label + ' · ' + THEMES[state.theme].label;
  document.getElementById('panel-readout').textContent =
    'Panel ' + (state.selectedPanel + 1) + ' selected — drag the photo to reposition';
  syncPanelControls();
}

function syncPanelControls() {
  const layout = LAYOUTS[state.layout];
  const chips = document.getElementById('panel-chips');
  chips.innerHTML = '';
  layout.panels.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = 'Panel ' + (i + 1);
    b.setAttribute('aria-pressed', String(i === state.selectedPanel));
    b.addEventListener('click', () => {
      state.selectedPanel = i;
      render();
    });
    chips.appendChild(b);
  });
  const slot = state.panelPhoto[state.selectedPanel] ?? 0;
  const crop = state.crops[slot];
  document.getElementById('panel-photo').value = String(slot);
  document.getElementById('zoom').value = String(Math.round(crop.scale * 100));
  document.getElementById('zoom-val').textContent = Math.round(crop.scale * 100) + '%';
  document.getElementById('dx').value = String(Math.round(crop.dx * 100));
  document.getElementById('dx-val').textContent = Math.round(crop.dx * 100);
  document.getElementById('dy').value = String(Math.round(crop.dy * 100));
  document.getElementById('dy-val').textContent = Math.round(crop.dy * 100);
}

function buildSeg(el, entries, current, onPick) {
  el.innerHTML = '';
  Object.entries(entries).forEach(([key, value]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'seg-btn';
    b.textContent = value.label;
    b.setAttribute('aria-pressed', String(key === current));
    b.addEventListener('click', () => {
      onPick(key);
      render();
      buildSeg(el, entries, key, onPick);
    });
    el.appendChild(b);
  });
}

function refreshSegs() {
  buildSeg(document.getElementById('layout-seg'), LAYOUTS, state.layout, (k) => {
    state.layout = k;
    state.selectedPanel = 0;
    refreshSegs();
  });
  buildSeg(document.getElementById('theme-seg'), THEMES, state.theme, (k) => {
    state.theme = k;
    refreshSegs();
  });
  buildSeg(document.getElementById('size-seg'), EXPORT_SIZES, state.size, (k) => {
    state.size = k;
    refreshSegs();
  });
}

function bindControls() {
  // Photo slots: file picker + sample button.
  for (let slot = 0; slot < 3; slot++) {
    const input = document.getElementById('file-' + slot);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      loadImage(url).then((img) => {
        state.photos[slot] = img;
        state.photoNames[slot] = file.name;
        document.getElementById('name-' + slot).textContent = file.name;
        render();
      });
    });
    document.querySelector('[data-sample="' + slot + '"]').addEventListener('click', () => {
      loadSample(slot).then(render);
    });
  }

  // Selected panel: which photo, zoom, offsets.
  document.getElementById('panel-photo').addEventListener('change', (e) => {
    state.panelPhoto[state.selectedPanel] = Number(e.target.value);
    render();
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    const slot = state.panelPhoto[state.selectedPanel];
    state.crops[slot].scale = Number(e.target.value) / 100;
    render();
  });
  document.getElementById('dx').addEventListener('input', (e) => {
    const slot = state.panelPhoto[state.selectedPanel];
    state.crops[slot].dx = Number(e.target.value) / 100;
    render();
  });
  document.getElementById('dy').addEventListener('input', (e) => {
    const slot = state.panelPhoto[state.selectedPanel];
    state.crops[slot].dy = Number(e.target.value) / 100;
    render();
  });

  // Caption.
  document.getElementById('caption').addEventListener('input', (e) => {
    state.caption = e.target.value.toUpperCase();
    render();
  });
  document.getElementById('caption-2').addEventListener('input', (e) => {
    state.caption2 = e.target.value.toUpperCase();
    render();
  });
  document.getElementById('sub').addEventListener('input', (e) => {
    state.sub = e.target.value;
    render();
  });
  document.getElementById('cap-size').addEventListener('input', (e) => {
    state.captionScale = Number(e.target.value) / 100;
    document.getElementById('cap-val').textContent = e.target.value + '%';
    render();
  });

  // Canvas: click to select a panel, drag to pan its photo, wheel to zoom.
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  stage.addEventListener('pointerdown', (e) => {
    const r = stage.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * stage.width;
    const py = ((e.clientY - r.top) / r.height) * stage.height;
    const hit = panelAt(state, stage.width, stage.height, px, py);
    if (hit >= 0) {
      state.selectedPanel = hit;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
      render();
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = stage.getBoundingClientRect();
    const slot = state.panelPhoto[state.selectedPanel];
    const crop = state.crops[slot];
    crop.dx += ((e.clientX - lastX) / r.width) * (stage.width / (stage.width * 0.6));
    crop.dy += ((e.clientY - lastY) / r.height) * (stage.height / (stage.height * 0.6));
    crop.dx = Math.max(-0.6, Math.min(0.6, crop.dx));
    crop.dy = Math.max(-0.6, Math.min(0.6, crop.dy));
    lastX = e.clientX;
    lastY = e.clientY;
    render();
  });
  stage.addEventListener('pointerup', () => { dragging = false; });
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const slot = state.panelPhoto[state.selectedPanel];
    const crop = state.crops[slot];
    crop.scale = Math.max(1, Math.min(2.6, crop.scale * (e.deltaY < 0 ? 1.08 : 0.93)));
    render();
  }, { passive: false });

  // Export: render the same cover at full size and download it.
  document.getElementById('export-btn').addEventListener('click', () => {
    const size = EXPORT_SIZES[state.size];
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    const octx = off.getContext('2d');
    drawCover(octx, size.w, size.h, {
      photos: state.photos,
      panelPhoto: state.panelPhoto,
      crops: state.crops,
      caption: state.caption + (state.caption2 ? '\n' + state.caption2 : ''),
      sub: state.sub,
      captionScale: state.captionScale,
      layout: state.layout,
      theme: state.theme,
    });
    off.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vice-city-nights-' + state.size + '.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  });
}

async function boot() {
  bindControls();
  refreshSegs();
  // Default photos: the two bundled samples, so the cover is alive on load.
  try { await loadSample(0); } catch (e) { /* sample missing: panel stays gradient */ }
  try { await loadSample(1); } catch (e) { /* sample missing: panel stays gradient */ }
  state.panelPhoto = [0, 1, 0];
  render();
  // Deterministic screenshot states (?shot=...) override the defaults.
  const params = new URLSearchParams(window.location.search);
  if (params.has('shot')) {
    await applyShot(state, params, loadSample);
    refreshSegs();
    render();
    document.title = 'shot:' + (params.get('shot') || '');
  }
}

boot();
