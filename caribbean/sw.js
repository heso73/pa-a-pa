// Pa a Pa Caribbean: offline support. To publish an update, change VERSION below.
const VERSION = 'papa-caribbean-v12';
const APP = ['./', './index.html', './styles.css', './engine.js', './app.js', './countries.json', './jamaica.json', './trinidad-tobago.json', './guyana.json', './barbados.json', './curacao.json', './aruba.json', './montserrat.json', './anguilla.json', './turks-and-caicos-islands.json', './british-virgin-islands.json', './cayman-islands.json', './bahamas.json', './belize.json', './saint-lucia.json', './dominica.json', './grenada.json', './saint-vincent-grenadines.json', './antigua-barbuda.json', './saint-kitts-nevis.json', './es/', './es/index.html', './es/app.js', './es/report-es.js', './es/countries.json', './es/dominican-republic.json', './es/puerto-rico.json', './es/cuba.json', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(APP.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('papa-caribbean-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (/goatcounter\.com|gc\.zgo\.at/.test(req.url)) return;
  // App files: network first (always the latest), local copy when offline
  if (new URL(req.url).origin === self.location.origin) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Fonts and other external files: local copy first, refreshed in the background
  e.respondWith(caches.match(req).then(cached => {
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
