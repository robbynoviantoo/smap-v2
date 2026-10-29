'use client';

import React, { useEffect } from 'react';
import { registerPushWorker } from '@/services/pushService';

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.isSecureContext && 'serviceWorker' in navigator) {
      void registerPushWorker().catch(() => {
        // The permission control retries registration and reports failures to the user.
      });
    }
  }, []);
  return <>{children}</>;
}
