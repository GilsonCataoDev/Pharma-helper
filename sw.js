// FarmaApp Service Worker v1.1.0
const CACHE_NAME = 'farmaapp-v1.1';
const STATIC_CACHE = 'farmaapp-static-v1.1';
const DYNAMIC_CACHE = 'farmaapp-dynamic-v1.1';

// Determine base scope dynamically
const BASE_PATH = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);

const PRE_CACHE_FILES = [
  '',
  'index.html',
  'manifest.json',
  'src/styles/main.css',
  'src/app.js',
  'src/components/Header.js',
  'src/components/NavBar.js',
  'src/components/SearchBar.js',
  'src/db/database.js',
  'src/modules/home/index.js',
  'src/modules/receitas/index.js',
  'src/modules/equivalencia/index.js',
  'src/modules/interacoes/index.js',
  'src/modules/calculadora/index.js',
  'src/modules/pedidos/index.js',
  'src/modules/indicacoes/index.js',
  'src/data/receitas-regras.json',
  'src/data/equivalencias.json',
  'src/data/interacoes.json',
  'src/data/medicamentos.json'
].map(file => BASE_PATH + file);

// Install event — pre-cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRE_CACHE_FILES);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Pre-cache non-fatal note:', err);
        return self.skipWaiting();
      })
  );
});

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event — Cache First for assets, Network First for others
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(async () => {
        // Fallback to cached index.html for navigation requests
        if (request.mode === 'navigate') {
          const fallback = await caches.match(BASE_PATH + 'index.html');
          if (fallback) return fallback;
        }
        return new Response('Offline — sem conexão disponível.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
