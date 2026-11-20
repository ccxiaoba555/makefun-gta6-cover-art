// Vice City Nights — editor wiring.
// Owns the state (three photo slots, three panels, layout, grade, words),
// the drag-to-reposition interaction, the export buttons and the ?shot=
// scenes that screenshots are taken from. The drawing itself lives in cover.js.
import { drawCover, renderCoverToSize, layoutPanels, LAYOUTS, GRADES } from './cover.js';
import { shotPreset, markShotReady } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const fileInput = document.getElementById('file');

export const state = {
  photos: [null, null, null],
  panels: [
    { photo: 0, zoom: 1, ox: 0, oy: 0.10 },
    { photo: 1, zoom: 1, ox: 0, oy: 0 },
    { photo: 2, zoom: 1, ox: 0, oy: 0.06 },
  ],
  layout: 'hero',
  grade: 'sunset',
  title: 'Vice City Nights',
  subtitle: 'GTA VI launch week — out now',
  titleSize: 1,
  titlePos: 'bottom',
  skyline: true,
  grain: true,
  vignette: true,
};

let activeSlot = 0;
let activePanel = 0;
let drag = null;

const SIZES = { '1080x1080': [1080, 1080], '1080x1350': [1080, 1350], '1920x1080': [1920, 1080] };

function redraw() {
  drawCover(canvas, state);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function fitPreview() {
  // Keep the preview canvas at the export aspect ratio of the widest size
  // the user last picked; default square.
  const ratio = canvas.width / canvas.height;
  canvas.style.aspectRatio = `${ratio}`;
  redraw();
}

function refreshSlots() {
  const box = document.getElementById('slots');
  box.innerHTML = '';
  state.photos.forEach((img, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (img ? ' filled' : '') + (i === activeSlot ? ' active' : '');
    b.textContent = img ? `Photo ${i + 1} ✓` : `Photo ${i + 1}\n(empty)`;
    if (img) b.style.backgroundImage = `url(${img.src})`;
    b.addEventListener('click', () => {
      activeSlot = i;
      fileInput.click();
    });
    box.appendChild(b);
  });
}

function refreshPanelPick() {
  const box = document.getElementById('panel-pick');
  box.innerHTML = '';
  ['Hero / left', 'Panel 2', 'Panel 3'].forEach((label, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.classList.toggle('active', i === activePanel);
    b.addEventListener('click', () => {
      activePanel = i;
      syncPanelControls();
      refreshPanelPick();
    });
    box.appendChild(b);
  });
}

function syncPanelControls() {
  const slot = state.panels[activePanel];
  document.getElementById('panel-photo').value = String(slot.photo);
  document.getElementById('zoom').value = String(Math.round(slot.zoom * 100));
  document.getElementById('zoom-val').textContent = `${Math.round(slot.zoom * 100)}%`;
}

function refreshChoiceGroups() {
  const layoutBox = document.getElementById('layouts');
  layoutBox.innerHTML = '';
  LAYOUTS.forEach((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name === 'hero' ? 'Hero + two' : name === 'tilt' ? 'Tilted trio' : 'Polaroid';
    b.classList.toggle('active', state.layout === name);
    b.addEventListener('click', () => { state.layout = name; refreshChoiceGroups(); redraw(); });
    layoutBox.appendChild(b);
  });
  const gradeBox = document.getElementById('grades');
  gradeBox.innerHTML = '';
  GRADES.forEach((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name === 'sunset' ? 'Sunset' : name === 'neon' ? 'Neon nights' : 'Palm noir';
    b.classList.toggle('active', state.grade === name);
    b.addEventListener('click', () => { state.grade = name; refreshChoiceGroups(); redraw(); });
    gradeBox.appendChild(b);
  });
}

async function putPhotoInSlot(index, url) {
  state.photos[index] = await loadImage(url);
  // Point any panel still showing sunset art at the new photo if it has none.
  refreshSlots();
  redraw();
}

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await putPhotoInSlot(activeSlot, URL.createObjectURL(file));
  status.textContent = `Photo ${activeSlot + 1} loaded — drag it inside its panel to frame it.`;
  fileInput.value = '';
});

