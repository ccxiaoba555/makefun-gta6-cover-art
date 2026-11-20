// Vice City Nights — editor UI. Your photos stay local; export renders the
// same canvas code at full size and downloads a PNG. No network requests.
import { renderCover, panelRects, DEFAULT_STATE } from './cover.js';

const canvas = document.getElementById('poster');
const SAMPLES = ['samples/boulevard.jpg', 'samples/pier.jpg'];

const state = structuredClone(DEFAULT_STATE);
const photos = []; // HTMLImageElement per slot, in upload order
let selectedPhoto = 0;
let selectedPanel = 0;
let exportSize = { w: 1080, h: 1080 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadDefaults() {
  for (const src of SAMPLES) {
    try { photos.push(await loadImage(src)); } catch { /* sample missing: panel stays placeholder */ }
  }
  renderPhotoStrip();
  renderPanelSlots();
  draw();
}

function draw() {
  canvas.width = exportSize.w;
  canvas.height = exportSize.h;
  renderCover(canvas, photos, state);
}

function renderPhotoStrip() {
  const strip = document.getElementById('photo-strip');
  strip.innerHTML = '';
  if (photos.length === 0) {
    const p = document.createElement('span');
    p.className = 'empty';
    p.textContent = 'No photos yet — the two samples will load automatically.';
    strip.appendChild(p);
    return;
  }
  photos.forEach((img, i) => {
    const el = document.createElement('img');
    el.src = img.src;
    el.alt = 'Photo ' + (i + 1);
    el.className = i === selectedPhoto ? 'sel' : '';
    el.addEventListener('click', () => {
      selectedPhoto = i;
      state.panels[selectedPanel].photo = i;
      syncPanelControls();
      renderPhotoStrip();
      renderPanelSlots();
      draw();
    });
    strip.appendChild(el);
  });
}

function renderPanelSlots() {
  const box = document.getElementById('panel-slots');
  box.innerHTML = '';
  const names = ['Hero panel', 'Panel 2', 'Panel 3'];
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot-btn' + (i === selectedPanel ? ' sel' : '');
    b.innerHTML = names[i] + '<span class="thumb">' +
      (p.photo >= 0 ? 'photo ' + (p.photo + 1) : 'empty') + '</span>';
    b.addEventListener('click', () => {
      selectedPanel = i;
      selectedPhoto = p.photo >= 0 ? p.photo : selectedPhoto;
      syncPanelControls();
      renderPhotoStrip();
      renderPanelSlots();
    });
    box.appendChild(b);
  });
}

function syncPanelControls() {
  const p = state.panels[selectedPanel];
  document.getElementById('rng-zoom').value = Math.round((p.zoom || 1) * 100);
  document.getElementById('rng-ox').value = Math.round((p.ox || 0) * 100);
  document.getElementById('rng-oy').value = Math.round((p.oy || 0) * 100);
}

function bind(id, fn) {
  document.getElementById(id).addEventListener('input', (e) => { fn(e.target); draw(); });
}

