'use client';

import React from 'react';
import { useLocale } from 'next-intl';

interface KHSPageLoaderProps {
  fullscreen?: boolean;
  message?: string;
  subMessage?: string;
  className?: string;
}

export function KHSPageLoader({
  fullscreen = true,
  message,
  subMessage,
  className = '',
}: KHSPageLoaderProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const defaultMessage = message || (isBn ? 'লোড হচ্ছে...' : 'Loading...');
  const defaultSub = subMessage || (isBn ? 'কেএইচএস অ্যালামনাই নেটওয়ার্ক' : 'KHS Alumni Network');

  const content = (
    <div className="relative flex flex-col items-center justify-center p-8 select-none">
      {/* Ambient background glow aura */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-primary/20 blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Main KHS Emblem Container with dual orbit rings */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center mb-6">
        {/* Outer subtle spinning gold/amber orbit ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 dark:border-amber-400/30 animate-[spin_12s_linear_infinite]"
          style={{ willChange: 'transform' }}
        />

        {/* Middle reverse-spinning multi-gradient ring with glow */}
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary border-r-rose-500 border-b-amber-500/80 border-l-transparent animate-[spin_3s_linear_infinite_reverse]"
          style={{ willChange: 'transform' }}
        />

        {/* Inner static luxury glass badge */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-white/95 via-slate-50/90 to-slate-100/90 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/90 shadow-2xl shadow-primary/20 dark:shadow-black/50 border border-amber-200/50 dark:border-slate-700/60 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden group">
          {/* Subtle academic graduation-cap / laurel watermark silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 dark:opacity-10 pointer-events-none">
            <svg
              className="w-16 h-16 text-amber-600 dark:text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Graduation Cap Silhouette */}
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          {/* Golden top highlight edge */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

          {/* KHS Monogram Branding */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="font-black text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-primary to-amber-600 dark:from-white dark:via-rose-400 dark:to-amber-400 leading-none drop-shadow-sm font-sans">
              KHS
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-rose-500" />
              <span className="w-1 h-1 rounded-full bg-primary" />
            </div>
          </div>

          {/* Bottom subtle shine bar */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>

      {/* Typography: Status Message & Academic Subtitle */}
      <div className="text-center space-y-1.5 z-10">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            {defaultMessage}
          </span>
          {/* Animated 3 Loading Dots */}
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
          </span>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
          {defaultSub}
        </p>
      </div>

      {/* Bottom glowing indeterminate progress bar */}
      <div className="w-48 sm:w-56 h-1 bg-slate-200/80 dark:bg-slate-800 rounded-full mt-5 overflow-hidden shadow-inner relative">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-primary via-rose-500 to-amber-400 rounded-full animate-[khs-progress_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (!fullscreen) {
    return <div className={`flex items-center justify-center ${className}`}>{content}</div>;
  }

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Top screen-edge high-precision laser progress line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-200/40 dark:bg-slate-800/40 overflow-hidden z-[10000]">
        <div className="h-full w-full bg-gradient-to-r from-blue-600 via-rose-500 to-amber-400 animate-[khs-progress_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite] shadow-sm shadow-amber-500/50" />
      </div>

      {content}

      {/* Bottom subtle academic footer note */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-400 dark:text-slate-500 tracking-widest font-medium uppercase">
        {isBn ? 'ঐতিহ্যের বন্ধনে প্রাক্তনদের সংযোগ' : 'Connecting Legacy, Empowering the Future'}
      </div>
    </div>
  );
}
