// Lightweight service worker dedicated for notifications handling

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Display push notifications
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try { data = { body: event.data?.text() }; } catch (_) {}
  }
  const title = data.title || 'Notifikasi';
  const options = {
    body: data.body || '',
    icon: data.icon || '/android/android-launchericon-192-192.png',
    badge: data.badge || '/android/android-launchericon-192-192.png',
    tag: data.tag || undefined,
    renotify: data.renotify === true,
    requireInteraction: data.requireInteraction === true,
    timestamp: data.timestamp ? Number(data.timestamp) : Date.now(),
    vibrate: Array.isArray(data.vibrate) ? data.vibrate : undefined,
    silent: data.silent === true ? true : false,
    data: { url: data.url || '/', ...data },
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    // Increment app badge on each push (best-effort; Chromium only)
    try {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'INCREMENT_BADGE', delta: 1 });
      }
    } catch (_) {}
  })());
});

// Focus or open app on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const match = allClients.find((c) => c.url && c.url.includes(url));
    if (match) { await match.focus(); return; }
    await self.clients.openWindow(url);
  })());
});
