// Vice City Nights — multi-panel GTA 6-style cover renderer.
// Draws entirely with canvas vector shapes + the user's own photos: no
// Rockstar artwork, logo, character or font is used anywhere. The skyline,
// palms, retro sun and grain are all drawn procedurally here.
export const GRADES = {
  sunset: { sky: ['#2b1055', '#7597de'], sun: '#ff9e5e', sunCore: '#ffd166', band: '#160a24', tint: 'rgba(255, 90, 120, 0.20)', accent: '#ff5da2', accent2: '#22d3ee' },
  neon: { sky: ['#0b0620', '#3b0f54'], sun: '#ff2e88', sunCore: '#ff7ad9', band: '#0a0618', tint: 'rgba(120, 60, 255, 0.22)', accent: '#22d3ee', accent2: '#ff2e88' },
  midnight: { sky: ['#050914', '#123a5e'], sun: '#f4f1de', sunCore: '#ffffff', band: '#05070f', tint: 'rgba(40, 110, 200, 0.18)', accent: '#7dd3fc', accent2: '#f59e0b' },
};

// Layouts in normalised (0..1) space: [x, y, w, h, rotationDeg] per panel.
export const LAYOUTS = {
  nights: [
    [0.045, 0.05, 0.60, 0.56, -2],
    [0.68, 0.05, 0.275, 0.27, 2],
    [0.68, 0.355, 0.275, 0.255, -1.5],
  ],
  split: [
    [0.045, 0.05, 0.46, 0.61, -1.5],
    [0.525, 0.05, 0.43, 0.61, 1.5],
    [0.60, 0.47, 0.35, 0.19, -2],
  ],
  strip: [
    [0.04, 0.05, 0.29, 0.61, -1],
    [0.355, 0.05, 0.29, 0.61, 1],
    [0.67, 0.05, 0.29, 0.61, -1],
  ],
};

