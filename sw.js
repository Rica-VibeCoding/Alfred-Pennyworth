const CACHE_VERSION = 'alfred-v1.2.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/speech.js',
  '/js/storage-v2.js',
  '/js/sidebar.js',
  '/config.js',
  '/manifest.json'
];

const MAX_RUNTIME_CACHE_SIZE = 50;
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('alfred-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // BYPASS Service Worker para N8N no iOS (bug conhecido do Safari)
  // Deixa o browser fazer fetch diretamente
  if (request.method === 'POST' && url.hostname.includes('n8n')) {
    // Não intercepta - deixa passar direto
    return;
  }

  // Network-first para outras APIs
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Cache-first with runtime cache for images and fonts
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirstWithRuntime(request));
    return;
  }

  // Network-first for everything else
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return offline fallback if available
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Silently handle CORS errors for N8N webhook (não logar no console)
    if (request.url.includes('n8n')) {
      // Retorna erro sem fazer ruído
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro de conexão. Verifique CORS no N8N.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline response for navigation requests
    if (request.mode === 'navigate') {
      const offlineCache = await cache.match('/index.html');
      return offlineCache || new Response('Offline', { status: 503 });
    }

    throw error;
  }
}

async function cacheFirstWithRuntime(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    const dateHeader = cached.headers.get('date');
    const cachedDate = dateHeader ? new Date(dateHeader).getTime() : 0;
    const now = Date.now();

    if (now - cachedDate < CACHE_MAX_AGE) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      // Limit runtime cache size
      const keys = await cache.keys();
      if (keys.length >= MAX_RUNTIME_CACHE_SIZE) {
        await cache.delete(keys[0]);
      }

      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

// Background sync for future offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Placeholder for future offline message sync
  console.log('Background sync triggered');
}

// Push notifications placeholder (not supported on iOS Safari yet)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Alfred', {
      body: data.body || 'Nova mensagem',
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png'
    })
  );
});
