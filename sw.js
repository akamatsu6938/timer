const CACHE_NAME = 'gym-timer-v2';
const CACHE_FILES = [
  '/timer/',
  '/timer/index.html',
  '/timer/manifest.json',
  '/timer/icon-192.png',
  '/timer/icon-512.png',
];

let notificationTimer = null;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(CACHE_FILES.filter(f => !f.includes('icon')))
    ).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = e.data.finishAt - Date.now();
    clearTimeout(notificationTimer);
    if (delay > 0) {
      notificationTimer = setTimeout(() => {
        self.registration.showNotification('💪 インターバル終了！', {
          body: '次のセットを始めましょう',
          icon: '/timer/icon-192.png',
          badge: '/timer/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'timer-done',
          renotify: true,
        });
      }, delay);
    }
  }

  if (e.data && e.data.type === 'CANCEL_NOTIFICATION') {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
});
