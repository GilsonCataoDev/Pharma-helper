// FarmaApp Service Worker v1.3.0
// Strategy: Cache First for JS/CSS/HTML assets, Network First for JSON data
const STATIC_CACHE = 'farmaapp-static-v1.3';
const DYNAMIC_CACHE = 'farmaapp-dynamic-v1.3';

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
  'src/modules/busca/index.js',
].map(file => BASE_PATH + file);

// JSON data files — always try network first so updates propagate
const DATA_FILE_PATTERNS = [
  /\/src\/data\/.*\.json$/,
];

function isDataFile(url) {
  return DATA_FILE_PATTERNS.some(re => re.test(url));
}

// Install event — pre-cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRE_CACHE_FILES))
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
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ──────────────────────────────────────
// Fetch strategies
// ──────────────────────────────────────

/**
 * Cache First — for JS, CSS, HTML, images.
 * Serve from cache instantly; update cache in background.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Update cache in background (stale-while-revalidate)
    fetch(request).then(async (fresh) => {
      if (fresh && fresh.status === 200) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, fresh);
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    // Navigation fallback
    if (request.mode === 'navigate') {
      const fallback = await caches.match(BASE_PATH + 'index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

/**
 * Network First — for JSON data files.
 * Always try network first so data updates are seen; fall back to cache offline.
 */
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (CDNs, Gemini API, etc.)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isDataFile(request.url)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
