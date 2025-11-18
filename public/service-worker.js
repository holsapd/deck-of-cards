const STATIC_CACHE = "deckworkout-static-v4";
const RUNTIME_CACHE = "deckworkout-runtime-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/theme-standard-playing-card.png",
  "/theme-standard-jack.png",
  "/theme-standard-queen.png",
  "/theme-standard-king.png",
  "/theme-standard-joker.png",
  "/theme-standard-celebration.png",
  "/hell-yeah-brother.m4a",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Network-first for navigations to avoid serving stale index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(STATIC_CACHE)
            .then((cache) => cache.put("/index.html", copy))
            .catch(() => {});
          return response;
        })
        .catch(() =>
          caches
            .match("/index.html")
            .then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (PRECACHE_URLS.includes(url.pathname)) {
      event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
      );
      return;
    }

    const isAppAsset =
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "worker";
    const isMediaAsset =
      request.destination === "image" ||
      request.destination === "audio" ||
      request.destination === "font";

    if (isAppAsset || isMediaAsset) {
      event.respondWith(
        caches.open(RUNTIME_CACHE).then((cache) =>
          fetch(request)
            .then((response) => {
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cache.match(request))
        )
      );
      return;
    }
  }

  // Cache-first for other precached assets (e.g. manifest) from other origins
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }
});
