// Vice City Nights — cover render engine.
// Draws a multi-panel, GTA-poster-style cover on any canvas: a Vice City
// sunset sky with a slatted neon sun, original vector skyline and palm
// silhouettes, tilted photo panels with thick borders, and big condensed
// caption lettering. Every drawing here is original code and vector art;
// no Rockstar logo, artwork, character or font is used anywhere.

export const EXPORT_SIZES = {
  square: { label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  wide: { label: 'Landscape · 1920 × 1080', w: 1920, h: 1080 },
};

export const THEMES = {
  sunset: {
    label: 'Sunset',
    skyTop: '#2b1055', skyMid: '#ff2e63', skyLow: '#ff9a3d', horizon: '#ffd166',
    sun: '#ffe66d', sunCore: '#fff3b0', sea: '#1b0f3b', seaLine: '#ff2e63',
    accent: '#ff2e63', accent2: '#08d9d6', caption: '#ffffff', captionEdge: '#160a2e',
  },
  neon: {
    label: 'Neon Night',
    skyTop: '#05001f', skyMid: '#7b2ff7', skyLow: '#f107a3', horizon: '#ff5e8a',
    sun: '#00f0ff', sunCore: '#b8fbff', sea: '#030014', seaLine: '#00f0ff',
    accent: '#00f0ff', accent2: '#f107a3', caption: '#ffffff', captionEdge: '#030014',
  },
  midnight: {
    label: 'Midnight Gold',
    skyTop: '#020617', skyMid: '#7c2d12', skyLow: '#f59e0b', horizon: '#fde68a',
    sun: '#fbbf24', sunCore: '#fef3c7', sea: '#0b1026', seaLine: '#f59e0b',
    accent: '#f59e0b', accent2: '#38bdf8', caption: '#fffbeb', captionEdge: '#020617',
  },
};

// Panel layouts. Each panel is a fraction rect of the canvas plus a tilt
// in degrees; `photo` is the default photo-slot index shown in that panel.
export const LAYOUTS = {
  nights: {
    label: 'Vice Nights',
    panels: [
      { x: 0.045, y: 0.055, w: 0.60, h: 0.60, tilt: -2.0, photo: 0 },
      { x: 0.685, y: 0.055, w: 0.27, h: 0.285, tilt: 1.6, photo: 1 },
      { x: 0.685, y: 0.375, w: 0.27, h: 0.28, tilt: -1.2, photo: 2 },
    ],
    captionY: 0.80,
  },
  strip: {
    label: 'Ocean Strip',
    panels: [
      { x: 0.04, y: 0.06, w: 0.29, h: 0.66, tilt: -1.4, photo: 0 },
      { x: 0.355, y: 0.06, w: 0.29, h: 0.66, tilt: 1.1, photo: 1 },
      { x: 0.67, y: 0.06, w: 0.29, h: 0.66, tilt: -0.8, photo: 2 },
    ],
    captionY: 0.815,
  },
  spotlight: {
    label: 'Spotlight',
    panels: [
      { x: 0.05, y: 0.05, w: 0.90, h: 0.52, tilt: -0.9, photo: 0 },
      { x: 0.58, y: 0.60, w: 0.37, h: 0.26, tilt: 2.2, photo: 1 },
    ],
    captionY: 0.66,
  },
};

export const FONT_FAMILY = '"Bebas Neue", "Arial Narrow", sans-serif';

// Deterministic pseudo-random generator so the skyline, palms and grain
// look the same on every render of the same cover.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.max(2, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawSlattedSun(ctx, cx, cy, r, theme) {
  // Synthwave sun: bright disc with horizontal gaps that widen downwards.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const grad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  grad.addColorStop(0, theme.sunCore);
  grad.addColorStop(0.55, theme.sun);
  grad.addColorStop(1, theme.accent);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = theme.skyLow;
  let y = cy + r * 0.05;
  let gap = r * 0.045;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, gap);
    y += gap + r * 0.13;
    gap *= 1.45;
  }
  ctx.restore();
  // Glow halo.
  const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.1);
  halo.addColorStop(0, theme.sun + '55');
  halo.addColorStop(1, theme.sun + '00');
  ctx.fillStyle = halo;
  ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
}

