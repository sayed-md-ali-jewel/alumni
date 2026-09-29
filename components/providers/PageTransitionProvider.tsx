'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { KHSPageLoader } from '@/components/shared/KHSPageLoader';

interface PageLoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const PageLoadingContext = createContext<PageLoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const usePageLoading = () => useContext(PageLoadingContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [customMessage, setCustomMessage] = useState<string | undefined>(undefined);

  const activeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialMountRef = useRef(true);

  const startLoading = (msg?: string) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    setCustomMessage(msg);
    setIsExiting(false);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsExiting(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsExiting(false);
      setCustomMessage(undefined);
    }, 280);
  };

  // Route Change Listener: when pathname or searchParams change, dismiss loader smoothly
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }

    if (isLoading) {
      stopLoading();
    }
  }, [pathname, searchParams]);

  // Global click listener for internal links to trigger transition immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore if event was already prevented or not primary click
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as Element).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      if (!href) return;
      if (targetAttr === '_blank') return;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (href.startsWith('#')) return;

      // Check if it's an external link
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // Check if destination is identical to current path + query + hash
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        const targetUrl = url.pathname + url.search + url.hash;
        if (currentUrl === targetUrl) return;

        // Start loader for new internal destination
        startLoading();
      } catch {
        // Ignore invalid URLs
      }
    };

    const handlePopState = () => {
      startLoading();
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  return (
    <PageLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div
          className={`transition-opacity duration-300 ${
            isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
        >
          <KHSPageLoader message={customMessage} />
        </div>
      )}
    </PageLoadingContext.Provider>
  );
}
