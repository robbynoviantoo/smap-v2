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

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    // Update badge
    if (payload.data?.badge_count !== undefined && 'setAppBadge' in self.navigator) {
        self.navigator.setAppBadge(parseInt(payload.data.badge_count));
    }

    // IMPORTANT: Server sends data-only payloads (no 'notification' key) to prevent
    // Chrome auto-display on Android. So we MUST read from payload.data here.
    const title = payload.data?.title || payload.notification?.title || 'SMAP Notifikasi';
    const body = payload.data?.body || payload.notification?.body || 'Ada pengajuan baru yang butuh approval.';

    return self.registration.showNotification(title, {
        body: body,
        icon: '/logo-pwa.png',
        badge: '/logo-pwa.png',
        tag: 'smap-approval',   // Replaces previous — no stacking
        renotify: true,
        data: { url: self.location.origin }
    });
});

// Open app when notification is tapped
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || self.location.origin;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            for (const c of list) {
                if (c.url.startsWith(url) && 'focus' in c) return c.focus();
            }
            return clients.openWindow(url);
        })
    );
});
