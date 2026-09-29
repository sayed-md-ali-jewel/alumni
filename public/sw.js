// Alumni Association Platform - Production Service Worker
const CACHE_VERSION = 'alumni-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.json',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. Install: Precache core shell assets & offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Precache failed:', err);
      })
  );
});

// 2. Activate: Clean up old cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== STATIC_CACHE && name !== RUNTIME_CACHE) {
              return caches.delete(name);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Listen for SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Strategy Router
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP/HTTPS requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Non-GET requests (POST, PUT, DELETE, PATCH): Always Network Only
  if (request.method !== 'GET') {
    return;
  }

  // API Requests & NextAuth (/api/*, auth endpoints):
  // Strictly Network Only for privacy, real-time security & authentication integrity
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/auth/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'offline',
            message: 'You are currently offline. Please check your internet connection.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Next.js Static Chunks (/_next/static/*):
  // Immutable hash-named assets -> Cache First with Network Fallback
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Static Assets (Icons, Images, Fonts, Favicon):
  // Stale-While-Revalidate
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/uploads/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // HTML / Navigation Requests:
  // Network First with Cache Fallback & Offline Fallback Page
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cached version exists, return the pre-cached offline page
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response('', { status: 408, statusText: 'Request Timed Out' });
    })
  );
});
