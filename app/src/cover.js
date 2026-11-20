// Vice City Nights — cover drawing engine.
// Draws the whole poster on any 2d canvas: sunset sky, synthwave sun,
// vector skyline + palm silhouettes, tilted photo panels with thick
// borders, and a big outlined caption. No external assets, no network.

export const GRADES = {
  sunset: {
    sky: ['#2b1055', '#7597de'],
    skyStops: [[0, '#1c0b3d'], [0.42, '#7b2d8b'], [0.68, '#ff6b6b'], [1, '#ffb347']],
    sun: ['#ffe259', '#ff7e5f'],
    tint: 'rgba(255, 107, 107, 0.16)',
    tint2: 'rgba(64, 224, 255, 0.10)',
    accent: '#ff2e88',
    accent2: '#22e6ff',
    band: 'rgba(20, 6, 40, 0.72)',
  },
  neon: {
    sky: ['#0b0221', '#3b0a6e'],
    skyStops: [[0, '#07021a'], [0.45, '#3b0a6e'], [0.72, '#c724b1'], [1, '#ff5e8a']],
    sun: ['#7df9ff', '#ff2e88'],
    tint: 'rgba(255, 46, 136, 0.20)',
    tint2: 'rgba(34, 230, 255, 0.14)',
    accent: '#22e6ff',
    accent2: '#ff2e88',
    band: 'rgba(5, 2, 24, 0.78)',
  },
  midnight: {
    sky: ['#04081f', '#123a6b'],
    skyStops: [[0, '#020617'], [0.5, '#0b2a5b'], [0.78, '#e2607f'], [1, '#ffb347']],
    sun: ['#fff3b0', '#ff9e5e'],
    tint: 'rgba(18, 58, 107, 0.22)',
    tint2: 'rgba(255, 158, 94, 0.10)',
    accent: '#ffb347',
    accent2: '#7df9ff',
    band: 'rgba(2, 6, 23, 0.78)',
  },
  vicegold: {
    sky: ['#1a0b2e', '#e8a33d'],
    skyStops: [[0, '#1a0b2e'], [0.45, '#7a4a12'], [0.7, '#e8a33d'], [1, '#ffe9a8']],
    sun: ['#fff3c4', '#f5a623'],
    tint: 'rgba(232, 163, 61, 0.16)',
    tint2: 'rgba(64, 224, 255, 0.10)',
    accent: '#f5a623',
    accent2: '#40e0d0',
    band: 'rgba(26, 11, 46, 0.72)',
  },
  rose: {
    sky: ['#2b0a2e', '#ff4d8d'],
    skyStops: [[0, '#2b0a2e'], [0.45, '#8b1e5b'], [0.72, '#ff4d8d'], [1, '#ffb3c8']],
    sun: ['#ffe0ec', '#ff2e88'],
    tint: 'rgba(255, 77, 141, 0.18)',
    tint2: 'rgba(255, 179, 200, 0.10)',
    accent: '#ff4d8d',
    accent2: '#ffd166',
    band: 'rgba(43, 10, 46, 0.72)',
  },
  acid: {
    sky: ['#0a1a05', '#a8e10c'],
    skyStops: [[0, '#0a1a05'], [0.45, '#3d7a1e'], [0.72, '#a8e10c'], [1, '#e8ff47']],
    sun: ['#d4ff3f', '#8b2ee6'],
    tint: 'rgba(168, 225, 12, 0.16)',
    tint2: 'rgba(139, 46, 230, 0.12)',
    accent: '#a8e10c',
    accent2: '#b26bff',
    band: 'rgba(10, 26, 5, 0.72)',
  },
  bayside: {
    sky: ['#0b3d91', '#7ec8f7'],
    skyStops: [[0, '#0b3d91'], [0.45, '#2f7fd0'], [0.72, '#7ec8f7'], [1, '#dff3ff']],
    sun: ['#ffffff', '#ffd166'],
    tint: 'rgba(126, 200, 247, 0.14)',
    tint2: 'rgba(255, 255, 255, 0.10)',
    accent: '#2f7fd0',
    accent2: '#ff7e5f',
    band: 'rgba(11, 61, 145, 0.70)',
  },
  chrome: {
    sky: ['#1c0533', '#ffd166'],
    skyStops: [[0, '#1c0533'], [0.45, '#7a1e6e'], [0.72, '#e6399b'], [1, '#ffd166']],
    sun: ['#fff6c9', '#ff2e88'],
    tint: 'rgba(230, 57, 155, 0.18)',
    tint2: 'rgba(255, 209, 102, 0.12)',
    accent: '#ff2e88',
    accent2: '#ffd166',
    band: 'rgba(28, 5, 51, 0.72)',
  },
};

