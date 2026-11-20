// Vice City Nights — cover renderer (canvas, offline, no external assets).
// Draws an original multi-panel poster: a gradient sky with a slatted sun,
// vector skyline and palm silhouettes, photo panels with per-panel crop, and
// heavy display caption lettering with outline + drop shadow. No Rockstar
// artwork, logo, character, or game font is used anywhere.

export const GRADE_PRESETS = {
  sunset: { top: '#2b1055', mid: '#ff2e88', low: '#ff9a3d', bottom: '#ffd97a', wash: '255,122,61' },
  neon: { top: '#0b0626', mid: '#7a2cff', low: '#ff2e88', bottom: '#22e6ff', wash: '34,230,255' },
  dawn: { top: '#1c2a5e', mid: '#e85d9e', low: '#ffb347', bottom: '#fff3b0', wash: '255,179,71' },
};

export const DEFAULT_STATE = {
  layout: 'diagonal',
  preset: 'sunset',
  grade: 75,
  neon: 80,
  grain: 35,
  skyline: true,
  vignette: true,
  caption: 'VICE CITY NIGHTS',
  sub: 'OUT NOW · GRAND THEFT AUTO VI',
  capSize: 104,
  capY: 82,
  capTilt: -2,
  capStyle: 'solid',
  tracking: 8,
  // panels[i] = { photo: index into photos[] | -1, zoom, ox, oy } (ox/oy in -1..1)
  panels: [
    { photo: 0, zoom: 1.3, ox: 0, oy: 0 },
    { photo: 1, zoom: 1.3, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.3, ox: 0, oy: 0 },
  ],
};

export function panelRects(layout, w, h) {
  const m = Math.round(w * 0.045); // outer margin
  const gap = Math.round(w * 0.025);
  if (layout === 'triptych') {
    const pw = (w - 2 * m - 2 * gap) / 3;
    const ph = h - 2 * m;
    return [0, 1, 2].map((i) => ({ x: m + i * (pw + gap), y: m, w: pw, h: ph, tilt: 0 }));
  }
  if (layout === 'stack') {
    const heroH = (h - 2 * m - gap) * 0.62;
    const stripH = h - 2 * m - gap - heroH;
    const pw = (w - 2 * m - gap) / 2;
    return [
      { x: m, y: m, w: w - 2 * m, h: heroH, tilt: 0 },
      { x: m, y: m + heroH + gap, w: pw, h: stripH, tilt: 0 },
      { x: m + pw + gap, y: m + heroH + gap, w: pw, h: stripH, tilt: 0 },
    ];
  }
  if (layout === 'billboard') {
    // Wide hero across the top, a caption band, then two panels below.
    const heroH = (h - 2 * m) * 0.52;
    const bandH = Math.round(h * 0.09);
    const lowerH = h - 2 * m - heroH - bandH - gap;
    const pw = (w - 2 * m - gap) / 2;
    const ly = m + heroH + bandH + gap;
    return [
      { x: m, y: m, w: w - 2 * m, h: heroH, tilt: 0 },
      { x: m, y: ly, w: pw, h: lowerH, tilt: 0.02 },
      { x: m + pw + gap, y: ly, w: pw, h: lowerH, tilt: -0.02 },
    ];
  }
  // diagonal: big tilted hero on the left, two stacked panels on the right.
  const heroW = (w - 2 * m - gap) * 0.62;
  const sideW = w - 2 * m - gap - heroW;
  const sideH = (h - 2 * m - gap) / 2;
  return [
    { x: m, y: m, w: heroW, h: h - 2 * m, tilt: -0.045 },
    { x: m + heroW + gap, y: m, w: sideW, h: sideH, tilt: 0.03 },
    { x: m + heroW + gap, y: m + sideH + gap, w: sideW, h: sideH, tilt: -0.02 },
  ];
}

function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// Deterministic pseudo-random stream so the skyline is identical on every
// render at a given size (no flicker between preview and export).
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function paintSky(ctx, w, h, state) {
  const g = state.grade / 100;
  const p = GRADE_PRESETS[state.preset] || GRADE_PRESETS.sunset;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, mix('#12081f', p.top, g));
  sky.addColorStop(0.42, mix('#5b2a72', p.mid, g));
  sky.addColorStop(0.68, mix('#c65a4a', p.low, g));
  sky.addColorStop(1, mix('#e8b06a', p.bottom, g));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Sun disc with horizontal slats, low on the horizon, wrapped in a glow.
  const cx = w * 0.5, cy = h * 0.46, r = Math.min(w, h) * 0.17;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
  glow.addColorStop(0, 'rgba(255,179,71,0.55)');
  glow.addColorStop(1, 'rgba(255,179,71,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, '#fff3b0');
  sun.addColorStop(0.55, '#ffb347');
  sun.addColorStop(1, '#ff2e88');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(43,16,85,0.85)';
  let y = cy + r * 0.08;
  let th = 3;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, th);
    y += th + r * 0.11;
    th += 3;
  }
  ctx.restore();
}

