const CACHE_NAME = 'minimarket-v3';
const urlsToCache = [
  '.',
  'index.html',
  'style.css',
  'main.js',
  'db.js',
  'manifest.json',
  'icon.png'
];

// Installation
self.addEventListener('install', event => {
  console.log('Service Worker: Installation...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Erreur cache:', err))
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Prêt');
      return self.clients.claim();
    })
  );
});

// Fetch - Stratégie simplifiée pour iOS
self.addEventListener('fetch', event => {
  // Ne pas intercepter les appels externes
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(networkResponse => {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          });
      })
  );
});