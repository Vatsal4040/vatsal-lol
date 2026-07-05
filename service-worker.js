const CACHE_NAME = 'vatsal-lol-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/mobile-v3.css',
  '/assets/vatsal-footer-v25.css',
  '/assets/vatsal-footer-v25.js',
  '/assets/vatsal-header-v25.css',
  '/assets/coffee.png',
  '/assets/email.png',
  '/assets/insta.jpg',
  '/assets/telegram.png',
  '/assets/youtube.png',
  '/assets/data/flashhero.png',
  '/assets/data/flashrunning.png',
  '/assets/data/flashlighting.png',
  '/assets/data/FFCommaTrial-Regular.ttf',
  '/assets/data/vatsal-logo-font.ttf'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only cache requests to our own origin OR specific external CDNs
  const isSelf = url.origin === self.location.origin;
  const isExternalResource = url.hostname.includes('fonts.googleapis.com') ||
                             url.hostname.includes('fonts.gstatic.com') ||
                             url.hostname.includes('cdn.tailwindcss.com') ||
                             url.hostname.includes('unpkg.com') ||
                             url.hostname.includes('wikimedia.org');

  if (event.request.method !== 'GET') {
    return;
  }

  if (isSelf || isExternalResource) {
    const isNavigation = event.request.mode === 'navigate' || 
                         url.pathname.endsWith('.html') || 
                         url.pathname.endsWith('/');

    if (isNavigation && isSelf) {
      // Network-First Strategy for local HTML/Navigation
      event.respondWith(
        fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    } else {
      // Cache-First Strategy for static assets (local & trusted CDNs)
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return fetch(event.request).then(response => {
              // Cache valid responses (both basic and opaque cors responses)
              const isStatusValid = response.status === 200 || response.status === 0;
              if (isStatusValid) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                });
              }
              return response;
            });
          })
      );
    }
  }
});