export const LAYOUTS = ['billboard', 'triptych', 'diagonal'];

// Panel rectangles as fractions of the canvas, per layout.
// Each panel: x, y, w, h (fractions), rot (radians), photo (slot index).
export function panelRects(width, height, layout) {
  const portrait = height > width * 1.05;
  if (layout === 'triptych') {
    return [
      { x: 0.045, y: 0.045, w: 0.29, h: 0.62, rot: -0.018, photo: 0 },
      { x: 0.355, y: 0.045, w: 0.29, h: 0.62, rot: 0.012, photo: 1 },
      { x: 0.665, y: 0.045, w: 0.29, h: 0.62, rot: -0.01, photo: 2 },
    ];
  }
  if (layout === 'diagonal') {
    if (portrait) {
      return [
        { x: 0.05, y: 0.04, w: 0.9, h: 0.42, rot: -0.02, photo: 0 },
        { x: 0.05, y: 0.50, w: 0.43, h: 0.30, rot: 0.02, photo: 1 },
        { x: 0.52, y: 0.50, w: 0.43, h: 0.30, rot: -0.014, photo: 2 },
      ];
    }
    return [
      { x: 0.04, y: 0.05, w: 0.58, h: 0.62, rot: -0.022, photo: 0 },
      { x: 0.64, y: 0.10, w: 0.32, h: 0.27, rot: 0.03, photo: 1 },
      { x: 0.64, y: 0.40, w: 0.32, h: 0.27, rot: -0.02, photo: 2 },
    ];
  }
  // billboard (default): big hero left, two stacked panels right.
  if (portrait) {
    return [
      { x: 0.05, y: 0.04, w: 0.9, h: 0.44, rot: -0.016, photo: 0 },
      { x: 0.05, y: 0.52, w: 0.43, h: 0.28, rot: 0.018, photo: 1 },
      { x: 0.52, y: 0.52, w: 0.43, h: 0.28, rot: -0.012, photo: 2 },
    ];
  }
  return [
    { x: 0.04, y: 0.05, w: 0.58, h: 0.64, rot: -0.02, photo: 0 },
    { x: 0.64, y: 0.05, w: 0.32, h: 0.30, rot: 0.025, photo: 1 },
    { x: 0.64, y: 0.39, w: 0.32, h: 0.30, rot: -0.018, photo: 2 },
  ];
}

// Small deterministic pseudo-random generator so the skyline and grain
// look the same on every render of the same poster.
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function drawSky(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  for (const [stop, color] of grade.skyStops) sky.addColorStop(stop, color);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Synthwave sun, low on the horizon.
  const sunR = Math.min(w, h) * 0.21;
  const sunX = w * (grade === GRADES.neon ? 0.68 : 0.5);
  const sunY = h * 0.46;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.1);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.55)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 2.2, sunY - sunR * 2.2, sunR * 4.4, sunR * 4.4);
  const disc = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  disc.addColorStop(0, grade.sun[0]);
  disc.addColorStop(1, grade.sun[1]);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  // Retro slits across the sun's lower half.
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grade.skyStops[1][1];
  let gap = sunR * 0.10;
  for (let y = sunY + sunR * 0.08; y < sunY + sunR; y += gap) {
    ctx.fillRect(sunX - sunR, y, sunR * 2, gap * 0.32);
    gap *= 1.45;
  }
  ctx.restore();
}