document.getElementById('sample-boulevard').addEventListener('click', async () => {
  await putPhotoInSlot(0, 'samples/boulevard.jpg');
  state.panels[0].photo = 0;
  status.textContent = 'Sample boulevard loaded into photo 1.';
});
document.getElementById('sample-pier').addEventListener('click', async () => {
  await putPhotoInSlot(1, 'samples/pier.jpg');
  state.panels[1].photo = 1;
  status.textContent = 'Sample pier loaded into photo 2.';
});

document.getElementById('panel-photo').addEventListener('change', (e) => {
  state.panels[activePanel].photo = Number(e.target.value);
  redraw();
});
document.getElementById('zoom').addEventListener('input', (e) => {
  state.panels[activePanel].zoom = Number(e.target.value) / 100;
  document.getElementById('zoom-val').textContent = `${e.target.value}%`;
  redraw();
});
document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('title-size').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value) / 100;
  document.getElementById('tsize-val').textContent = `${e.target.value}%`;
  redraw();
});
document.getElementById('title-pos').addEventListener('change', (e) => { state.titlePos = e.target.value; redraw(); });
document.getElementById('skyline').addEventListener('change', (e) => { state.skyline = e.target.checked; redraw(); });
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });

document.querySelectorAll('.export').forEach((btn) => {
  btn.addEventListener('click', () => {
    const [w, h] = SIZES[btn.dataset.size];
    const out = renderCoverToSize(state, w, h);
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-city-nights-${btn.dataset.size}.png`;
      a.click();
      status.textContent = `Saved vice-city-nights-${btn.dataset.size}.png`;
    }, 'image/png');
  });
});

// Drag to reposition: hit-test the panel under the pointer, then pan its photo.
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = ((clientX - rect.left) / rect.width) * canvas.width;
  const py = ((clientY - rect.top) / rect.height) * canvas.height;
  const panels = layoutPanels(state.layout, canvas.width, canvas.height);
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) return i;
  }
  return -1;
}

canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  activePanel = i;
  syncPanelControls();
  refreshPanelPick();
  drag = { x: e.clientX, y: e.clientY, slot: state.panels[i] };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  drag.slot.ox += (e.clientX - drag.x) / rect.width;
  drag.slot.oy += (e.clientY - drag.y) / rect.height;
  drag.slot.ox = Math.max(-0.6, Math.min(0.6, drag.slot.ox));
  drag.slot.oy = Math.max(-0.6, Math.min(0.6, drag.slot.oy));
  drag.x = e.clientX;
  drag.y = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

/** Deterministic scenes for screenshots: ?shot=editor|cover&photo=…&caption=…&layout=…&grade=…&size=… */
export async function runShot(shot, query) {
  const preset = shotPreset(query);
  if (preset.layout) state.layout = preset.layout;
  if (preset.grade) state.grade = preset.grade;
  if (preset.caption) {
    state.title = preset.caption;
    document.getElementById('title').value = state.title;
  }
  if (preset.sub) {
    state.subtitle = preset.sub;
    document.getElementById('subtitle').value = state.subtitle;
  }
  if (preset.size) {
    canvas.width = preset.size[0];
    canvas.height = preset.size[1];
    fitPreview();
  }
  state.photos[0] = await loadImage(`samples/${preset.photo}.jpg`);
  state.photos[1] = await loadImage(`samples/${preset.photo2}.jpg`);
  state.panels[0].photo = 0;
  state.panels[1].photo = 1;
  state.panels[2].photo = 0;
  refreshSlots();
  refreshChoiceGroups();
  if (shot === 'cover') document.body.classList.add('shot-cover');
  redraw();
  await document.fonts.ready;
  redraw();
  markShotReady();
}

refreshSlots();
refreshPanelPick();
refreshChoiceGroups();
syncPanelControls();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search));
} else {
  redraw();
}
