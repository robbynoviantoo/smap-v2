importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCEJYmA5E_zcjcwHGupFmqKPQPqG4Xzgc0",
    authDomain: "smap-pertamina.firebaseapp.com",
    projectId: "smap-pertamina",
    storageBucket: "smap-pertamina.firebasestorage.app",
    messagingSenderId: "1045919862891",
    appId: "1:1045919862891:web:a8ab55b45b52916d36612e",
    measurementId: "G-MVCLGGDH5B"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

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
        tag: 'smap-approval', // Replaces previous notification — no duplicates
        renotify: true,       // Still rings/vibrates even if replacing same tag
        data: { url: self.location.origin + '/' },
    });
}

// ============================================================
// Firebase onBackgroundMessage
// This is the PRIMARY handler. Firebase SDK intercepts the
// raw push event first, so we handle it here.
// ============================================================
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Background message:', payload);

    // Title and body now come from payload.data (not payload.notification)
    // because we intentionally removed the top-level 'notification' key
    // from the FCM payload to prevent Chrome's auto-display on Android.
    const title = payload.data?.title || payload.notification?.title || 'SMAP';
    const body = payload.data?.body || payload.notification?.body || 'Ada pengajuan baru.';
    const badge_count = parseInt(payload.data?.badge_count || 0);

    return showSmapNotification(title, body, badge_count);
});

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