function drawSkyline(ctx, w, h, grade, seed) {
  const rnd = seededRandom(seed);
  const base = h * 0.66;
  ctx.fillStyle = 'rgba(16, 6, 38, 0.92)';
  let x = -w * 0.02;
  while (x < w * 1.02) {
    const bw = w * (0.045 + rnd() * 0.075);
    const bh = h * (0.10 + rnd() * 0.20);
    ctx.fillRect(x, base - bh, bw, bh);
    // Rooftop antenna on some towers.
    if (rnd() > 0.72) {
      ctx.fillRect(x + bw * 0.45, base - bh - h * 0.05, w * 0.006, h * 0.05);
      ctx.beginPath();
      ctx.arc(x + bw * 0.48, base - bh - h * 0.055, w * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = grade.accent;
      ctx.fill();
      ctx.fillStyle = 'rgba(16, 6, 38, 0.92)';
    }
    // A few lit windows.
    ctx.fillStyle = 'rgba(255, 214, 120, 0.75)';
    const rows = Math.floor(bh / (h * 0.035));
    const cols = Math.floor(bw / (w * 0.02));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rnd() > 0.62) {
          ctx.fillRect(x + w * 0.008 + c * w * 0.02, base - bh + h * 0.02 + r * h * 0.035, w * 0.008, h * 0.014);
        }
      }
    }
    ctx.fillStyle = 'rgba(16, 6, 38, 0.92)';
    x += bw + w * 0.008;
  }
  // Solid dark ground below the skyline, so no striped gaps show through.
  ctx.fillStyle = '#0e0426';
  ctx.fillRect(0, base, w, h - base);
  // Sea / street glow line under the skyline.
  const sheen = ctx.createLinearGradient(0, base, 0, h);
  sheen.addColorStop(0, 'rgba(255, 46, 136, 0.28)');
  sheen.addColorStop(1, 'rgba(20, 6, 40, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, base, w, h - base);
}

