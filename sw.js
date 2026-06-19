const CACHE_NAME = 'parcelyx-v1.2.0';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './admin.css',
  './app.js',
  './admin.js',
  './supabase-config.js',
  './supabase-auth.js',
  './manifest.json',
  './img/32x32px.png',
  './img/100x67px.png',
  './img/140x93px.png',
  './img/180x120px.png',
  './img/1536x1024px.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './public/favicon.svg'
];

// Install - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
