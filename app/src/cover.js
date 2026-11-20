// Vice City Nights — cover renderer (canvas, no network, no external assets).
// Draws an original multi-panel poster: sunset sky, sun disc, vector skyline
// and palm silhouettes, photo panels with per-panel crop, and bold condensed
// caption lettering with outline + drop shadow. No Rockstar art, logo, or font.

export const DEFAULT_STATE = {
  layout: 'diagonal',
  grade: 75,
  neon: 80,
  grain: 35,
  skyline: true,
  vignette: true,
  caption: 'VICE CITY NIGHTS',
  sub: 'OUT NOW · GRAND THEFT AUTO VI',
  capSize: 104,
  capY: 82,
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
  if (layout === 'triptych') {
    const gap = Math.round(w * 0.02);
    const pw = (w - 2 * m - 2 * gap) / 3;
    const ph = h - 2 * m;
    return [0, 1, 2].map((i) => ({ x: m + i * (pw + gap), y: m, w: pw, h: ph, tilt: 0 }));
  }
  if (layout === 'stack') {
    const gap = Math.round(w * 0.025);
    const heroH = (h - 2 * m - gap) * 0.62;
    const stripH = h - 2 * m - gap - heroH;
    const pw = (w - 2 * m - gap) / 2;
    return [
      { x: m, y: m, w: w - 2 * m, h: heroH, tilt: 0 },
      { x: m, y: m + heroH + gap, w: pw, h: stripH, tilt: 0 },
      { x: m + pw + gap, y: m + heroH + gap, w: pw, h: stripH, tilt: 0 },
    ];
  }
  // diagonal: big tilted hero on the left, two stacked panels on the right.
  const gap = Math.round(w * 0.025);
  const heroW = (w - 2 * m - gap) * 0.62;
  const sideW = w - 2 * m - gap - heroW;
  const sideH = (h - 2 * m - gap) / 2;
  return [
    { x: m, y: m, w: heroW, h: h - 2 * m, tilt: -0.045 },
    { x: m + heroW + gap, y: m, w: sideW, h: sideH, tilt: 0.03 },
    { x: m + heroW + gap, y: m + sideH + gap, w: sideW, h: sideH, tilt: -0.02 },
  ];
}

function sunsetSky(ctx, w, h, grade) {
  const g = grade / 100;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, mix('#2b1055', '#3d1a6e', g));
  sky.addColorStop(0.42, mix('#7b2d8b', '#ff2e88', g));
  sky.addColorStop(0.68, mix('#ff7a3d', '#ff9a3d', g));
  sky.addColorStop(1, mix('#ffc46b', '#ffd97a', g));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Sun disc with horizontal slats, low on the horizon.
  const cx = w * 0.5, cy = h * 0.46, r = Math.min(w, h) * 0.17;
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

function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function drawSkyline(ctx, w, h) {
  const base = h * 0.86;
  ctx.fillStyle = '#160a2e';
  // Back row of towers.
  let x = -w * 0.02;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  while (x < w * 1.02) {
    const bw = w * (0.05 + rnd() * 0.06);
    const bh = h * (0.10 + rnd() * 0.22);
    ctx.fillRect(x, base - bh, bw, bh);
    if (rnd() > 0.6) { // rooftop antenna
      ctx.fillRect(x + bw / 2 - 1, base - bh - h * 0.05, 2, h * 0.05);
    }
    x += bw + w * 0.008;
  }
  // Front row, lower and darker, with lit windows.
  ctx.fillStyle = '#0d051f';
  x = -w * 0.01;
  while (x < w * 1.01) {
    const bw = w * (0.07 + rnd() * 0.05);
    const bh = h * (0.05 + rnd() * 0.09);
    ctx.fillRect(x, base - bh, bw, bh + h * 0.14);
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

function drawPalm(ctx, x, y, s, lean) {
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

function drawPhotoInto(ctx, img, rect, panel, w, h) {
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
  const wash = ctx.createLinearGradient(x, y, x, y + ph);
  wash.addColorStop(0, 'rgba(255,46,136,0.10)');
  wash.addColorStop(0.6, 'rgba(255,122,61,0.08)');
  wash.addColorStop(1, 'rgba(43,16,85,0.22)');
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, pw, ph);
  ctx.restore();
}

function drawCaption(ctx, w, h, state) {
  let size = (state.capSize / 1080) * w;
  const y = (state.capY / 100) * h;
  const spacing = (state.tracking / 1080) * w;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = (state.caption || 'VICE CITY NIGHTS').toUpperCase();
  // Auto-fit: shrink the headline until it fits inside 94% of the width.
  const measure = (s) => {
    ctx.font = `700 ${s}px Oswald, "Arial Narrow", sans-serif`;
    return [...text].reduce((a, ch) => a + ctx.measureText(ch).width, 0) + spacing * Math.max(0, text.length - 1);
  };
  while (size > w * 0.04 && measure(size) > w * 0.94) size *= 0.94;
  const font = `700 ${size}px Oswald, "Arial Narrow", sans-serif`;
  ctx.font = font;
  // Letter-spaced manual draw so tracking works in every browser.
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, text.length - 1);
  let cx = w / 2 - total / 2;
  const drawLine = (mode) => {
    let px = cx;
    for (let i = 0; i < text.length; i++) {
      if (mode === 'fill') ctx.fillText(text[i], px + widths[i] / 2, y);
      else ctx.strokeText(text[i], px + widths[i] / 2, y);
      px += widths[i] + spacing;
    }
  };
  // Drop shadow, thick dark outline, white fill, pink under-glow.
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
  ctx.fillStyle = '#ffffff';
  drawLine('fill');
  ctx.restore();

  // Sub-caption ribbon.
  const sub = (state.sub || '').toUpperCase();
  if (sub) {
    const subSize = size * 0.24;
    ctx.save();
    ctx.font = `600 ${subSize}px Oswald, "Arial Narrow", sans-serif`;
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

function addGrain(ctx, w, h, amount) {
  const n = Math.floor((amount / 100) * 2600);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
  }
  ctx.restore();
}

function addVignette(ctx, w, h) {
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
  sunsetSky(ctx, w, h, state.grade);
  if (state.skyline) {
    drawSkyline(ctx, w, h);
    drawPalm(ctx, w * 0.06, h * 0.86, Math.min(w, h) / 340, -0.10);
    drawPalm(ctx, w * 0.94, h * 0.88, Math.min(w, h) / 300, 0.12);
    drawPalm(ctx, w * 0.86, h * 0.845, Math.min(w, h) / 460, 0.05);
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
    drawPhotoInto(ctx, img, rect, panel, w, h);
    ctx.lineWidth = Math.max(3, w * 0.006);
    ctx.strokeStyle = i === 0 ? '#ff2e88' : '#eaf6ff';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  });
  drawCaption(ctx, w, h, state);
  if (state.vignette) addVignette(ctx, w, h);
  if (state.grain > 0) addGrain(ctx, w, h, state.grain);
  // Fan-made tag, small, bottom-right.
  ctx.save();
  ctx.font = `600 ${Math.max(11, w * 0.011)}px Oswald, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('FAN-MADE · NOT AFFILIATED WITH ROCKSTAR GAMES', w - w * 0.02, h - h * 0.015);
  ctx.restore();
}
