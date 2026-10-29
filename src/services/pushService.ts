import apiClient from '@/lib/api-client';
import Cookies from 'js-cookie';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const tokenKey = 'smap_fcm_token';
let registrationPromise: Promise<ServiceWorkerRegistration> | undefined;

export const pushConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId && vapidKey);
export const storedPushToken = () => localStorage.getItem(tokenKey);

export function registerPushWorker() {
  if (!registrationPromise) {
    const params = new URLSearchParams();
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    registrationPromise = navigator.serviceWorker.register(`/sw.js?${params}`, { scope: '/' })
      .then(() => navigator.serviceWorker.ready)
      .catch((error) => {
        registrationPromise = undefined;
        throw error;
      });
  }
  return registrationPromise;
}

export async function getPushClient() {
  const sdk = await import('firebase/messaging');
  if (!await sdk.isSupported()) throw new Error('unsupported');
  const { getApps, initializeApp } = await import('firebase/app');
  const app = getApps().find((app) => app.name === 'smap-push') || initializeApp(firebaseConfig, 'smap-push');
  return { sdk, messaging: sdk.getMessaging(app) };
}

export async function syncPushToken(isActive: () => boolean) {
  const sessionToken = Cookies.get('token') || localStorage.getItem('token');
  const [{ sdk, messaging }, registration] = await Promise.all([getPushClient(), registerPushWorker()]);
  const token = await sdk.getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('empty-token');
  if (!isActive() || !sessionToken || sessionToken !== (Cookies.get('token') || localStorage.getItem('token'))) return false;
  // Retain before the request so logout can detach a registration even after a lost response.
  localStorage.setItem(tokenKey, token);
  await apiClient.post('/fcm/save-token', { token, device_type: 'web' });
  return isActive();
}

export async function clearPushSubscription() {
  localStorage.removeItem(tokenKey);
  const registration = await navigator.serviceWorker?.getRegistration('/');
  const notifications = await registration?.getNotifications();
  notifications?.forEach((notification) => notification.close());
  if (pushConfigured && 'serviceWorker' in navigator) {
    const { sdk, messaging } = await getPushClient();
    await sdk.deleteToken(messaging);
  }
}
