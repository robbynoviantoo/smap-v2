'use client';

import React, { useEffect } from 'react';
import apiClient from '@/lib/api-client';

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker for PWA & Background Push
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Construct dynamic query params from env variables to keep sw.js free of hardcoded secrets
        const params = new URLSearchParams();
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          params.set('apiKey', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
          params.set('authDomain', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          params.set('projectId', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
          params.set('storageBucket', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
          params.set('messagingSenderId', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
          params.set('appId', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
        }
        if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
          params.set('measurementId', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
        }

        const queryString = params.toString();
        const swUrl = queryString ? `/sw.js?${queryString}` : '/sw.js';

        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Request Notification Permission & Sync Token if granted
    if ('Notification' in window && Notification.permission === 'default') {
      // Gentle delayed request so it doesn't block initial page load
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('[PWA] Notification permission granted.');
          }
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return <>{children}</>;
}
