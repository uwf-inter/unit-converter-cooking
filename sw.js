const CACHE_NAME = 'cooking-unit-converter-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './butter.html',
    './no-scale-measuring.html',
    './substitute-overseas-cup.html',
    './global-matrix.html',
    './microwave-calc.html',
    './visual-guide.html',
    './baking-calc.html',
    './fitness-calc.html',
    './otama.html',
    './pasta-calc.html',
    './rice-calc.html',
    './standard-weights.html',
    './substitute-measuring.html',
    './tube-spices.html',
    './1-stick-butter.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Error handling implemented so valid items are cached even if some fail
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`Cache failed for ${url}:`, err)))
            );
        }).then(() => self.skipWaiting())
    );
});

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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Basic network-first strategy for HTML pages, cache-first for assets like CSS/JS
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if(response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