function paintSkyline(ctx, w, h) {
  const base = h * 0.86;
  const rnd = seeded(20261120);
  // Back row of towers with blinking rooftop beacons.
  ctx.fillStyle = '#160a2e';
  let x = -w * 0.02;
  while (x < w * 1.02) {
    const bw = w * (0.05 + rnd() * 0.06);
    const bh = h * (0.10 + rnd() * 0.22);
    ctx.fillRect(x, base - bh, bw, bh);
    if (rnd() > 0.55) { // rooftop antenna + beacon dot
      ctx.fillRect(x + bw / 2 - 1, base - bh - h * 0.05, 2, h * 0.05);
      ctx.fillStyle = '#ff2e88';
      ctx.fillRect(x + bw / 2 - 2, base - bh - h * 0.05 - 4, 4, 4);
      ctx.fillStyle = '#160a2e';
    }
    x += bw + w * 0.008;
  }
  // Front row, lower and darker, with lit windows and one neon sign block.
  ctx.fillStyle = '#0d051f';
  x = -w * 0.01;
  let signDone = false;
  while (x < w * 1.01) {
    const bw = w * (0.07 + rnd() * 0.05);
    const bh = h * (0.05 + rnd() * 0.09);
    ctx.fillRect(x, base - bh, bw, bh + h * 0.14);
    if (!signDone && rnd() > 0.5) {
      signDone = true;
      ctx.fillStyle = '#ff2e88';
      ctx.fillRect(x + bw * 0.18, base - bh + h * 0.02, bw * 0.64, h * 0.035);
      ctx.fillStyle = '#0d051f';
    }
    ctx.fillStyle = 'rgba(255,214,120,0.85)';
    for (let wy = base - bh + 8; wy < base - 6; wy += 16) {
      for (let wx = x + 6; wx < x + bw - 6; wx += 14) {
        if (rnd() > 0.72) ctx.fillRect(wx, wy, 4, 6);
      }
    }
    ctx.fillStyle = '#0d051f';
    x += bw + w * 0.012;
  }
}

function paintPalm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = '#0d051f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -52, 14, -96);
  ctx.stroke();
  ctx.fillStyle = '#0d051f';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.08 - (i / 6) * Math.PI * 0.84;
    const len = 42 - Math.abs(i - 3) * 4;
    ctx.save();
    ctx.translate(14, -96);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -10, len, 6);
    ctx.quadraticCurveTo(len * 0.5, 4, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function paintPhoto(ctx, img, rect, panel, preset) {
  const { x, y, w: pw, h: ph } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  if (img) {
    const zoom = panel.zoom || 1;
    const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (pw - dw) / 2 + (panel.ox || 0) * pw * 0.25;
    const dy = y + (ph - dh) / 2 + (panel.oy || 0) * ph * 0.25;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // Placeholder panel: deep violet with a neon grid when no photo is set.
    const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
    g.addColorStop(0, '#3d1a6e');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, pw, ph);
    ctx.strokeStyle = 'rgba(34,230,255,0.25)';
    ctx.lineWidth = 1;
    for (let gx = x; gx <= x + pw; gx += 34) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + ph); ctx.stroke();
    }
    for (let gy = y; gy <= y + ph; gy += 34) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + pw, gy); ctx.stroke();
    }
  }
  // Warm sunset wash over every panel so photos grade into the poster.
  const p = GRADE_PRESETS[preset] || GRADE_PRESETS.sunset;
  const wash = ctx.createLinearGradient(x, y, x, y + ph);
  wash.addColorStop(0, `rgba(${p.wash},0.10)`);
  wash.addColorStop(0.6, 'rgba(255,122,61,0.08)');
  wash.addColorStop(1, 'rgba(43,16,85,0.22)');
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, pw, ph);
  ctx.restore();
}

// One shared grain tile, built once per size from a seeded stream, so the
// grain is stable between preview and export instead of re-randomising.
let grainTile = null;
let grainKey = '';
function grainPattern(ctx, w, h, amount) {
  const key = `${w}x${h}`;
  if (grainTile && grainKey === key) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  const rnd = seeded(777);
  const img = tctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd() > 0.5 ? 255 : 0;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = Math.floor(rnd() * 22);
  }
  tctx.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(tile, 'repeat');
  grainKey = key;
  return grainTile;
}

