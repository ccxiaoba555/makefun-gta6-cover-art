// Vice City Nights editor: pick photos per panel, drag to reposition, zoom,
// choose layout + grade + lettering, export the cover in three PNG sizes.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, defaultState, panelAt, EXPORT_SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionEl = document.getElementById('caption');
const subEl = document.getElementById('sub');
const statusEl = document.getElementById('status');
const zoomEl = document.getElementById('zoom');
const state = defaultState();
let selected = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

function redraw() {
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function selectPanel(i) {
  selected = i;
  document.querySelectorAll('.panel-btn').forEach((b) => {
    b.classList.toggle('is-active', Number(b.dataset.panel) === i);
  });
  zoomEl.value = String(state.panels[i].zoom || 1);
  redraw();
}

document.querySelectorAll('.panel-btn').forEach((b) => {
  b.addEventListener('click', () => selectPanel(Number(b.dataset.panel)));
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.panels[selected].img = await loadImage(URL.createObjectURL(file));
  state.panels[selected].zoom = 1;
  state.panels[selected].ox = 0;
  state.panels[selected].oy = 0;
  zoomEl.value = '1';
  statusEl.textContent = `Photo loaded into panel ${selected + 1}.`;
  redraw();
});

async function loadSample(name) {
  state.panels[selected].img = await loadImage(`samples/${name}.jpg`);
  state.panels[selected].zoom = 1;
  state.panels[selected].ox = 0;
  state.panels[selected].oy = 0;
  zoomEl.value = '1';
  statusEl.textContent = `Sample "${name}" loaded into panel ${selected + 1}.`;
  redraw();
}
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));

document.getElementById('fill-all').addEventListener('click', () => {
  const src = state.panels[selected];
  if (!src.img) { statusEl.textContent = 'Load a photo into the selected panel first.'; return; }
  state.panels.forEach((p) => { p.img = src.img; p.zoom = src.zoom; p.ox = src.ox; p.oy = src.oy; });
  statusEl.textContent = 'Same photo filled all three panels.';
  redraw();
});
document.getElementById('clear-panel').addEventListener('click', () => {
  state.panels[selected] = { img: null, zoom: 1, ox: 0, oy: 0 };
  zoomEl.value = '1';
  statusEl.textContent = `Panel ${selected + 1} cleared.`;
  redraw();
});

zoomEl.addEventListener('input', () => {
  state.panels[selected].zoom = Number(zoomEl.value);
  redraw();
});

// Drag to reposition the selected panel's photo; wheel to zoom it.
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(state, p.x, p.y, canvas.width, canvas.height);
  if (hit >= 0) selectPanel(hit);
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = canvas.getBoundingClientRect();
  const panel = state.panels[selected];
  panel.ox = Math.max(-1, Math.min(1, panel.ox + ((e.clientX - lastX) / r.width) * 2));
  panel.oy = Math.max(-1, Math.min(1, panel.oy + ((e.clientY - lastY) / r.height) * 2));
  lastX = e.clientX;
  lastY = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selected];
  panel.zoom = Math.max(1, Math.min(2.5, panel.zoom - Math.sign(e.deltaY) * 0.1));
  zoomEl.value = String(panel.zoom);
  redraw();
}, { passive: false });

document.getElementById('layout').addEventListener('change', (e) => { state.layout = e.target.value; redraw(); });
document.getElementById('grade').addEventListener('change', (e) => { state.grade = e.target.value; redraw(); });
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
captionEl.addEventListener('input', () => { state.caption = captionEl.value; redraw(); });
subEl.addEventListener('input', () => { state.sub = subEl.value; redraw(); });
document.getElementById('title-size').addEventListener('input', (e) => { state.titleSize = Number(e.target.value); redraw(); });

function exportSize(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-nights-${size.id}.png`;
    a.click();
    statusEl.textContent = `Saved vice-city-nights-${size.id}.png (${size.w} × ${size.h}).`;
  }, 'image/png');
}
document.getElementById('export-square').addEventListener('click', () => exportSize(EXPORT_SIZES[0]));
document.getElementById('export-portrait').addEventListener('click', () => exportSize(EXPORT_SIZES[1]));
document.getElementById('export-wide').addEventListener('click', () => exportSize(EXPORT_SIZES[2]));

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, state, loadImage, redraw, selectPanel);
} else {
  // Default scene: both samples loaded so the first paint already shows art.
  Promise.all([loadImage('samples/pier.jpg'), loadImage('samples/boulevard.jpg')]).then(([pier, blvd]) => {
    state.panels[0].img = pier;
    state.panels[1].img = blvd;
    state.panels[2].img = pier;
    redraw();
  }).catch(() => redraw());
  if (document.fonts?.ready) document.fonts.ready.then(redraw);
  redraw();
}
