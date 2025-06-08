// src/sw.js

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

console.log('[Service Worker] Kustom SW Dijalankan!');

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

const navigationHandler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(navigationHandler);
registerRoute(navigationRoute);

// Cache untuk API StoryHub
registerRoute(
  ({url}) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'story-api-cache', // Nama cache yang akan dihapus
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache untuk API Nominatim
registerRoute(
  ({url}) => url.origin === 'https://nominatim.openstreetmap.org',
  new NetworkFirst({
    cacheName: 'nominatim-api-cache', // Nama cache yang akan dihapus
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache untuk Font Eksternal
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || url.hostname === 'cdnjs.cloudflare.com',
  new CacheFirst({
    cacheName: 'external-fonts-styles-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// *** BARU: Listener untuk pesan dari klien (aplikasi) ***
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_API_CACHES') {
    console.log('[Service Worker] Menerima permintaan untuk menghapus cache API.');
    const cachesToDelete = ['story-api-cache', 'nominatim-api-cache'];
    event.waitUntil(
      Promise.all(
          cachesToDelete.map(cacheName => caches.delete(cacheName))
      ).then(() => {
          console.log('[Service Worker] Cache API yang diminta telah dihapus.');
          if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ status: 'API Caches Cleared' });
          }
      }).catch(err => {
          console.error('[Service Worker] Gagal menghapus cache API:', err);
          if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ status: 'API Cache Clear Failed', error: err.message });
          }
      })
    );
  }
});

// Logika Push Notification
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Diterima.');
  const data = event.data.json();
  const title = data.title || 'StoryHub Notification';
  const options = {
    body: data.options ? data.options.body : 'Anda memiliki notifikasi baru.',
    icon: (data.options && data.options.icon) ? data.options.icon : '/icons/icon-192x192.png',
    badge: (data.options && data.options.badge) ? data.options.badge : '/icons/icon-96x96.png',
    data: data.options ? data.options.data : { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Logika Klik Notifikasi
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notifikasi Diklik.');
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (new URL(client.url).pathname === new URL(targetUrl, self.location.origin).pathname && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) { return self.clients.openWindow(targetUrl); }
    })
  );
});

// Lifecycle events
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));