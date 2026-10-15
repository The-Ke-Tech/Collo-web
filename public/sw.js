/* COLLTECH service worker
 *
 * When a visitor has NO internet and opens (or reloads) any page, the browser would normally show its own
 * "No internet" screen. This worker shows /offline.html instead (no links, branded), and lets a short list
 * of public info pages be read offline after they have been saved once.
 *
 * Only active in production builds (registered by ServiceWorkerRegister).
 */

const VERSION = 'colltech-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = '/offline.html';

// Public pages that can be read offline. EDIT to match your real routes and keep in sync with public/offline.html
const READABLE_PAGES = ['/about-us'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const statics = await caches.open(STATIC_CACHE);
      await statics.add(new Request(OFFLINE_URL, { cache: 'reload' }));

      // A route that doesn't exist (or fails) is skipped without breaking the install
      const pages = await caches.open(PAGE_CACHE);
      await Promise.allSettled(READABLE_PAGES.map((path) => pages.add(path)));

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch the API or other sites
  if (url.pathname.startsWith('/api/')) return;

  // Page navigations: network first, then a saved readable page, then the offline screen
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok && READABLE_PAGES.includes(url.pathname)) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        } catch {
          const saved = await caches.match(request, { ignoreSearch: true });
          if (saved) return saved;
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
    return;
  }

  // Next.js build files: cache first (their names change on every build)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
  }
});