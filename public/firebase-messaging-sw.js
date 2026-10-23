importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Parse Firebase configuration dynamically from query parameters
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

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Background message:', payload);

            // Update badge
            if (payload.data?.badge_count !== undefined && 'setAppBadge' in self.navigator) {
                self.navigator.setAppBadge(parseInt(payload.data.badge_count));
            }

            const title = payload.data?.title || payload.notification?.title || 'SMAP Notifikasi';
            const body = payload.data?.body || payload.notification?.body || 'Ada pengajuan baru yang butuh approval.';

            return self.registration.showNotification(title, {
                body: body,
                icon: '/logo-pwa.png',
                badge: '/logo-pwa.png',
                tag: 'smap-approval',
                renotify: true,
                data: { url: self.location.origin }
            });
        });
    } catch (err) {
        console.warn('[firebase-messaging-sw.js] Firebase initialization error:', err);
    }
}

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
