/**
 * sw.js — Service Worker
 *
 * Place this file in your project's  public/  folder so Vite copies it to
 * the build root.  GitHub Pages then serves it at the correct scope:
 *   https://chrispinmajormw-star.github.io/Ujamaadash/sw.js
 *
 * Also make sure your vite.config.ts sets:
 *   base: '/Ujamaadash/'
 * and that your service worker registration uses the correct scope:
 *   navigator.serviceWorker.register('/Ujamaadash/sw.js', { scope: '/Ujamaadash/' })
 */

const CACHE_NAME = 'ett-malawi-v2';
const STATIC_ASSETS = [
  './',          // resolves to the sub-path root on GitHub Pages
  './index.html',
  './manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch — network-first for API, cache-first for static assets ─────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Always go to network for API calls — never serve stale data
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
