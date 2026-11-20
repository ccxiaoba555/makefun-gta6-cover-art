// Vice City Nights — editor wiring.
// Loads photos, binds every control, drags photos inside their panels,
// and exports the poster as a PNG in the three post sizes.

import { drawCover, defaultState, panelRects, GRADES, LAYOUTS } from './cover.js';
import { parseShot, shotCoverState, shotEditorState, SHOT_RATIOS } from './shots.js';

const EXPORT_SIZES = [
  { key: 'square', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { key: 'portrait', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { key: 'wide', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

const SAMPLES = ['samples/boulevard.jpg', 'samples/pier.jpg', 'samples/boulevard.jpg'];

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const statusEl = $('status');

let state = defaultState();
let photos = [null, null, null];
let exportSize = EXPORT_SIZES[2];
let lastRects = [];
let drag = null;

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function previewSize() {
  const ratio = $('ratioSelect') ? $('ratioSelect').value : 'wide';
  const size = ratio === 'portrait'
    ? { w: 1080, h: 1350 }
    : ratio === 'square'
      ? { w: 1080, h: 1080 }
      : { w: 1920, h: 1080 };
  const scale = 960 / size.w;
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function render() {
  const shot = parseShot(window.location.search);
  if (shot.shot === 'cover') {
    stage.width = window.innerWidth;
    stage.height = window.innerHeight;
    const coverState = shotCoverState(shot.ratio, shot.layout, shot.grade);
    lastRects = drawCover(stage, coverState, photos);
    return;
  }
  const size = previewSize();
  stage.width = size.w;
  stage.height = size.h;
  lastRects = drawCover(stage, state, photos);
}

function syncControls() {
  $('captionInput').value = state.caption;
  $('subInput').value = state.subcaption;
  $('sizeRange').value = String(state.captionSize);
  $('sizeVal').textContent = `${Math.round(state.captionSize * 100)}%`;
  $('yRange').value = String(state.captionY);
  $('yVal').textContent = `${Math.round(state.captionY * 100)}%`;
  for (let i = 0; i < 3; i++) {
    $(`zoom${i}`).value = String(state.panels[i].zoom);
    $(`zoomVal${i}`).textContent = `${Math.round(state.panels[i].zoom * 100)}%`;
  }
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
    b.setAttribute('aria-pressed', String(b.dataset.grade === state.grade));
  });
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout));
  });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.classList.toggle('active', b.dataset.export === exportSize.key);
  });
}

function bindControls() {
  $('captionInput').addEventListener('input', (e) => {
    state.caption = e.target.value;
    render();
  });
  $('subInput').addEventListener('input', (e) => {
    state.subcaption = e.target.value;
    render();
  });
  $('sizeRange').addEventListener('input', (e) => {
    state.captionSize = Number(e.target.value);
    $('sizeVal').textContent = `${Math.round(state.captionSize * 100)}%`;
    render();
  });
  $('yRange').addEventListener('input', (e) => {
    state.captionY = Number(e.target.value);
    $('yVal').textContent = `${Math.round(state.captionY * 100)}%`;
    render();
  });
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.addEventListener('click', () => {
      if (GRADES[b.dataset.grade]) {
        state.grade = b.dataset.grade;
        syncControls();
        render();
      }
    });
  });
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.addEventListener('click', () => {
      if (LAYOUTS.includes(b.dataset.layout)) {
        state.layout = b.dataset.layout;
        syncControls();
        render();
      }
    });
  });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', () => {
      exportSize = EXPORT_SIZES.find((s) => s.key === b.dataset.export) || EXPORT_SIZES[2];
      syncControls();
      setStatus(`Export size: ${exportSize.label}. Press Download PNG.`);
    });
  });
  $('ratioSelect').addEventListener('change', render);
  for (let i = 0; i < 3; i++) {
    $(`file${i}`).addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const url = URL.createObjectURL(file);
        photos[i] = await loadImage(url);
        setStatus(`Panel ${i + 1}: loaded ${file.name}. Drag the photo to reposition it.`);
        render();
      } catch {
        setStatus(`Panel ${i + 1}: that file could not be read as a photo.`);
      }
    });
    $(`sample${i}`).addEventListener('click', async () => {
      try {
        photos[i] = await loadImage(SAMPLES[i]);
        setStatus(`Panel ${i + 1}: sample photo loaded.`);
        render();
      } catch {
        setStatus(`Panel ${i + 1}: sample photo failed to load.`);
      }
    });
    $(`zoom${i}`).addEventListener('input', (e) => {
      state.panels[i].zoom = Number(e.target.value);
      $(`zoomVal${i}`).textContent = `${Math.round(state.panels[i].zoom * 100)}%`;
      render();
    });
  }
  $('resetBtn').addEventListener('click', async () => {
    state = defaultState();
    await loadSamples();
    syncControls();
    render();
    setStatus('Reset to the sample poster.');
  });
  $('downloadBtn').addEventListener('click', () => {
    const off = document.createElement('canvas');
    off.width = exportSize.w;
    off.height = exportSize.h;
    drawCover(off, state, photos);
    off.toBlob((blob) => {
      if (!blob) {
        setStatus('Export failed: the browser could not write the PNG.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-city-nights-${exportSize.w}x${exportSize.h}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${exportSize.label} PNG — check your downloads.`);
    }, 'image/png');
  });
}

// Drag a photo inside its own panel: pointer down picks the panel under
// the cursor, pointer move shifts that panel's photo offset.
function bindDrag() {
  const toCanvas = (e) => {
    const r = stage.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * stage.width,
      y: ((e.clientY - r.top) / r.height) * stage.height,
    };
  };
  stage.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const rects = panelRects(stage.width, stage.height, state.layout);
    for (let i = rects.length - 1; i >= 0; i--) {
      const panel = rects[i];
      if (p.x >= panel.x * stage.width && p.x <= (panel.x + panel.w) * stage.width
        && p.y >= panel.y * stage.height && p.y <= (panel.y + panel.h) * stage.height) {
        drag = { panel: i, startX: p.x, startY: p.y, ox: state.panels[i].ox, oy: state.panels[i].oy };
        stage.setPointerCapture(e.pointerId);
        stage.style.cursor = 'grabbing';
        setStatus(`Dragging panel ${i + 1} — move to reposition its photo.`);
        return;
      }
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toCanvas(e);
    const panel = lastRects[drag.panel];
    if (!panel) return;
    const pw = panel.w * stage.width;
    const ph = panel.h * stage.height;
    state.panels[drag.panel].ox = drag.ox + (p.x - drag.startX) / pw;
    state.panels[drag.panel].oy = drag.oy + (p.y - drag.startY) / ph;
    render();
  });
  const endDrag = () => {
    if (drag) setStatus(`Panel ${drag.panel + 1} repositioned.`);
    drag = null;
    stage.style.cursor = 'grab';
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
}

async function loadSamples() {
  const loaded = await Promise.all(
    SAMPLES.map((src) => loadImage(src).catch(() => null)),
  );
  photos = loaded;
}

async function boot() {
  const shot = parseShot(window.location.search);
  if (shot.shot === 'cover') {
    document.body.classList.add('shot-cover');
    await loadSamples();
    window.addEventListener('resize', render);
    render();
    return;
  }
  if (shot.shot === 'editor') {
    state = shotEditorState();
  }
  await loadSamples();
  bindControls();
  bindDrag();
  syncControls();
  render();
  setStatus('Sample photos loaded — swap any panel with your own photo, then Download PNG.');
  window.addEventListener('resize', render);
}

boot().catch((err) => {
  setStatus(`The editor could not start: ${err.message}`);
});