bind('sel-layout', (el) => { state.layout = el.value; });
bind('sel-preset', (el) => {
  state.preset = el.value;
  // Each grade preset ships with a grade/neon/grain starting point.
  const starts = {
    sunset: { grade: 75, neon: 80, grain: 35 },
    neon: { grade: 90, neon: 100, grain: 45 },
    dawn: { grade: 60, neon: 55, grain: 25 },
  }[el.value] || { grade: 75, neon: 80, grain: 35 };
  state.grade = starts.grade;
  state.neon = starts.neon;
  state.grain = starts.grain;
  document.getElementById('rng-grade').value = starts.grade;
  document.getElementById('rng-neon').value = starts.neon;
  document.getElementById('rng-grain').value = starts.grain;
});
bind('rng-grade', (el) => { state.grade = +el.value; });
bind('rng-neon', (el) => { state.neon = +el.value; });
bind('rng-grain', (el) => { state.grain = +el.value; });
bind('inp-caption', (el) => { state.caption = el.value; });
bind('inp-sub', (el) => { state.sub = el.value; });
bind('sel-capstyle', (el) => { state.capStyle = el.value; });
bind('rng-cap-size', (el) => { state.capSize = +el.value; });
bind('rng-cap-y', (el) => { state.capY = +el.value; });
bind('rng-cap-tilt', (el) => { state.capTilt = +el.value; });
bind('rng-tracking', (el) => { state.tracking = +el.value; });
bind('rng-zoom', (el) => { state.panels[selectedPanel].zoom = +el.value / 100; });
bind('rng-ox', (el) => { state.panels[selectedPanel].ox = +el.value / 100; });
bind('rng-oy', (el) => { state.panels[selectedPanel].oy = +el.value / 100; });
document.getElementById('chk-skyline').addEventListener('change', (e) => { state.skyline = e.target.checked; draw(); });
document.getElementById('chk-vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; draw(); });

document.getElementById('file-input').addEventListener('change', async (e) => {
  const files = [...e.target.files].slice(0, 3 - photos.length);
  for (const f of files) {
    const img = await loadImage(URL.createObjectURL(f));
    photos.push(img);
  }
  if (files.length) {
    selectedPhoto = photos.length - 1;
    state.panels[selectedPanel].photo = selectedPhoto;
  }
  renderPhotoStrip();
  renderPanelSlots();
  syncPanelControls();
  draw();
  e.target.value = '';
});

document.getElementById('btn-reset-panel').addEventListener('click', () => {
  state.panels[selectedPanel] = { photo: state.panels[selectedPanel].photo, zoom: 1.3, ox: 0, oy: 0 };
  syncPanelControls();
  draw();
});

document.getElementById('btn-fill-all').addEventListener('click', () => {
  state.panels.forEach((p) => { p.photo = 0; });
  renderPanelSlots();
  draw();
});

document.getElementById('btn-random').addEventListener('click', () => {
  const layouts = ['diagonal', 'triptych', 'stack', 'billboard'];
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  document.getElementById('sel-layout').value = state.layout;
  const presets = ['sunset', 'neon', 'dawn'];
  state.preset = presets[Math.floor(Math.random() * presets.length)];
  document.getElementById('sel-preset').value = state.preset;
  state.grade = 55 + Math.floor(Math.random() * 45);
  state.neon = 50 + Math.floor(Math.random() * 50);
  state.grain = Math.floor(Math.random() * 60);
  document.getElementById('rng-grade').value = state.grade;
  document.getElementById('rng-neon').value = state.neon;
  document.getElementById('rng-grain').value = state.grain;
  state.capStyle = Math.random() > 0.7 ? 'outline' : 'solid';
  document.getElementById('sel-capstyle').value = state.capStyle;
  state.capTilt = -4 + Math.floor(Math.random() * 9);
  document.getElementById('rng-cap-tilt').value = state.capTilt;
  const captions = ['VICE CITY NIGHTS', 'SUNSET HEIST', 'NEON BOULEVARD', 'PALM & CHROME', 'MIDNIGHT RUN'];
  state.caption = captions[Math.floor(Math.random() * captions.length)];
  document.getElementById('inp-caption').value = state.caption;
  draw();
});

// Size buttons: preview canvas follows the export size.
document.querySelectorAll('.size-btn').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    const [w, h] = b.dataset.size.split('x').map(Number);
    exportSize = { w, h };
    draw();
  });
});

// Drag to reposition the photo inside its panel; wheel to zoom it.
let drag = null;
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) * (canvas.width / r.width);
  const y = (clientY - r.top) * (canvas.height / r.height);
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  for (let i = rects.length - 1; i >= 0; i--) {
    const rc = rects[i];
    if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) return i;
  }
  return -1;
}
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  selectedPanel = i;
  syncPanelControls();
  renderPanelSlots();
  drag = { panel: i, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = state.panels[drag.panel];
  const r = canvas.getBoundingClientRect();
  p.ox = Math.max(-1, Math.min(1, p.ox + ((e.clientX - drag.x) / r.width) * 2));
  p.oy = Math.max(-1, Math.min(1, p.oy + ((e.clientY - drag.y) / r.height) * 2));
  drag.x = e.clientX;
  drag.y = e.clientY;
  syncPanelControls();
  draw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  e.preventDefault();
  selectedPanel = i;
  const p = state.panels[i];
  p.zoom = Math.max(1, Math.min(2.6, p.zoom - Math.sign(e.deltaY) * 0.08));
  syncPanelControls();
  renderPanelSlots();
  draw();
}, { passive: false });

document.getElementById('btn-export').addEventListener('click', () => {
  draw();
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `vice-city-nights-${exportSize.w}x${exportSize.h}-${stamp}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
});

loadDefaults();
