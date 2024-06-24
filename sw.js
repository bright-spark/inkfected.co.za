// Import Workbox library from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precaching assets
workbox.precaching.precacheAndRoute([
    { url: '/favicon.ico', revision: '12347' },
    { url: '/artifakt.html', revision: '12347' },
]);

// Caching strategies
// Cache First for static assets like CSS, JavaScript
workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' || request.destination === 'script',
    new workbox.strategies.CacheFirst({
        cacheName: 'static-resources',
    })
);

// Network First for dynamic or API calls
workbox.routing.registerRoute(
    ({url}) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
            }),
        ],
    })
);

// Offline Fallback
const FALLBACK_HTML_URL = '/offline.html';
workbox.routing.setCatchHandler(({event}) => {
    switch (event.request.destination) {
        case 'document':
            return caches.match(FALLBACK_HTML_URL);
            break;

        default:
            return Response.error();
    }
});

// Update and Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'static-resources' && cacheName !== 'api-cache') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
