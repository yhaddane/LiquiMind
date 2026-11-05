/**
 * LiquiMind Workbox Service Worker
 * Version: 3.6.0
 * Strategy: Workbox caching for critical assets & API responses with full offline support
 */

// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const CACHE_PREFIX = 'liquimind';
const VERSION = 'v3.6.0';
const CRITICAL_CACHE_NAME = `${CACHE_PREFIX}-critical-${VERSION}`;
const ASSETS_CACHE_NAME = `${CACHE_PREFIX}-assets-${VERSION}`;
const API_CACHE_NAME = `${CACHE_PREFIX}-api-${VERSION}`;
const IMAGES_CACHE_NAME = `${CACHE_PREFIX}-images-${VERSION}`;
const FONTS_CACHE_NAME = `${CACHE_PREFIX}-fonts-${VERSION}`;

// Precache list of critical entry points
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Verify if Workbox loaded successfully
if (typeof workbox !== 'undefined') {
  // Disable verbose debug logs in production
  workbox.setConfig({ debug: false });

  // Core lifecycle: immediately claim clients and skip waiting
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. CRITICAL ASSETS / NAVIGATION REQUESTS
  // Strategy: NetworkFirst with 3s timeout, falling back to cached /index.html
  // Ensures the dashboard and all SPA routes load instantly offline
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: CRITICAL_CACHE_NAME,
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 2. CRITICAL BUNDLED ASSETS (JavaScript, CSS, Vite chunks)
  // Strategy: StaleWhileRevalidate so updates happen in background while UI loads immediately
  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.startsWith('/src/'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: ASSETS_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 120,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 3. API RESPONSES (Financial Markets, Binance Crypto, FX Currency Rates, Local APIs)
  // Strategy: NetworkFirst with 3.5s timeout.
  // When offline, immediately returns the cached market quotes and balances so transactions & dashboards never break!
  workbox.routing.registerRoute(
    ({ url }) =>
      url.hostname === 'api.binance.com' ||
      url.hostname === 'open.er-api.com' ||
      url.pathname.startsWith('/api/') ||
      url.hostname.includes('firestore.googleapis.com'),
    new workbox.strategies.NetworkFirst({
      cacheName: API_CACHE_NAME,
      networkTimeoutSeconds: 3.5,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days of offline tolerance
        }),
      ],
    })
  );

  // 4. WEB FONTS (Google Fonts, Cairo, Nunito, gstatic)
  // Strategy: CacheFirst - fonts rarely change, max performance offline
  workbox.routing.registerRoute(
    ({ url }) =>
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: FONTS_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 5. IMAGES & ICONS
  // Strategy: CacheFirst with 30 days expiration
  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname),
    new workbox.strategies.CacheFirst({
      cacheName: IMAGES_CACHE_NAME,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 80,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 6. GLOBAL OFFLINE CATCH HANDLER
  // When network request fails and not in route cache, serve index.html for navigation
  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === 'document' || event.request.mode === 'navigate') {
      const cache = await caches.open(CRITICAL_CACHE_NAME);
      return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error();
    }
    return Response.error();
  });
} else {
  console.warn('Workbox could not be loaded from CDN. Initializing native fallback cache.');
}

// Service Worker Install & Precache Phase
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CRITICAL_CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker Activation & Cache Cleanup Phase
self.addEventListener('activate', (event) => {
  const currentCaches = [
    CRITICAL_CACHE_NAME,
    ASSETS_CACHE_NAME,
    API_CACHE_NAME,
    IMAGES_CACHE_NAME,
    FONTS_CACHE_NAME,
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith(CACHE_PREFIX) && !currentCaches.includes(name)) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Native Fetch Fallback (active if Workbox is not globally initialized)
self.addEventListener('fetch', (event) => {
  if (typeof workbox !== 'undefined') return; // Handled by Workbox routes

  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Navigation requests fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CRITICAL_CACHE_NAME);
        return (await cache.match('/index.html')) || (await cache.match('/'));
      })
    );
    return;
  }

  // API calls fallback: NetworkFirst
  if (url.hostname === 'api.binance.com' || url.hostname === 'open.er-api.com') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(API_CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(API_CACHE_NAME);
          const cached = await cache.match(event.request);
          if (cached) return cached;
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Assets: CacheFirst / StaleWhileRevalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((netRes) => {
          if (netRes && netRes.status === 200) {
            caches.open(ASSETS_CACHE_NAME).then((c) => c.put(event.request, netRes.clone()));
          }
          return netRes;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
