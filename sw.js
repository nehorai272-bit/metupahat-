// Service Worker בסיסי למטופחת - מאפשר התקנה ותמיכה אופליין חלקית
const CACHE_NAME = 'metupahat-cache-v1';
const URLS_TO_CACHE = [
  '/metupahat-/',
  '/metupahat-/index.html',
  '/metupahat-/manifest.json',
  '/metupahat-/icon-192.png',
  '/metupahat-/icon-512.png'
];

// התקנה - שומר את הדפים החשובים בזיכרון המטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// הפעלה - מנקה גרסאות ישנות של המטמון
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// טעינת דפים - קודם מנסה מהרשת, אם אין רשת נופל למטמון
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // עדכון המטמון בגרסה הטרייה
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // אין רשת - מחזיר מהמטמון אם קיים
        return caches.match(event.request);
      })
  );
});