function drawSkyline(ctx, W, baseY, topY, theme, seed) {
  const rand = seededRandom(seed);
  ctx.fillStyle = '#12081f';
  let x = -W * 0.02;
  while (x < W * 1.02) {
    const bw = W * (0.03 + rand() * 0.055);
    const bh = (baseY - topY) * (0.35 + rand() * 0.65);
    const by = baseY - bh;
    ctx.fillRect(x, by, bw, bh);
    // Rooftop antenna or water tower on some buildings.
    if (rand() > 0.62) {
      ctx.fillRect(x + bw * 0.45, by - bh * 0.22, bw * 0.08, bh * 0.22);
      ctx.beginPath();
      ctx.arc(x + bw * 0.49, by - bh * 0.24, bw * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    // A few lit windows, warm against the dark block.
    ctx.fillStyle = theme.horizon;
    const lit = Math.floor(rand() * 5);
    for (let i = 0; i < lit; i++) {
      const wx = x + bw * (0.12 + rand() * 0.7);
      const wy = by + bh * (0.15 + rand() * 0.75);
      ctx.globalAlpha = 0.55 + rand() * 0.45;
      ctx.fillRect(wx, wy, Math.max(2, bw * 0.07), Math.max(2, bh * 0.05));
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#12081f';
    x += bw + W * (0.004 + rand() * 0.014);
  }
}

function drawPalm(ctx, x, baseY, size, lean, theme) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.rotate(lean);
  ctx.strokeStyle = '#0d0518';
  ctx.lineCap = 'round';
  // Curved trunk.
  ctx.lineWidth = Math.max(3, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.45, size * 0.02, -size * 0.85);
  ctx.stroke();
  // Fronds fanning from the crown.
  const cx = size * 0.02;
  const cy = -size * 0.85;
  ctx.lineWidth = Math.max(2, size * 0.03);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.05 + (i / 6) * 0.9);
    const len = size * (0.42 + (i % 2) * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      cx + Math.cos(a) * len * 0.6,
      cy + Math.sin(a) * len * 0.45 - size * 0.12,
      cx + Math.cos(a) * len,
      cy + Math.sin(a) * len * 0.55,
    );
    ctx.stroke();
  }
  // Coconuts.
  ctx.fillStyle = '#0d0518';
  ctx.beginPath();
  ctx.arc(cx - size * 0.03, cy + size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.04, cy + size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPhotoInto(ctx, img, rect, crop, grade) {
  // Cover-fit the photo into rect, honouring the user's zoom/offset crop.
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * crop.scale;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - dw) / 2 + crop.dx * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + crop.dy * rect.h;
  ctx.drawImage(img, dx, dy, dw, dh);
  // Warm sunset grade over the photo so panels sit in the same world.
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function drawGrain(ctx, W, H, seed) {
  const rand = seededRandom(seed + 77);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  const n = Math.floor((W * H) / 2600);
  for (let i = 0; i < n; i++) {
    const s = 1 + rand() * 2;
    ctx.fillRect(rand() * W, rand() * H, s, s);
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const v = ctx.createRadialGradient(
    W / 2, H * 0.42, Math.min(W, H) * 0.42,
    W / 2, H * 0.5, Math.max(W, H) * 0.75,
  );
  v.addColorStop(0, 'rgba(10,4,24,0)');
  v.addColorStop(1, 'rgba(10,4,24,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawCaption(ctx, W, H, state, theme) {
  const lines = state.caption.split('\n').map((s) => s.trim()).filter(Boolean);
  const main = lines[0] || 'VICE CITY';
  const second = lines[1] || '';
  const hasRibbon = Boolean(state.sub && state.sub.trim());

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  // Size the main line to fit the canvas width, then shrink the whole
  // block until it fits the band above the footer. The block is anchored
  // by its bottom edge so the footer never collides with it.
  let size = H * 0.30 * state.captionScale;
  ctx.font = `${size}px ${FONT_FAMILY}`;
  const maxW = W * 0.92;
  const wMain = ctx.measureText(main).width;
  if (wMain > maxW) size *= maxW / wMain;
  const blockHeight = (s) => {
    const s2 = second ? s * 0.52 : 0;
    const rh = hasRibbon ? H * 0.052 : 0;
    const g = s * 0.10;
    return s + g + s2 + (second ? g * 0.6 : 0) + (hasRibbon ? rh + g : 0);
  };
  let blockH = blockHeight(size);
  const budget = H * 0.37;
  if (blockH > budget) {
    size *= budget / blockH;
    blockH = blockHeight(size);
  }
  const secondSize = second ? size * 0.52 : 0;
  const ribbonH = hasRibbon ? H * 0.052 : 0;
  const gap = size * 0.10;
  const bottom = H * 0.945;
  let y = bottom - blockH;

  const drawLine = (text, cy, fs, face, edge) => {
    ctx.font = `${fs}px ${FONT_FAMILY}`;
    // Neon echo behind the letters, then a dark outline, then the face.
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.9;
    ctx.fillText(text, W / 2 - fs * 0.03, cy + fs * 0.035);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = theme.captionEdge;
    ctx.lineWidth = fs * 0.13;
    ctx.strokeText(text, W / 2, cy);
    ctx.fillStyle = face;
    ctx.fillText(text, W / 2, cy);
  };

  drawLine(main, y + size / 2, size, theme.caption, theme.captionEdge);
  y += size + gap;
  if (second) {
    drawLine(second, y + secondSize / 2, secondSize, theme.caption, theme.captionEdge);
    y += secondSize + gap * 0.6;
  }
  if (hasRibbon) {
    const fs = H * 0.024;
    ctx.font = `bold ${fs}px "Arial Narrow", Arial, sans-serif`;
    const text = state.sub.trim().toUpperCase();
    const pad = H * 0.014;
    const tw = ctx.measureText(text).width;
    const bw = Math.min(W * 0.9, tw + pad * 4);
    ctx.fillStyle = theme.accent;
    roundRectPath(ctx, W / 2 - bw / 2, y, bw, ribbonH, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, W / 2, y + ribbonH / 2 + fs * 0.04);
    y += ribbonH + gap;
  }
  ctx.restore();
  return bottom;
}

// The full cover. `state` carries photos, crops, caption, layout, theme.
// Photos are HTMLImageElements (or null for an empty panel slot).
export function drawCover(ctx, W, H, state) {
  const theme = THEMES[state.theme] || THEMES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.nights;

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.45, theme.skyMid);
  sky.addColorStop(0.8, theme.skyLow);
  sky.addColorStop(1, theme.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun sits just above the horizon, behind the panels.
  drawSlattedSun(ctx, W * 0.5, H * 0.52, Math.min(W, H) * 0.19, theme);

  // Sea band with neon reflection streaks.
  const seaTop = H * 0.68;
  ctx.fillStyle = theme.sea;
  ctx.fillRect(0, seaTop, W, H - seaTop);
  const rand = seededRandom(31);
  ctx.fillStyle = theme.seaLine;
  for (let i = 0; i < 26; i++) {
    const y = seaTop + (H - seaTop) * rand();
    const w = W * (0.03 + rand() * 0.16);
    const x = rand() * W;
    ctx.globalAlpha = 0.12 + rand() * 0.35;
    ctx.fillRect(x, y, w, Math.max(2, H * 0.0035));
  }
  ctx.globalAlpha = 1;

  // Skyline + palms along the horizon, drawn over the sea band's top.
  drawSkyline(ctx, W, seaTop + H * 0.02, H * 0.40, theme, 7);
  const palmY = seaTop + H * 0.02;
  drawPalm(ctx, W * 0.06, palmY, H * 0.16, -0.10, theme);
  drawPalm(ctx, W * 0.94, palmY, H * 0.19, 0.12, theme);
  drawPalm(ctx, W * 0.885, palmY, H * 0.12, 0.06, theme);

  // Photo panels.
  const border = Math.max(6, Math.round(Math.min(W, H) * 0.011));
  layout.panels.forEach((panel, i) => {
    const rect = {
      x: panel.x * W,
      y: panel.y * H,
      w: panel.w * W,
      h: panel.h * H,
    };
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((panel.tilt * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    // Drop shadow.
    ctx.save();
    ctx.shadowColor = 'rgba(8,2,20,0.55)';
    ctx.shadowBlur = Math.max(10, H * 0.02);
    ctx.shadowOffsetY = Math.max(6, H * 0.012);
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, Math.max(4, H * 0.008));
    ctx.fillStyle = '#1b0f3b';
    ctx.fill();
    ctx.restore();
    // Photo (or a gradient placeholder when the slot is empty).
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, Math.max(4, H * 0.008));
    ctx.clip();
    const slot = state.panelPhoto[i] ?? panel.photo;
    const img = state.photos[slot];
    if (img) {
      const crop = state.crops[slot] || { scale: 1, dx: 0, dy: 0 };
      drawPhotoInto(ctx, img, rect, crop, {
        top: theme.accent + '22',
        bottom: theme.skyTop + '44',
      });
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, theme.skyMid);
      g.addColorStop(1, theme.skyTop);
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
    // Thick double border: white frame, dark keyline.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((panel.tilt * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    ctx.lineJoin = 'round';
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, Math.max(4, H * 0.008));
    ctx.lineWidth = border;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    roundRectPath(
      ctx,
      rect.x + border, rect.y + border,
      rect.w - border * 2, rect.h - border * 2,
      Math.max(3, H * 0.006),
    );
    ctx.lineWidth = Math.max(2, border * 0.28);
    ctx.strokeStyle = theme.captionEdge;
    ctx.stroke();
    // Selected-panel marker is drawn by the editor, not the export.
    ctx.restore();
  });

  // Caption + footer.
  const afterCaption = drawCaption(ctx, W, H, state, theme);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.max(11, H * 0.014)}px "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const footY = Math.min(H - H * 0.018, Math.max(afterCaption + H * 0.02, H * 0.965));
  ctx.fillText('FAN-MADE TRIBUTE · NOT AFFILIATED WITH ROCKSTAR GAMES', W / 2, footY);
  ctx.restore();

  drawGrain(ctx, W, H, 11);
  drawVignette(ctx, W, H);
}

// Hit-test a point (in canvas CSS pixels) against the tilted panels.
// Returns the panel index or -1. Used by the editor for click-to-select.
export function panelAt(state, W, H, px, py) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.nights;
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    const rect = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const a = (-p.tilt * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a) + cx;
    const ly = dx * Math.sin(a) + dy * Math.cos(a) + cy;
    if (lx >= rect.x && lx <= rect.x + rect.w && ly >= rect.y && ly <= rect.y + rect.h) return i;
  }
  return -1;
}
