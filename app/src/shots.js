// Fixed scenes for screenshots.
//   ?shot=cover&size=1920x1080|1080x1350|1080x1080&photo=pier&photo2=boulevard&photo3=pier
//       &layout=nights&grade=sunset&caption=VICE%20CITY
//     → the exported cover alone, at the requested size.
//   ?shot=editor&photo=boulevard&caption=BOULEVARD%20QUEEN
//     → the editor with a photo loaded.
// window.__shotReady is set once painted (after webfonts load).
export async function runShot(shot, query, state, loadImage, redraw, selectPanel) {
  const canvas = document.getElementById('cover');
  const captionEl = document.getElementById('caption');
  const subEl = document.getElementById('sub');
  state.layout = query.get('layout') ?? state.layout;
  state.grade = query.get('grade') ?? state.grade;
  state.caption = query.get('caption') ?? state.caption;
  state.sub = query.get('sub') ?? state.sub;
  if (captionEl) captionEl.value = state.caption;
  if (subEl) subEl.value = state.sub;
  const size = query.get('size');
  if (shot === 'cover' && size) {
    const [w, h] = size.split('x').map(Number);
    if (w > 0 && h > 0) { canvas.width = w; canvas.height = h; }
    document.body.classList.add('shot-cover');
  }
  const names = [query.get('photo') ?? 'pier', query.get('photo2') ?? 'boulevard', query.get('photo3') ?? 'pier'];
  const imgs = await Promise.all(names.map((n) => loadImage(`samples/${n}.jpg`)));
  imgs.forEach((img, i) => { state.panels[i].img = img; });
  if (document.fonts?.ready) {
    try { await document.fonts.load('100px Anton'); await document.fonts.ready; } catch { /* fall back to system font */ }
  }
  selectPanel(0);
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
