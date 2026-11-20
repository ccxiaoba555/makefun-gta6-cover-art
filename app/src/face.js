// Vice City Nights v7 — face-aware cropping.
// detectFaceBox(img) returns the face box in image pixels, or null.
// Preferred path: the browser's FaceDetector (Shape Detection API).
// Fallback (headless shells and browsers without it): a small offline
// skin-tone scan — the image is shrunk to ~120px wide, skin-coloured
// pixels are marked, and the densest window wins. Deterministic: the
// same image always yields the same box.

function isSkin(r, g, b) {
  return r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15;
}

function skinFallback(img) {
  const sw = 120;
  const sh = Math.max(8, Math.round((img.naturalHeight / img.naturalWidth) * sw));
  const cv = document.createElement('canvas');
  cv.width = sw;
  cv.height = sh;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, sw, sh);
  let data;
  try {
    data = ctx.getImageData(0, 0, sw, sh).data;
  } catch {
    return null;
  }
  // Skin mask + summed-area table so window density is O(1) per window.
  const mask = new Uint8Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    mask[i] = isSkin(r, g, b) ? 1 : 0;
  }
  const sat = new Int32Array((sw + 1) * (sh + 1));
  for (let y = 0; y < sh; y++) {
    let row = 0;
    for (let x = 0; x < sw; x++) {
      row += mask[y * sw + x];
      sat[(y + 1) * (sw + 1) + x + 1] = sat[y * (sw + 1) + x + 1] + row;
    }
  }
  const win = (x0, y0, x1, y1) =>
    sat[y1 * (sw + 1) + x1] - sat[y0 * (sw + 1) + x1]
    - sat[y1 * (sw + 1) + x0] + sat[y0 * (sw + 1) + x0];
  // A face is roughly a third of the frame wide; try two window sizes.
  let best = null;
  for (const frac of [0.34, 0.26]) {
    const ww = Math.max(16, Math.round(sw * frac));
    const wh = Math.max(16, Math.round(sh * frac * 1.15));
    const step = 4;
    for (let y = 0; y + wh <= sh; y += step) {
      for (let x = 0; x + ww <= sw; x += step) {
        const count = win(x, y, x + ww, y + wh);
        const density = count / (ww * wh);
        if (!best || density > best.density) best = { x, y, ww, wh, density };
      }
    }
    // A convincing face patch: at least a quarter of the window is skin.
    if (best && best.density >= 0.25) break;
    best = null;
  }
  if (!best || best.density < 0.25) return null;
  const kx = img.naturalWidth / sw;
  const ky = img.naturalHeight / sh;
  const pad = 0.15;
  const x = Math.max(0, (best.x - best.ww * pad) * kx);
  const y = Math.max(0, (best.y - best.wh * pad) * ky);
  const w = Math.min(img.naturalWidth - x, best.ww * (1 + pad * 2) * kx);
  const h = Math.min(img.naturalHeight - y, best.wh * (1 + pad * 2) * ky);
  return { x, y, w, h };
}

export async function detectFaceBox(img) {
  const FD = typeof FaceDetector !== 'undefined' ? FaceDetector : null;
  if (FD) {
    try {
      const detector = new FD({ fastMode: true });
      const faces = await detector.detect(img);
      if (faces && faces.length) {
        const f = faces[0].boundingBox;
        return { x: f.x, y: f.y, w: f.width, h: f.height };
      }
    } catch {
      // Fall through to the offline skin-tone scan below.
    }
  }
  return skinFallback(img);
}

// faceCrop(img, box, panelW, panelH, tight) -> { zoom, ox, oy }.
// Centres the face box in the panel (tight: face ~85% of panel width,
// normal: ~60%) and clamps the offsets so the photo still covers the panel.
// zoom/ox/oy match the panel-state shape used by drawPhotoInto in cover.js.
export function faceCrop(img, box, panelW, panelH, tight) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = Math.max(panelW / iw, panelH / ih);
  const want = (tight ? 0.85 : 0.60) * panelW;
  let zoom = want / (box.w * base);
  zoom = Math.min(4, Math.max(1, zoom));
  const dw = iw * base * zoom;
  const dh = ih * base * zoom;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  let ox = -((cx - iw / 2) * base * zoom) / panelW;
  let oy = -((cy - ih / 2) * base * zoom) / panelH;
  const maxOx = Math.max(0, (dw - panelW) / 2 / panelW);
  const maxOy = Math.max(0, (dh - panelH) / 2 / panelH);
  ox = Math.min(maxOx, Math.max(-maxOx, ox));
  oy = Math.min(maxOy, Math.max(-maxOy, oy));
  return { zoom, ox, oy };
}
