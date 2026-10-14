// Dependency-free local server. Byte ranges let browsers seek the scroll video.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mp4':'video/mp4', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Accept-Ranges':'bytes', 'Cache-Control':'no-cache' };
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range':`bytes */${info.size}` }).end(); return; }
      const start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      const end = match[1] ? (match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range':`bytes */${info.size}` }).end(); return; }
      res.writeHead(206, { ...headers, 'Content-Range':`bytes ${start}-${end}/${info.size}`, 'Content-Length':end-start+1 });
      if (req.method === 'HEAD') res.end(); else createReadStream(file, {start,end}).pipe(res);
    } else {
      res.writeHead(200, {...headers, 'Content-Length':info.size});
      if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
    }
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Lothric: http://localhost:${port}`));
