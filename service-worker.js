const CACHE_NAME = 'vatsal-lol-cache-v4.1.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/icon-1024.png',
  '/assets/mobile-v3.css',
  '/assets/coffee.png',
  '/assets/email.png',
  '/assets/insta.jpg',
  '/assets/telegram.png',
  '/assets/youtube.png',
  '/assets/thumbnails/2048.webp',
  '/assets/thumbnails/8bit-lab.webp',
  '/assets/thumbnails/adjustme.webp',
  '/assets/thumbnails/bubbles.webp',
  '/assets/thumbnails/bugsmash.webp',
  '/assets/thumbnails/can-you-guess-indian-mom.webp',
  '/assets/thumbnails/checklist.webp',
  '/assets/thumbnails/draw-a-circle.webp',
  '/assets/thumbnails/emojis-2-movies.webp',
  '/assets/thumbnails/everything-is-progressing.webp',
  '/assets/thumbnails/flash-memory.webp',
  '/assets/thumbnails/focus.webp',
  '/assets/thumbnails/future-timeline.webp',
  '/assets/thumbnails/guess-the-lie.webp',
  '/assets/thumbnails/hardword.webp',
  '/assets/thumbnails/jokes-if-you-handle.webp',
  '/assets/thumbnails/lets-settle.webp',
  '/assets/thumbnails/luckorpredict.webp',
  '/assets/thumbnails/not_scary.webp',
  '/assets/thumbnails/mastermind.webp',
  '/assets/thumbnails/memory-tiles.webp',
  '/assets/thumbnails/onelightday.webp',
  '/assets/thumbnails/paddleclub.webp',
  '/assets/thumbnails/snake.webp',
  '/assets/thumbnails/soundbar.webp',
  '/assets/thumbnails/spend-bill-gates-money.webp',
  '/assets/thumbnails/spot.webp',
  '/assets/thumbnails/standing.webp',
  '/assets/thumbnails/sudoku.webp',
  '/assets/thumbnails/tower-of-hanoi.webp',
  '/assets/thumbnails/under-limit.webp',
  '/assets/thumbnails/which-number.webp',
  '/assets/thumbnails/wordle.webp',
  '/assets/thumbnails/would-you-press-the-button.webp',
  '/assets/thumbnails/xo.webp',
  '/assets/thumbnails/your-life-in-numbers.webp',
  '/assets/data/flashhero.png',
  '/assets/data/flashrunning.png',
  '/assets/data/flashlighting.png',
  '/assets/data/flashsound.mp3',
  '/assets/data/FFCommaTrial-Regular.woff2',
  '/assets/data/vatsal-logo-font.woff2',
  '/assets/data/pinkend.woff2',
  '/assets/data/vns.woff2',
  '/games/not_scary/horror_text.woff2',
  '/games/not_scary/horror_title.woff2',
  '/games/not_scary/rain.mp3',
  '/games/not_scary/thunder.mp3'
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

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Check if this is an HTML navigation request
  const isNavigation = event.request.mode === 'navigate' || 
                       url.pathname.endsWith('.html') || 
                       url.pathname.endsWith('/');

  // Only cache requests to our own origin OR specific external CDNs
  const isSelf = url.origin === self.location.origin;
  const isExternalResource = url.hostname.includes('fonts.googleapis.com') ||
                             url.hostname.includes('fonts.gstatic.com') ||
                             url.hostname.includes('cdn.tailwindcss.com') ||
                             url.hostname.includes('unpkg.com') ||
                             url.hostname.includes('wikimedia.org');

  if (isSelf || isExternalResource) {
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
          .catch(() => {
            // Network failed, try to serve navigation from cache, fallback to offline.html
            return caches.match(event.request)
              .then(cachedResponse => {
                return cachedResponse || caches.match('/offline.html');
              });
          })
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

// Listen for message to skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
