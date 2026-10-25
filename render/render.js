// Headless renderer: serves this folder, opens scene in Chromium (SwiftShader WebGL), saves PNG.
// usage: node render.js --view street --w 2600 --h 3250 --out ../renders/hollow-tree-hotel.png [--time night] [--ao 0]
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s => { const [k, ...v] = s.trim().split(' '); return [k, v.join(' ') || 'true']; }));
const W = +(args.w || 2600), H = +(args.h || 3250), VIEW = args.view || 'street', SEED = args.seed || '7';
const EXTRA = (args.time ? `&time=${args.time}` : '') + (args.ao ? `&ao=${args.ao}` : '');
const OUT = path.resolve(args.out || `../renders/hollow-tree-hotel-${VIEW}.png`);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/index.html?w=${W}&h=${H}&view=${VIEW}&seed=${SEED}${EXTRA}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 1200000 });
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(data.split(',')[1], 'base64'));
  console.log(`saved ${OUT} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
