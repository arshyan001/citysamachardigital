// City Samachar Digital - Push Notification Service Worker
// File: public/sw.js

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification event received');

  let data = {
    title: 'सिटी समाचार डिजिटल',
    body: 'नई खबर आई है!',
    url: '/',
    icon: '/logo.png',
    badge: '/logo.png',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const iconUrl = new URL(data.icon || '/logo.png', self.location.origin).href;
  const badgeUrl = new URL(data.badge || '/logo.png', self.location.origin).href;

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    requireInteraction: false,
    tag: data.tag || 'city-samachar-news',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'close') return;

  const rawUrl = event.notification.data?.url || '/';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open with our site, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