export function defaultState() {
  return {
    layout: 'nights',
    grade: 'sunset',
    caption: 'VICE CITY',
    sub: 'NIGHTS  •  LEONIDA  •  2026',
    titleSize: 1,
    grain: true,
    vignette: true,
    panels: [
      { img: null, zoom: 1, ox: 0, oy: 0 },
      { img: null, zoom: 1, ox: 0, oy: 0 },
      { img: null, zoom: 1, ox: 0, oy: 0 },
    ],
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -34, 22, -58);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (-150 + i * 42) * (Math.PI / 180);
    const len = 34 - Math.abs(i - 2.5) * 4;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(22, -58);
    ctx.quadraticCurveTo(
      22 + Math.cos(a) * len * 0.6, -58 + Math.sin(a) * len * 0.55 - 8,
      22 + Math.cos(a) * len, -58 + Math.sin(a) * len + 12,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawSkyline(ctx, w, yBase, h, seed, color, lit) {
  const rnd = mulberry32(seed);
  ctx.fillStyle = color;
  let x = -10;
  while (x < w + 10) {
    const bw = 26 + rnd() * 60;
    const bh = h * (0.35 + rnd() * 0.65);
    ctx.fillRect(x, yBase - bh, bw, bh);
    if (rnd() > 0.6) { // rooftop antenna
      ctx.fillRect(x + bw / 2 - 1.5, yBase - bh - 14, 3, 14);
    }
    x += bw + 4 + rnd() * 14;
  }
  // Lit windows.
  const wrnd = mulberry32(seed + 7);
  ctx.fillStyle = lit;
  for (let i = 0; i < Math.floor(w / 26); i++) {
    if (wrnd() > 0.55) {
      ctx.globalAlpha = 0.5 + wrnd() * 0.5;
      ctx.fillRect(wrnd() * w, yBase - h * wrnd(), 4, 6);
    }
  }
  ctx.globalAlpha = 1;
}

function drawRetroSun(ctx, cx, cy, r, grade) {
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, grade.sunCore);
  g.addColorStop(1, grade.sun);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Horizontal slats cut across the lower half.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(43, 16, 85, 0.55)';
  let y = cy + r * 0.05;
  let th = 3;
  while (y < cy + r) { ctx.fillRect(cx - r, y, r * 2, th); y += th + 10; th += 3; }
  ctx.restore();
}

function drawPanelPhoto(ctx, rect, panel, w, h, grade) {
  const [nx, ny, nw, nh, rot] = rect;
  const x = nx * w, y = ny * h, pw = nw * w, ph = nh * h;
  ctx.save();
  ctx.translate(x + pw / 2, y + ph / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.translate(-pw / 2, -ph / 2);
  ctx.beginPath();
  ctx.rect(0, 0, pw, ph);
  ctx.clip();
  if (panel.img) {
    const iw = panel.img.naturalWidth, ih = panel.img.naturalHeight;
    const scale = Math.max(pw / iw, ph / ih) * (panel.zoom || 1);
    const dw = iw * scale, dh = ih * scale;
    const slackX = Math.max(0, (dw - pw) / 2), slackY = Math.max(0, (dh - ph) / 2);
    ctx.drawImage(panel.img, (pw - dw) / 2 + (panel.ox || 0) * slackX, (ph - dh) / 2 + (panel.oy || 0) * slackY, dw, dh);
  } else {
    // Procedural stand-in: sunset stripes + palms, so an empty panel still reads.
    const g = ctx.createLinearGradient(0, 0, 0, ph);
    g.addColorStop(0, '#ff9e5e'); g.addColorStop(0.55, '#ff5da2'); g.addColorStop(1, '#2b1055');
    ctx.fillStyle = g; ctx.fillRect(0, 0, pw, ph);
    drawRetroSun(ctx, pw * 0.68, ph * 0.42, Math.min(pw, ph) * 0.22, grade);
    ctx.fillStyle = '#160a24';
    ctx.fillRect(0, ph * 0.78, pw, ph * 0.22);
    drawPalm(ctx, pw * 0.16, ph * 0.82, Math.min(pw, ph) / 130, '#160a24');
    drawPalm(ctx, pw * 0.86, ph * 0.84, Math.min(pw, ph) / 170, '#160a24');
  }
  // Grade tint + bottom shade so lettering and borders sit on top cleanly.
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, pw, ph);
  const shade = ctx.createLinearGradient(0, ph * 0.55, 0, ph);
  shade.addColorStop(0, 'rgba(10, 4, 20, 0)');
  shade.addColorStop(1, 'rgba(10, 4, 20, 0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, pw, ph);
  // Thick border: white keyline + dark outer edge.
  ctx.lineWidth = Math.max(4, w * 0.006);
  ctx.strokeStyle = '#f8f4ec';
  ctx.strokeRect(0, 0, pw, ph);
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, pw - ctx.lineWidth * 2, ph - ctx.lineWidth * 2);
  ctx.restore();
}

function drawGrain(ctx, w, h) {
  const rnd = mulberry32(20261119);
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  const n = Math.floor((w * h) / 1400);
  for (let i = 0; i < n; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
  ctx.fillStyle = '#000000';
  for (let i = 0; i < n / 2; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
  ctx.restore();
}

/** Draws the full multi-panel cover onto `canvas` from a state object. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.nights;

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.62, grade.sky[1]);
  sky.addColorStop(1, grade.band);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun sits behind the hero panel (not in the gap between panels), so it
  // peeks out at the panel edges instead of floating in empty space.
  const heroCx = (layout[0][0] + layout[0][2] / 2) * w;
  drawRetroSun(ctx, heroCx, h * 0.30, Math.min(w, h) * 0.17, grade);
  // Distant skyline behind the panels.
  drawSkyline(ctx, w, h * 0.66, h * 0.10, 11, 'rgba(22, 10, 36, 0.55)', grade.accent2);

  // Panels.
  layout.forEach((rect, i) => drawPanelPhoto(ctx, rect, state.panels[i] || {}, w, h, grade));

  // Diagonal neon slash across the hero panel's top corner — the poster's accent.
  {
    const [hx, hy, hw, hh, hrot] = layout[0];
    ctx.save();
    ctx.translate((hx + hw / 2) * w, (hy + hh / 2) * h);
    ctx.rotate((hrot * Math.PI) / 180);
    ctx.translate(-(hw * w) / 2, -(hh * h) / 2);
    ctx.rotate(-24 * Math.PI / 180);
    ctx.translate(-hw * w * 0.1, -hh * h * 0.28);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, 0, hw * w * 1.2, Math.max(4, h * 0.008));
    ctx.fillStyle = grade.accent2;
    ctx.fillRect(0, Math.max(4, h * 0.008) + 2, hw * w * 1.2, Math.max(2, h * 0.004));
    ctx.restore();
  }

  // Bottom title band.
  const bandY = h * 0.68;
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, bandY, w, h - bandY);
  const bandTop = ctx.createLinearGradient(0, bandY, 0, bandY + h * 0.05);
  bandTop.addColorStop(0, grade.accent);
  bandTop.addColorStop(1, 'rgba(255, 93, 162, 0)');
  ctx.fillStyle = bandTop;
  ctx.fillRect(0, bandY, w, h * 0.012);
  drawSkyline(ctx, w, bandY + h * 0.005, h * 0.055, 29, '#0a0618', grade.accent);
  drawPalm(ctx, w * 0.035, bandY + h * 0.004, h / 900, '#0a0618');
  drawPalm(ctx, w * 0.965, bandY + h * 0.004, h / 1100, '#0a0618');

  // Caption: condensed Anton, white with neon outline + drop shadow.
  const text = (state.caption || '').trim().toUpperCase();
  if (text) {
    let size = h * 0.115 * (state.titleSize || 1);
    const setFont = (s) => { ctx.font = `${s}px Anton, 'Arial Narrow', sans-serif`; };
    setFont(size);
    while (ctx.measureText(text).width > w * 0.92 && size > 12) { size -= 2; setFont(size); }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cy = bandY + (h - bandY) * 0.42;
    ctx.save();
    ctx.translate(w / 2, cy);
    ctx.rotate(-1.2 * Math.PI / 180);
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 46, 136, 0.75)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeText(text, 0, 0);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = size * 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  // Sub-caption, letterspaced.
  const sub = (state.sub || '').trim().toUpperCase();
  if (sub) {
    const sSize = Math.max(10, h * 0.020);
    ctx.font = `700 ${sSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grade.accent2;
    const letters = sub.split('').join('\u2009');
    ctx.fillText(letters, w / 2, bandY + (h - bandY) * 0.82);
  }
  // Tiny fan-made line.
  ctx.font = `${Math.max(9, h * 0.011)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'right';
  ctx.fillText('FAN-MADE COVER  •  NOT AFFILIATED WITH ROCKSTAR GAMES', w * 0.985, h * 0.985);

  if (state.vignette) {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
  if (state.grain) drawGrain(ctx, w, h);
}

/** Hit-test: which panel (0..2) contains point (px,py) on a canvas of size w×h. */
export function panelAt(state, px, py, w, h) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.nights;
  for (let i = layout.length - 1; i >= 0; i--) {
    const [nx, ny, nw, nh] = layout[i];
    if (px >= nx * w && px <= (nx + nw) * w && py >= ny * h && py <= (ny + nh) * h) return i;
  }
  return -1;
}

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Landscape 1920 × 1080', w: 1920, h: 1080 },
];
