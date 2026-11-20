// Vice City Nights — cover renderer.
// Draws a multi-panel GTA-style poster onto any 2D canvas: three photo panels
// in one of three layouts, a sunset / neon colour grade, original vector
// skyline + palm silhouettes, grain, vignette and big outlined caption type.
// Everything here is drawn from code — no Rockstar art, logo or font.

export const LAYOUTS = ['hero', 'tilt', 'polaroid'];
export const GRADES = ['sunset', 'neon', 'noir'];

/** Panel rectangles for a layout, as fractions of the canvas (x, y, w, h, rotation in degrees). */
export function layoutPanels(layout, w, h) {
  const g = Math.max(6, Math.round(Math.min(w, h) * 0.008)); // white gutter
  if (layout === 'tilt') {
    const pw = (w - g * 4) / 3;
    const ph = h * 0.78;
    return [
      { x: g, y: h * 0.05, w: pw, h: ph, rot: -2.5 },
      { x: g * 2 + pw, y: h * 0.12, w: pw, h: ph, rot: 0 },
      { x: g * 3 + pw * 2, y: h * 0.05, w: pw, h: ph, rot: 2.5 },
    ];
  }
  if (layout === 'polaroid') {
    const sw = w * 0.34;
    const sh = h * 0.42;
    return [
      { x: 0, y: 0, w, h, rot: 0, bleed: true },
      { x: w * 0.05, y: h * 0.52, w: sw, h: sh, rot: -4, frame: true },
      { x: w * 0.61, y: h * 0.52, w: sw, h: sh, rot: 4, frame: true },
    ];
  }
  // hero: one big panel on top, two smaller ones below.
  return [
    { x: g, y: g, w: w - g * 2, h: h * 0.58 - g, rot: 0 },
    { x: g, y: h * 0.58 + g, w: (w - g * 3) / 2, h: h * 0.42 - g * 2, rot: 0 },
    { x: g * 2 + (w - g * 3) / 2, y: h * 0.58 + g, w: (w - g * 3) / 2, h: h * 0.42 - g * 2, rot: 0 },
  ];
}

const GRADE_FILTER = {
  sunset: 'saturate(1.35) contrast(1.06) sepia(0.22)',
  neon: 'saturate(1.65) hue-rotate(12deg) contrast(1.12)',
  noir: 'grayscale(1) contrast(1.28) brightness(1.06)',
};

const GRADE_WASH = {
  sunset: ['rgba(255, 122, 26, 0.20)', 'rgba(255, 45, 149, 0.22)'],
  neon: ['rgba(255, 45, 149, 0.26)', 'rgba(0, 229, 255, 0.22)'],
  noir: ['rgba(20, 20, 40, 0.18)', 'rgba(0, 0, 0, 0.30)'],
};

/** A sunset gradient with a slatted retro sun, used when a panel has no photo. */
export function paintEmptyPanel(ctx, x, y, w, h, grade) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  if (grade === 'neon') {
    sky.addColorStop(0, '#2b0a4d'); sky.addColorStop(0.55, '#c2187a'); sky.addColorStop(1, '#ff7a2f');
  } else if (grade === 'noir') {
    sky.addColorStop(0, '#3a3a44'); sky.addColorStop(0.6, '#17171d'); sky.addColorStop(1, '#000000');
  } else {
    sky.addColorStop(0, '#ff9a3d'); sky.addColorStop(0.55, '#ff5e7a'); sky.addColorStop(1, '#7a1e6e');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  // Slatted sun.
  const cx = x + w * 0.5;
  const cy = y + h * 0.52;
  const r = Math.min(w, h) * 0.26;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, '#ffe259'); sun.addColorStop(1, '#ff4e7a');
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = sky;
  for (let i = 0; i < 4; i++) ctx.fillRect(cx - r, cy + r * (0.05 + i * 0.22), r * 2, r * 0.07);
  ctx.restore();
  paintSkyline(ctx, x, y + h * 0.78, w, h * 0.22, '#1a0b2e');
}

/** Original vector skyline: blocky towers, antennas and windows, in one colour. */
export function paintSkyline(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  let bx = x;
  const rng = mulberry(7);
  while (bx < x + w) {
    const bw = w * (0.05 + rng() * 0.07);
    const bh = h * (0.35 + rng() * 0.65);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    if (rng() > 0.55) { // antenna
      ctx.fillRect(bx + bw * 0.45, y + h - bh - h * 0.28, Math.max(2, bw * 0.06), h * 0.28);
    }
    // Lit windows.
    ctx.fillStyle = 'rgba(255, 214, 120, 0.85)';
    for (let wy = y + h - bh + h * 0.08; wy < y + h - h * 0.06; wy += h * 0.14) {
      for (let wx = bx + bw * 0.15; wx < bx + bw * 0.85; wx += bw * 0.3) {
        if (rng() > 0.6) ctx.fillRect(wx, wy, Math.max(2, bw * 0.1), Math.max(2, h * 0.05));
      }
    }
    ctx.fillStyle = colour;
    bx += bw + w * 0.008;
  }
}

/** Original vector palm: a curved trunk and five drooping fronds. */
export function paintPalm(ctx, x, y, size, colour, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.5, size * 0.16, -size * 0.85);
  ctx.stroke();
  const topX = size * 0.16;
  const topY = -size * 0.85;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * (0.08 + i * 0.19);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * size * 0.45, topY + Math.sin(a) * size * 0.3,
      topX + Math.cos(a) * size * 0.62, topY + Math.sin(a) * size * 0.62 + size * 0.22,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** Tiny deterministic PRNG so the grain looks the same on every export. */