function drawPalm(ctx, x, y, size, lean, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.lineCap = 'round';
  // Curved trunk.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.10, -size * 0.55, size * 0.04, -size * 0.95);
  ctx.stroke();
  // Fronds fanning from the crown.
  const cx = size * 0.04;
  const cy = -size * 0.95;
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.08 + i * 0.13);
    const len = size * (0.42 + (i % 3) * 0.07);
    const tipX = cx + Math.cos(a) * len;
    const tipY = cy + Math.sin(a) * len * 0.55 + size * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + Math.cos(a) * len * 0.55, cy + Math.sin(a) * len * 0.28, tipX, tipY);
    ctx.stroke();
  }
  // Coconut cluster.
  ctx.beginPath();
  ctx.arc(cx - size * 0.03, cy + size * 0.03, size * 0.035, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.04, cy + size * 0.04, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPhotoInto(ctx, img, px, py, pw, ph, zoom, ox, oy) {
  const base = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  const dx = px + (pw - dw) / 2 + ox * pw;
  const dy = py + (ph - dh) / 2 + oy * ph;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanel(ctx, w, h, panel, img, panelState, grade) {
  const px = panel.x * w;
  const py = panel.y * h;
  const pw = panel.w * w;
  const ph = panel.h * h;
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(panel.rot);
  ctx.translate(-pw / 2, -ph / 2);
  // Drop shadow under the panel.
  ctx.fillStyle = 'rgba(8, 2, 24, 0.55)';
  ctx.fillRect(6, 10, pw, ph);
  ctx.beginPath();
  ctx.rect(0, 0, pw, ph);
  ctx.clip();
  if (img) {
    drawPhotoInto(ctx, img, 0, 0, pw, ph, panelState.zoom, panelState.ox, panelState.oy);
    // Sunset grade wash over the photo.
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, pw, ph);
    ctx.globalCompositeOperation = 'source-over';
    const wash = ctx.createLinearGradient(0, 0, pw, ph);
    wash.addColorStop(0, 'rgba(255, 46, 136, 0.10)');
    wash.addColorStop(1, grade.tint2);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, pw, ph);
  } else {
    const empty = ctx.createLinearGradient(0, 0, pw, ph);
    empty.addColorStop(0, '#3b0a6e');
    empty.addColorStop(1, '#12063a');
    ctx.fillStyle = empty;
    ctx.fillRect(0, 0, pw, ph);
  }
  // Inner bottom shade so panels read as one poster.
  const shade = ctx.createLinearGradient(0, ph * 0.6, 0, ph);
  shade.addColorStop(0, 'rgba(10, 3, 30, 0)');
  shade.addColorStop(1, 'rgba(10, 3, 30, 0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, pw, ph);
  ctx.restore();
  // Thick double border, drawn unrotated-relative to the panel transform.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(panel.rot);
  ctx.translate(-pw / 2, -ph / 2);
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.strokeStyle = '#fff7ee';
  ctx.strokeRect(0, 0, pw, ph);
  ctx.lineWidth = Math.max(1.5, w * 0.002);
  ctx.strokeStyle = grade.accent;
  ctx.strokeRect(w * 0.006, w * 0.006, pw - w * 0.012, ph - w * 0.012);
  ctx.restore();
}

function drawCaption(ctx, w, h, state, grade) {
  const size = Math.min(w * 0.115, h * 0.20) * state.captionSize;
  const y = h * state.captionY;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const font = `${size}px "Russo One", "Arial Black", sans-serif`;
  ctx.font = font;
  try { ctx.letterSpacing = `${Math.round(size * 0.03)}px`; } catch { /* older canvas: ignore */ }
  const label = (state.caption || 'VICE CITY').toUpperCase();
  // Pink drop shadow, then dark outline, then gradient fill.
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.05;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.14;
  ctx.strokeStyle = '#14062a';
  ctx.strokeText(label, w / 2, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const fill = ctx.createLinearGradient(0, y - size * 0.55, 0, y + size * 0.55);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(0.55, '#ffe9f3');
  fill.addColorStop(1, grade.accent2 === '#22e6ff' ? '#ffd166' : '#ffb3d9');
  ctx.fillStyle = fill;
  ctx.fillText(label, w / 2, y);
  // Sub-caption ribbon.
  const sub = (state.subcaption || 'NIGHTS').toUpperCase();
  const subSize = size * 0.30;
  ctx.font = `${subSize}px "Russo One", "Arial Black", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(subSize * 0.42)}px`; } catch { /* ignore */ }
  const subY = y + size * 0.62;
  const subW = ctx.measureText(sub).width + subSize * 1.1;
  ctx.fillStyle = grade.accent;
  const ribbonH = subSize * 1.7;
  ctx.fillRect(w / 2 - subW / 2, subY - ribbonH / 2, subW, ribbonH);
  ctx.fillStyle = '#14062a';
  ctx.fillText(sub, w / 2, subY + subSize * 0.04);
  ctx.restore();
}

// Round seal stamp, top-right corner: double ring + circular text + star.
function drawSeal(ctx, w, h, grade) {
  const r = Math.min(w, h) * 0.055;
  const cx = w * 0.925;
  const cy = h * 0.095;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(12, 3, 32, 0.72)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#fff7ee';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.strokeStyle = grade.accent;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.80, 0, Math.PI * 2);
  ctx.stroke();
  // Ring text, one character at a time around the circle.
  const ring = '★ VICE CITY NIGHTS ★ EST. 2026 ★';
  ctx.fillStyle = '#fff7ee';
  ctx.font = `${Math.max(8, r * 0.17)}px "Russo One", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const step = (Math.PI * 2) / ring.length;
  for (let i = 0; i < ring.length; i++) {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.88);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  // Central star.
  ctx.fillStyle = grade.accent;
  ctx.font = `${r * 0.85}px "Russo One", sans-serif`;
  ctx.fillText('★', 0, r * 0.06);
  ctx.restore();
}

// Two small annotation cards with thin leader lines pointing at panels.
function drawCallouts(ctx, w, h, state, grade, rects) {
  const texts = [state.details.callout1, state.details.callout2];
  const anchors = [
    { fx: 0.72, fy: 0.10, tx: 0.5, ty: 0.45 }, // hero panel
    { fx: 0.50, fy: 0.10, tx: 0.5, ty: 0.45 }, // top-right panel
  ];
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 2; i++) {
    const rect = rects[i];
    if (!rect) continue;
    const label = (texts[i] || '').trim().toUpperCase();
    if (!label) continue;
    const px = rect.x * w;
    const py = rect.y * h;
    const pw = rect.w * w;
    const ph = rect.h * h;
    const cardX = px + pw * anchors[i].fx;
    const cardY = py + ph * anchors[i].fy;
    const targetX = px + pw * anchors[i].tx;
    const targetY = py + ph * anchors[i].ty;
    const fontSize = Math.max(10, w * 0.011);
    ctx.font = `${fontSize}px "Russo One", sans-serif`;
    const textW = ctx.measureText(label).width;
    const padX = fontSize * 0.9;
    const cw = textW + padX * 2;
    const ch = fontSize * 2.1;
    // Leader line first, so the card sits on top of it.
    ctx.strokeStyle = 'rgba(255, 247, 238, 0.9)';
    ctx.lineWidth = Math.max(1, w * 0.0012);
    ctx.beginPath();
    ctx.moveTo(cardX, cardY + ch / 2);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.arc(targetX, targetY, Math.max(3, w * 0.003), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(12, 3, 32, 0.88)';
    ctx.fillRect(cardX - cw / 2, cardY - ch / 2, cw, ch);
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(1, w * 0.0012);
    ctx.strokeRect(cardX - cw / 2, cardY - ch / 2, cw, ch);
    ctx.fillStyle = '#fff7ee';
    ctx.fillText(label, cardX, cardY + fontSize * 0.05);
  }
  ctx.restore();
}

// Billing block: tiny centred all-caps credits, 1-2 lines, above the
// corner tag and clear of the title ribbon.
function drawBilling(ctx, w, h, state) {
  const text = (state.details.billing || '').trim().toUpperCase();
  if (!text) return;
  const fontSize = Math.max(9, w * 0.0085);
  ctx.save();
  ctx.font = `${fontSize}px "Russo One", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 247, 238, 0.85)';
  const maxW = w * 0.86;
  const words = text.split(/\s+/);
  const lines = [''];
  for (const word of words) {
    const trial = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
    if (ctx.measureText(trial).width <= maxW || !lines[lines.length - 1]) {
      lines[lines.length - 1] = trial;
    } else if (lines.length < 2) {
      lines.push(word);
    }
  }
  const lineH = fontSize * 1.5;
  const y0 = lines.length > 1 ? h * 0.938 : h * 0.948;
  lines.forEach((line, i) => ctx.fillText(line, w / 2, y0 + i * lineH));
  ctx.restore();
}

