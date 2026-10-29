self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    let url = self.location.origin + '/';
    try {
        const destination = new URL(event.notification.data?.url || '/', self.location.origin);
        if (destination.origin === self.location.origin) url = destination.href;
    } catch {
        // Malformed payload links fall back to the app home.
    }
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
        const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
        if (existing) {
            await existing.navigate(url);
            return existing.focus();
        }
        return self.clients.openWindow(url);
    }));
});

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
const firebaseConfig = Object.fromEntries(['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].map((key) => [key, params.get(key) || '']));

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
    firebase.initializeApp(firebaseConfig);
    firebase.messaging().onBackgroundMessage((payload) => {
        const count = Number(payload.data?.badge_count);
        if (Number.isFinite(count) && count >= 0 && 'setAppBadge' in self.navigator) {
            const result = count === 0 && 'clearAppBadge' in self.navigator
                ? self.navigator.clearAppBadge() : self.navigator.setAppBadge(count);
            Promise.resolve(result).catch(() => {});
        }
        return self.registration.showNotification(payload.data?.title || payload.notification?.title || 'SMAP Pertamina', {
            body: payload.data?.body || payload.notification?.body || '',
            icon: '/logo-pwa.png',
            badge: '/logo-pwa.png',
            tag: payload.messageId || 'smap-notification',
            data: { url: payload.data?.url || '/' },
        });
    });
}

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