export function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintPhoto(ctx, img, panel, zoom, ox, oy, grade) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    const base = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * base;
    const dh = img.naturalHeight * base;
    ctx.filter = GRADE_FILTER[grade] ?? GRADE_FILTER.sunset;
    ctx.drawImage(img, x + (w - dw) / 2 + ox * w, y + (h - dh) / 2 + oy * h, dw, dh);
    ctx.filter = 'none';
  } else {
    paintEmptyPanel(ctx, x, y, w, h, grade);
  }
  // Colour wash over the photo.
  const [top, bottom] = GRADE_WASH[grade] ?? GRADE_WASH.sunset;
  const wash = ctx.createLinearGradient(0, y, 0, y + h);
  wash.addColorStop(0, top);
  wash.addColorStop(1, bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

function paintFrame(ctx, panel) {
  const { x, y, w, h, rot } = panel;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.012);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  if (panel.frame) { // polaroid: thick white border + wider foot
    ctx.lineWidth = Math.max(6, w * 0.03);
    ctx.strokeStyle = '#fdfdf8';
    ctx.strokeRect(-w / 2, -h / 2, w, h * 0.94);
    ctx.fillStyle = '#fdfdf8';
    ctx.fillRect(-w / 2 - ctx.lineWidth / 2, h / 2 - h * 0.10, w + ctx.lineWidth, h * 0.10 + ctx.lineWidth / 2);
  }
  ctx.restore();
}

/** Draws the whole cover for `state` onto `canvas` (the canvas keeps its own size). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES.includes(state.grade) ? state.grade : 'sunset';
  const layout = LAYOUTS.includes(state.layout) ? state.layout : 'hero';

  // Base: deep violet night.
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  const panels = layoutPanels(layout, w, h);
  panels.forEach((panel, i) => {
    const slot = state.panels?.[i] ?? { photo: i, zoom: 1, ox: 0, oy: 0 };
    const img = state.photos?.[slot.photo] ?? null;
    ctx.save();
    if (panel.rot) {
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.rotate((panel.rot * Math.PI) / 180);
      ctx.translate(-panel.w / 2, -panel.h / 2);
      paintPhoto(ctx, img, { x: 0, y: 0, w: panel.w, h: panel.h }, slot.zoom ?? 1, slot.ox ?? 0, slot.oy ?? 0, grade);
      ctx.restore();
    } else {
      ctx.restore();
      paintPhoto(ctx, img, panel, slot.zoom ?? 1, slot.ox ?? 0, slot.oy ?? 0, grade);
    }
    paintFrame(ctx, panel);
  });

  // Skyline + palms strip along the bottom, behind the caption.
  if (state.skyline !== false) {
    const bandH = h * 0.16;
    const bandY = h - bandH;
    ctx.fillStyle = 'rgba(16, 6, 32, 0.55)';
    ctx.fillRect(0, bandY, w, bandH);
    paintSkyline(ctx, 0, bandY + bandH * 0.18, w, bandH * 0.82, '#12081f');
    paintPalm(ctx, w * 0.04, bandY + bandH * 0.98, bandH * 1.15, '#0d0518', -0.12);
    paintPalm(ctx, w * 0.96, bandY + bandH * 0.98, bandH * 1.05, '#0d0518', 0.14);
  }

  // Caption: big condensed type, thick dark outline, neon drop shadow.
  const title = (state.title ?? '').trim().toUpperCase();
  const sub = (state.subtitle ?? '').trim();
  const scale = state.titleSize ?? 1;
  if (title) {
    let size = Math.min(w, h) * 0.115 * scale;
    const face = 'Anton, "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px ${face}`;
    while (ctx.measureText(title).width > w * 0.92 && size > 14) {
      size -= 3;
      ctx.font = `${size}px ${face}`;
    }
    const ty = state.titlePos === 'top' ? h * 0.10 : h - h * 0.105;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4, size * 0.14);
    ctx.strokeStyle = '#160a24';
    ctx.shadowColor = grade === 'neon' ? '#ff2d95' : '#ff7a2f';
    ctx.shadowBlur = size * 0.28;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(title, w / 2, ty);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const grad = ctx.createLinearGradient(0, ty - size / 2, 0, ty + size / 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#ffe9a8');
    grad.addColorStop(1, grade === 'neon' ? '#ff5ec4' : '#ff8a3d');
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, ty);
    if (sub) {
      const subSize = Math.max(16, size * 0.26);
      ctx.font = `italic 700 ${subSize}px "Arial Narrow", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = subSize * 0.3;
      ctx.fillText(sub, w / 2, ty + size * 0.58);
      ctx.shadowBlur = 0;
    }
  }

  // Vignette.
  if (state.vignette !== false) {
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10,2,20,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  // Grain: deterministic speckles.
  if (state.grain !== false) {
    const rng = mulberry(20261120);
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < Math.floor((w * h) / 900); i++) {
      const gx = rng() * w;
      const gy = rng() * h;
      ctx.fillStyle = rng() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(gx, gy, 1.6, 1.6);
    }
    ctx.restore();
  }
}

/** Renders `state` at an export size and returns the fresh canvas. */
export function renderCoverToSize(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