function paintCaption(ctx, w, h, state) {
  let size = (state.capSize / 1080) * w;
  const y = (state.capY / 100) * h;
  const spacing = (state.tracking / 1080) * w;
  const tilt = ((state.capTilt || 0) * Math.PI) / 180;
  const text = (state.caption || 'VICE CITY NIGHTS').toUpperCase();
  ctx.save();
  ctx.translate(w / 2, y);
  ctx.rotate(tilt);
  ctx.translate(-w / 2, -y);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontFor = (s) => `400 ${s}px "Archivo Black", "Arial Black", sans-serif`;
  // Auto-fit: shrink the headline until it fits inside 94% of the width.
  const measure = (s) => {
    ctx.font = fontFor(s);
    return [...text].reduce((a, ch) => a + ctx.measureText(ch).width, 0) + spacing * Math.max(0, text.length - 1);
  };
  while (size > w * 0.04 && measure(size) > w * 0.94) size *= 0.94;
  ctx.font = fontFor(size);
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, text.length - 1);
  const drawLine = (mode) => {
    let px = w / 2 - total / 2;
    for (let i = 0; i < text.length; i++) {
      if (mode === 'fill') ctx.fillText(text[i], px + widths[i] / 2, y);
      else ctx.strokeText(text[i], px + widths[i] / 2, y);
      px += widths[i] + spacing;
    }
  };
  // Drop shadow + thick dark outline; solid fill, or hollow outline style.
  ctx.shadowColor = 'rgba(255,46,136,0.9)';
  ctx.shadowBlur = size * 0.22;
  ctx.shadowOffsetY = size * 0.05;
  ctx.lineWidth = size * 0.16;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a2e';
  drawLine('stroke');
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (state.capStyle === 'outline') {
    // Hollow letters need a soft dark plate behind them, or they vanish
    // against the bright sun disc. The plate is sized to the text block.
    ctx.fillStyle = 'rgba(13,5,31,0.45)';
    ctx.fillRect(w / 2 - total / 2 - size * 0.28, y - size * 0.58, total + size * 0.56, size * 1.16);
    ctx.lineWidth = size * 0.045;
    ctx.strokeStyle = '#ffffff';
    drawLine('stroke');
  } else {
    ctx.fillStyle = '#ffffff';
    drawLine('fill');
  }
  ctx.restore();

  // Sub-caption ribbon.
  const sub = (state.sub || '').toUpperCase();
  if (sub) {
    const subSize = size * 0.24;
    ctx.save();
    ctx.font = `400 ${subSize}px "Archivo Black", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sw = ctx.measureText(sub).width + subSize * 1.6;
    const sy = y + size * 0.62;
    ctx.fillStyle = 'rgba(13,5,31,0.82)';
    ctx.fillRect(w / 2 - sw / 2, sy - subSize * 0.72, sw, subSize * 1.44);
    ctx.strokeStyle = '#22e6ff';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(w / 2 - sw / 2, sy - subSize * 0.72, sw, subSize * 1.44);
    ctx.fillStyle = '#aef4ff';
    ctx.fillText(sub, w / 2, sy + subSize * 0.04);
    ctx.restore();
  }
}

function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(10,4,24,0)');
  g.addColorStop(1, 'rgba(10,4,24,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Renders the poster onto `canvas` at its own pixel size.
// photos: array of HTMLImageElement (or null entries). state: DEFAULT_STATE shape.
export function renderCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  paintSky(ctx, w, h, state);
  if (state.skyline) {
    paintSkyline(ctx, w, h);
    paintPalm(ctx, w * 0.06, h * 0.86, Math.min(w, h) / 340, -0.10);
    paintPalm(ctx, w * 0.94, h * 0.88, Math.min(w, h) / 300, 0.12);
    paintPalm(ctx, w * 0.86, h * 0.845, Math.min(w, h) / 460, 0.05);
  }
  const rects = panelRects(state.layout, w, h);
  const neonA = 0.35 + (state.neon / 100) * 0.65;
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || { photo: -1, zoom: 1.3, ox: 0, oy: 0 };
    const img = panel.photo >= 0 ? photos[panel.photo] : null;
    ctx.save();
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.tilt);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    // Neon border glow behind the panel, then the photo, then a crisp frame.
    ctx.shadowColor = i === 0 ? `rgba(255,46,136,${neonA})` : `rgba(34,230,255,${neonA * 0.8})`;
    ctx.shadowBlur = w * 0.02;
    ctx.fillStyle = '#fff';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.shadowBlur = 0;
    paintPhoto(ctx, img, rect, panel, state.preset);
    ctx.lineWidth = Math.max(3, w * 0.006);
    ctx.strokeStyle = i === 0 ? '#ff2e88' : '#eaf6ff';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  });
  paintCaption(ctx, w, h, state);
  if (state.vignette) paintVignette(ctx, w, h);
  if (state.grain > 0) {
    ctx.save();
    ctx.globalAlpha = state.grain / 100;
    ctx.fillStyle = grainPattern(ctx, w, h, state.grain);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  // Fan-made tag, small, bottom-right.
  ctx.save();
  ctx.font = `400 ${Math.max(11, w * 0.011)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('FAN-MADE · NOT AFFILIATED WITH ROCKSTAR GAMES', w - w * 0.02, h - h * 0.015);
  ctx.restore();
}
