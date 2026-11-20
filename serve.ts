// Vice City Nights — local dev server.
// Serves app/ as static files on http://localhost:8080, no build step.
// Node standard library only; run with `node serve.ts`.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const port = Number(process.env.PORT || 8080);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(appDir, safePath === '/' ? 'index.html' : safePath);
  if (!filePath.startsWith(appDir + sep) && filePath !== appDir) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Vice City Nights serving app/ at http://localhost:${port}`);
});
