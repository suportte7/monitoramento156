const CACHE_NAME = 'dvcc-156-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força a instalação imediata
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  return self.clients.claim();
});

// A GRANDE MUDANÇA: Estratégia "Network First" (Rede Primeiro)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Se a internet funcionar, clona a resposta fresquinha e guarda no cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        return response;
      })
      .catch(() => {
        // Se estiver offline (sem internet), aí sim puxa do cache
        return caches.match(e.request);
      })
  );
});
