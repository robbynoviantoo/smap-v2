importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ============================================================
// Parse Firebase configuration dynamically from query parameters
// Prevents exposing sensitive credentials in git-tracked files
// ============================================================
const searchParams = new URLSearchParams(self.location.search);

const firebaseConfig = {
    apiKey: searchParams.get('apiKey') || '',
    authDomain: searchParams.get('authDomain') || '',
    projectId: searchParams.get('projectId') || '',
    storageBucket: searchParams.get('storageBucket') || '',
    messagingSenderId: searchParams.get('messagingSenderId') || '',
    appId: searchParams.get('appId') || '',
    measurementId: searchParams.get('measurementId') || ''
};

// ============================================================
// Helper to show a notification (single source of truth)
// ============================================================
function showSmapNotification(title, body, badge_count) {
    if ('setAppBadge' in self.navigator && badge_count > 0) {
        self.navigator.setAppBadge(badge_count);
    }

    return self.registration.showNotification(title, {
        body: body,
        icon: '/logo-pwa.png',
        badge: '/logo-pwa.png',
        vibrate: [200, 100, 200],
        tag: 'smap-approval',
        renotify: true,
        data: { url: self.location.origin + '/' },
    });
}

// Initialize Firebase only when credentials are provided
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[sw.js] Background message:', payload);
            const title = payload.data?.title || payload.notification?.title || 'SMAP';
            const body = payload.data?.body || payload.notification?.body || 'Ada pengajuan baru.';
            const badge_count = parseInt(payload.data?.badge_count || 0);

            return showSmapNotification(title, body, badge_count);
        });
    } catch (err) {
        console.warn('[sw.js] Firebase initialization error:', err);
    }
}

// ============================================================
// notificationclick — opens app on tap
// ============================================================
self.addEventListener('notificationclick', function (event) {
    console.log('[sw.js] Notification clicked');
    event.notification.close();

    const urlToOpen = event.notification.data?.url || self.location.origin + '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ============================================================
// Service Worker Lifecycle
// ============================================================
self.addEventListener('install', function (event) {
    console.log('[sw.js] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[sw.js] Activated.');
    event.waitUntil(self.clients.claim());
});