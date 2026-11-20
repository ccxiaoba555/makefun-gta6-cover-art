// Deterministic screenshot states for headless captures.
// ?shot=cover&photo=pier&caption=Sunset%20Heist        -> full-bleed cover render
// ?shot=editor&photo=boulevard&caption=Boulevard%20Queen -> the editor with a photo loaded
// ?shot=cover&photo=boulevard&layout=billboard          -> cover in the billboard layout
// Extra params: preset=sunset|neon|dawn, capstyle=solid|outline, tilt=<deg>.
// Any other query leaves the normal editor alone.
import { renderCover, DEFAULT_STATE } from './cover.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot === 'cover' || shot === 'editor') {
  const photoName = params.get('photo') || 'pier';
  const caption = params.get('caption') || 'Sunset Heist';
  const layout = params.get('layout') || 'diagonal';
  const preset = params.get('preset') || 'sunset';
  const capStyle = params.get('capstyle') || 'solid';
  const tilt = Number(params.get('tilt') ?? -2);
  const size = params.get('size') || '1080x1080';
  const [w, h] = size.split('x').map(Number);

  const img = new Image();
  img.onload = () => {
    const state = structuredClone(DEFAULT_STATE);
    state.layout = layout;
    state.preset = preset;
    state.capStyle = capStyle;
    state.capTilt = Number.isFinite(tilt) ? tilt : -2;
    state.caption = caption;
    state.sub = 'OUT NOW · GRAND THEFT AUTO VI';
    state.capSize = 110;
    state.capY = layout === 'billboard' ? 62 : 80;
    if (shot === 'cover') {
      // Standalone cover: hide the editor chrome, draw the poster edge to edge.
      document.body.innerHTML = '';
      document.body.style.margin = '0';
      document.body.style.background = '#0f0722';
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.style.display = 'block';
      c.style.width = '100vw';
      c.style.height = '100vh';
      c.style.objectFit = 'contain';
      document.body.appendChild(c);
      state.panels = [
        { photo: 0, zoom: 1.35, ox: 0, oy: 0 },
        { photo: 0, zoom: 1.5, ox: 0.1, oy: -0.05 },
        { photo: 0, zoom: 1.4, ox: -0.1, oy: 0.05 },
      ];
      renderCover(c, [img], state);
      document.title = 'cover-ready';
    } else {
      // Editor shot: let main.js load, then set the caption and grade so the
      // screenshot shows the working editor with a photo in every panel.
      const tick = setInterval(() => {
        const cap = document.getElementById('inp-caption');
        if (!cap) return;
        clearInterval(tick);
        cap.value = caption;
        cap.dispatchEvent(new Event('input', { bubbles: true }));
        const sub = document.getElementById('inp-sub');
        if (sub) {
          sub.value = 'OUT NOW · GRAND THEFT AUTO VI';
          sub.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const lay = document.getElementById('sel-layout');
        if (lay) {
          lay.value = layout;
          lay.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const pre = document.getElementById('sel-preset');
        if (pre) {
          pre.value = preset;
          pre.dispatchEvent(new Event('input', { bubbles: true }));
        }
        document.title = 'editor-ready';
      }, 120);
    }
  };
  img.src = 'samples/' + photoName + '.jpg';
}
