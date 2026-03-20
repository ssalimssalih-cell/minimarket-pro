const CACHE_NAME = 'minimarket-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/db.js',
  '/manifest.json',
  '/icon.png',  // ← Ici aussi pour la mise en cache
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
];

// Installation
self.addEventListener('install', event => {
  console.log('Service Worker: Installation...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache des ressources');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Erreur de cache:', error);
        });
      })
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
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Mise à jour en arrière-plan
          event.waitUntil(
            fetch(event.request)
              .then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Erreur réseau:', error);
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/icon.png');
            }
          });
      })
  );
});