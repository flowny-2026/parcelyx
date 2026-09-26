// Service Worker v2.1.0 — cache desabilitado para garantir atualizações imediatas
const CACHE_NAME = 'parcelyx-v2.1.0';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Apaga TODOS os caches antigos
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Sem cache — sempre busca da rede
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;
  // Passa direto para a rede sem interceptar
});
