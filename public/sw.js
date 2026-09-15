/**
 * PriceSnap Service Worker
 * Caching strategy:
 *   - Static assets (JS, CSS, images, fonts): Cache-First
 *   - API calls (/api/): Network-First with cache fallback
 *   - Navigation requests: Network-First with offline fallback
 *   - Fonts: Cache-First (don't waste bandwidth refetching)
 */

const STATIC_CACHE = 'pricenames-static-v1';
const RUNTIME_CACHE = 'pricenames-runtime-v1';
const HTML_CACHE = 'pricenames-html-v1';

// Pre-cache on install — PriceSnap shell
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== HTML_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Navigation → Network-First, offline HTML fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, HTML_CACHE));
    return;
  }

  // API calls → Network-First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Fonts → Cache-First (never refetch)
  if (url.pathname.includes('/fonts/') || url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Everything else (images, JS, CSS) → Cache-First
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ── Strategy: Cache-First ────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineResponse();
  }
}

// ── Strategy: Network-First ──────────────────
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineResponse();
  }
}

// ── Offline Fallback ─────────────────────────
async function offlineResponse() {
  const cached = await caches.match('/index.html');
  if (cached) return cached;

  return new Response(
    `<html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>PriceSnap — Offline</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background: #0A1628; color: #94A3B8;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; text-align: center; padding: 2rem;
          }
          .icon { font-size: 3rem; margin-bottom: 1rem; }
          h1 { color: #10B981; font-size: 1.5rem; margin-bottom: 1rem; font-family: 'Space Grotesk', sans-serif; }
          p { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div>
          <div class="icon">📷</div>
          <h1>You're offline</h1>
          <p>PriceSnap needs a connection to scan items and check prices. Check your connection and try again.</p>
        </div>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
