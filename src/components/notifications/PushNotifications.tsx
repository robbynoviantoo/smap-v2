'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/api/useAuth';
import { useTranslation } from '@/context/LanguageContext';
import { getPushClient, pushConfigured, pushConfigurationError, registerPushWorker, syncPushToken, wasPushEnabled, rememberPushEnabled, forgetPushEnabled } from '@/services/pushService';

type Status = 'checking' | 'available' | 'unsupported' | 'unconfigured' | 'misconfigured' | 'denied' | 'enabling' | 'enabled' | 'error';

export default function PushNotifications() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    let syncing = false;
    let unsubscribe: (() => void) | undefined;
    const refresh = async () => {
      if (!window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (active) setStatus('unsupported');
        return;
      }
      if (!pushConfigured) {
        if (active) setStatus(pushConfigurationError === 'invalid-vapid' ? 'misconfigured' : 'unconfigured');
        return;
      }
      if (Notification.permission !== 'granted') {
        forgetPushEnabled();
        if (active) setStatus(Notification.permission === 'denied' ? 'denied' : 'available');
        return;
      }
      if (wasPushEnabled(user.id) && active) setStatus('enabled');
      if (syncing || !active) return;
      syncing = true;
      try {
        if (await syncPushToken(() => active)) {
          rememberPushEnabled(user.id);
          setStatus('enabled');
        }
        if (!active || unsubscribe) return;
        const { sdk, messaging } = await getPushClient();
        if (!active) return;
        unsubscribe = sdk.onMessage(messaging, async (payload) => {
          void queryClient.invalidateQueries({ queryKey: ['notifications'] });
          try {
            const registration = await registerPushWorker();
            await registration.showNotification(payload.data?.title || payload.notification?.title || 'SMAP Pertamina', {
              body: payload.data?.body || payload.notification?.body || '',
              icon: '/logo-pwa.png',
              badge: '/logo-pwa.png',
              tag: payload.messageId || 'smap-notification',
              data: { url: payload.data?.url || '/' },
            });
          } catch {
            if (active) setStatus('error');
          }
        });
      } catch (error) {
        if (active) setStatus(error instanceof Error && error.message === 'unsupported' ? 'unsupported' : 'error');
      } finally {
        syncing = false;
      }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    void refresh();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onVisibility);
    return () => {
      active = false;
      unsubscribe?.();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onVisibility);
    };
  }, [user?.id, queryClient, attempt]);

  const enable = useCallback(async () => {
    setStatus('enabling');
    try {
      // Invoke directly in the click handler to preserve the browser's user gesture.
      const permission = await Notification.requestPermission();
      if (permission === 'granted') setAttempt((value) => value + 1);
      else setStatus(permission === 'denied' ? 'denied' : 'available');
    } catch {
      setStatus('error');
    }
  }, []);

  if (!user || status === 'checking' || status === 'enabled') return null;
  return (
    <section aria-label={t('push.title')} className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-gray-900 dark:text-white">{t('push.title')}</p>
        <p role="status" className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t(`push.${status}`)}</p>
      </div>
      {(status === 'available' || status === 'error' || status === 'enabling') && (
        <button type="button" disabled={status === 'enabling'} onClick={enable} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60">
          {t(status === 'error' ? 'push.retry' : 'push.enable')}
        </button>
      )}
    </section>
  );
}