function drawGrain(ctx, w, h, seed) {
  const rnd = seededRandom(seed + 77);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  const dots = Math.floor((w * h) / 9000);
  for (let i = 0; i < dots; i++) {
    const d = 1 + rnd() * 2;
    ctx.fillRect(rnd() * w, rnd() * h, d, d);
  }
  ctx.restore();
  // Vignette.
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(8, 2, 24, 0)');
  vig.addColorStop(1, 'rgba(8, 2, 24, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

// The poster's caption band: a dark gradient strip behind the lettering.
function drawCaptionBand(ctx, w, h, grade) {
  const top = h * (0.72 - 0.06);
  const band = ctx.createLinearGradient(0, top, 0, h);
  band.addColorStop(0, 'rgba(12, 3, 32, 0)');
  band.addColorStop(0.35, grade.band);
  band.addColorStop(1, 'rgba(8, 2, 24, 0.92)');
  ctx.fillStyle = band;
  ctx.fillRect(0, top, w, h - top);
}

export function defaultState() {
  return {
    caption: 'VICE CITY',
    subcaption: 'NIGHTS',
    captionSize: 1,
    captionY: 0.83,
    grade: 'sunset',
    layout: 'billboard',
    details: {
      seal: true,
      billing: true,
      callouts: true,
      callout1: 'LEONIDA',
      callout2: 'EST. 2026',
      billing: 'A VICE CITY NIGHTS POSTER  •  STARRING YOUR PHOTOS  •  MUSIC BY THE SUNSET DRIVE  •  © 2026 LEONIDA PICTURES',
    },
    panels: [
      { zoom: 1, ox: 0, oy: 0 },
      { zoom: 1, ox: 0, oy: 0 },
      { zoom: 1, ox: 0, oy: 0 },
    ],
  };
}

// Poster details shared by every state factory (cover.js + shots.js).
export function defaultDetails() {
  return {
    seal: true,
    billing: true,
    callouts: true,
    callout1: 'LEONIDA',
    callout2: 'EST. 2026',
    billing: 'A VICE CITY NIGHTS POSTER  •  STARRING YOUR PHOTOS  •  MUSIC BY THE SUNSET DRIVE  •  © 2026 LEONIDA PICTURES',
  };
}

// photos: array of 3 HTMLImageElements (or nulls), one per slot.
// panel i shows photos[panel.photo]; a missing photo leaves a graded empty panel.
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, w, h);
  drawSky(ctx, w, h, grade);
  drawSkyline(ctx, w, h, grade, 20261120);
  const rects = panelRects(w, h, state.layout);
  for (let i = 0; i < rects.length; i++) {
    const panel = rects[i];
    const img = photos[panel.photo] || null;
    drawPanel(ctx, w, h, panel, img, state.panels[i] || { zoom: 1, ox: 0, oy: 0 }, grade);
  }
  // Palms overlapping the panel edges, bottom corners.
  const palmColor = 'rgba(10, 3, 28, 0.95)';
  drawPalm(ctx, w * 0.015, h * 0.99, h * 0.25, -0.16, palmColor);
  drawPalm(ctx, w * 0.985, h * 0.99, h * 0.22, 0.14, palmColor);
  drawCaptionBand(ctx, w, h, grade);
  const details = state.details || defaultDetails();
  state = { ...state, details };
  // When the billing block owns the bottom strip, lift the title a touch
  // so its ribbon clears the credits below it.
  const captionState = details.billing
    ? { ...state, captionY: state.captionY - 0.08 }
    : state;
  drawCaption(ctx, w, h, captionState, grade);
  if (details.seal) drawSeal(ctx, w, h, grade);
  if (details.callouts) drawCallouts(ctx, w, h, state, grade, rects);
  if (details.billing) drawBilling(ctx, w, h, state);
  drawGrain(ctx, w, h, 20261120);
  // Tiny corner tag: bottom-left normally; top-left when the billing
  // block owns the bottom strip, so the two never collide.
  ctx.save();
  ctx.font = `${Math.max(11, w * 0.011)}px "Russo One", sans-serif`;
  ctx.fillStyle = 'rgba(255, 247, 238, 0.75)';
  ctx.textAlign = 'left';
  if (details.billing) {
    ctx.textBaseline = 'top';
    ctx.fillText('VICE CITY NIGHTS — ORIGINAL FAN-STYLE ART', w * 0.02, h * 0.015);
  } else {
    ctx.textBaseline = 'bottom';
    ctx.fillText('VICE CITY NIGHTS — ORIGINAL FAN-STYLE ART', w * 0.02, h * 0.985);
  }
  ctx.restore();
  return rects;
}
