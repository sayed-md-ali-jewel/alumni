'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for service worker updates periodically (e.g. every hour)
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Handle service worker update cycle
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New update available, activate it
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      } catch (err) {
        // Silently catch registration errors in dev / unsupported environments
        console.debug('[PWA] Service worker registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return null;
}
