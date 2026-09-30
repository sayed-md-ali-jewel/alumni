'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function PresenceHeartbeat() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id?.toString();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      // If user was logged in previously and now logged out, notify offline
      if (prevUserIdRef.current) {
        try {
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(
              '/api/presence/offline',
              JSON.stringify({ userId: prevUserIdRef.current })
            );
          } else {
            fetch('/api/presence/offline', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: prevUserIdRef.current }),
              keepalive: true,
            }).catch(() => {});
          }
        } catch {
          // ignore
        }
        prevUserIdRef.current = null;
      }
      return;
    }

    prevUserIdRef.current = userId;

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        // Silently fail network drop
      }
    };

    // Initial heartbeat on login / mount
    sendHeartbeat();

    // Periodic heartbeat every 25 seconds (well within 60s timeout)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 25000);

    // Heartbeat on tab refocus / visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    // Notify offline on tab unload
    const handleBeforeUnload = () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(
            '/api/presence/offline',
            JSON.stringify({ userId })
          );
        } else {
          fetch('/api/presence/offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [status, userId]);

  return null;
}
