const CACHE = 'planning-2a-v6';
const SCOPE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const STATIC = [`${SCOPE}/`, `${SCOPE}/schedule.json`, `${SCOPE}/manifest.webmanifest`, `${SCOPE}/favicon.svg`];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('planning-2a-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('/schedule.json')) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    if (response.ok && response.type === 'basic') event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {}));
    return response;
  }).catch(async () => (await caches.match(event.request)) || new Response('Hors connexion', { status: 503 })));
});
