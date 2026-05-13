// Maintly service worker — PWA optimized
// Strategy: network-first navigations with offline fallback
// Static assets: cache-first for performance

const CACHE_VERSION = "maintly-v2";
const OFFLINE_URL = "/offline";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Pre-cache offline page and static assets
      await cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip API and Next.js data fetches
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Navigation requests (page loads) — network first, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache successful navigations for offline use
          if (res.ok) {
            const clone = res.clone();
            caches
              .open(CACHE_VERSION)
              .then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(async () => {
          // Try cache, then offline page
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response("Sin conexión", { status: 503 });
        }),
    );
    return;
  }

  // Static assets (Next.js chunks, images, fonts) — cache first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches
                .open(CACHE_VERSION)
                .then((cache) => cache.put(request, clone));
            }
            return res;
          }),
      ),
    );
  }
});
