// 公路车胎压计算器 — Service Worker
const CACHE_NAME = 'vook-tire-v3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-512.png',
    './tailwind.css',
    'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js'
];

// Install: cache all assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// network-first: 先请求网络拿最新版，失败回退缓存
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(response => {
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(e.request).then(cached => {
                    if (cached) return cached;
                    if (e.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return undefined;
                });
            })
    );
});
