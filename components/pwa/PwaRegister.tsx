'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local');

    const isDev = process.env.NODE_ENV !== 'production' || isLocalhost;

    // In development or localhost, aggressively unregister service workers & clear caches to prevent stale chunks
    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });

      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          for (const cacheName of cacheNames) {
            caches.delete(cacheName);
          }
        });
      }
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

