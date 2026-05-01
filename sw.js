// ============================================================
// CORAZÓNCÓDIGO — SERVICE WORKER (sw.js)
// Estrategia de caching: Network-First para dinámico, Cache-First para estático
// ============================================================

const CACHE_NAME = 'cc-v3.0.1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css?v=3',
    '/manifest.json',
    '/favicon.svg'
];

// ─────────────────────────────────────────────────────
// 1. INSTALL: Cachear assets estáticos
// ─────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS).catch(err => {
                    console.log('[SW] Cache.addAll error:', err);
                    // Continuar incluso si falla alguno
                });
            })
            .then(() => self.skipWaiting())
    );
});

// ─────────────────────────────────────────────────────
// 2. ACTIVATE: Limpiar cachés viejas
// ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ─────────────────────────────────────────────────────
// 3. FETCH: Network-First para dinámico, Cache-First para estático
// ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests no-HTTPS (para desarrollo local)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // ─────────────────────────────────────────────────────
    // A. NETWORK-FIRST para APIs (Supabase, PayPhone, etc)
    // ─────────────────────────────────────────────────────
    if (url.hostname.includes('supabase') || 
        url.hostname.includes('ppls.me') ||
        url.hostname.includes('wa.me')) {
        return event.respondWith(
            fetch(request)
                .then(response => {
                    // Cachear respuestas exitosas (Solo métodos GET)
                    if (response.ok && request.method === 'GET') {
                        const responseClone = response.clone();
                        const cache = caches.open(CACHE_NAME);
                        cache.then(c => c.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback a cache si network falla
                    return caches.match(request) || 
                        new Response(JSON.stringify({ error: 'Offline' }), {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                })
        );
    }

    // ─────────────────────────────────────────────────────
    // B. CACHE-FIRST para assets estáticos (CSS, JS, imágenes)
    // ─────────────────────────────────────────────────────
    if (request.method === 'GET' && 
        (request.url.endsWith('.css') || 
         request.url.endsWith('.js') || 
         request.url.endsWith('.svg') ||
         request.url.endsWith('.png') ||
         request.url.endsWith('.jpg') ||
         request.url.endsWith('.woff2'))) {
        
        return event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(request)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Fetch failed');
                            }
                            
                            // Cachear
                            const responseClone = response.clone();
                            const cache = caches.open(CACHE_NAME);
                            cache.then(c => c.put(request, responseClone));
                            
                            return response;
                        })
                        .catch(() => {
                            // Offline page
                            if (request.destination === 'document') {
                                return new Response(
                                    '<h1>Offline</h1><p>No hay conexión. Intenta de nuevo cuando tengas internet.</p>',
                                    { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                                );
                            }
                            return new Response('Not found', { status: 404 });
                        });
                })
        );
    }

    // ─────────────────────────────────────────────────────
    // C. DEFAULT: Network-First para todo lo demás
    // ─────────────────────────────────────────────────────
    return event.respondWith(
        fetch(request)
            .then(response => {
                // Solo cachear peticiones GET
                if (response.ok && request.method === 'GET') {
                    const responseClone = response.clone();
                    const cache = caches.open(CACHE_NAME);
                    cache.then(c => c.put(request, responseClone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
