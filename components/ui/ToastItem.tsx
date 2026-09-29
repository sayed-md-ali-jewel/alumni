'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { parseErrorMessages } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItemData {
  id: string;
  type?: ToastType;
  title?: string;
  text?: string;
  messages?: string[] | string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const duration = toast.duration || (toast.type === 'error' || toast.type === 'warning' ? 5000 : 3500);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const type = toast.type || 'info';

  // Parse any multiple messages or Zod error outputs
  const parsedMessages: string[] = React.useMemo(() => {
    if (toast.messages) {
      return parseErrorMessages(toast.messages);
    }
    if (toast.text) {
      const parsed = parseErrorMessages(toast.text);
      if (parsed.length > 1) return parsed;
      // If single message but starts with JSON formatting
      if (parsed.length === 1 && parsed[0] !== toast.text) return parsed;
    }
    return [];
  }, [toast.messages, toast.text]);

  const displaySingleText = parsedMessages.length === 0 ? toast.text : (parsedMessages.length === 1 ? parsedMessages[0] : null);
  const displayList = parsedMessages.length > 1 ? parsedMessages : [];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 250);
  };

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);

    const stepMs = 50;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const percentage = (currentRemaining / duration) * 100;
      setProgress(percentage);
    }, stepMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, duration]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Color & Icon Configuration
  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          border: 'border-rose-300 dark:border-rose-700/60 shadow-rose-500/15',
          topLine: 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500',
          progressBar: 'bg-gradient-to-r from-rose-500 to-red-600',
          iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-4 ring-rose-500/10',
          titleColor: 'text-rose-900 dark:text-rose-100',
          bulletBg: 'bg-rose-500',
          defaultTitle: 'ত্রুটি পরিলক্ষিত হয়েছে' ,
          icon: <XCircle className="w-5 h-5" />,
        };
      case 'success':
        return {
          border: 'border-emerald-300 dark:border-emerald-700/60 shadow-emerald-500/15',
          topLine: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500',
          progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/10',
          titleColor: 'text-emerald-900 dark:text-emerald-100',
          bulletBg: 'bg-emerald-500',
          defaultTitle: 'সফল হয়েছে',
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      case 'warning':
        return {
          border: 'border-amber-300 dark:border-amber-700/60 shadow-amber-500/15',
          topLine: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
          progressBar: 'bg-gradient-to-r from-amber-500 to-orange-600',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-4 ring-amber-500/10',
          titleColor: 'text-amber-900 dark:text-amber-100',
          bulletBg: 'bg-amber-500',
          defaultTitle: 'সতর্কতা',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'info':
      default:
        return {
          border: 'border-blue-300 dark:border-blue-700/60 shadow-blue-500/15',
          topLine: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500',
          progressBar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-500/15 text-primary ring-4 ring-blue-500/10',
          titleColor: 'text-slate-900 dark:text-slate-100',
          bulletBg: 'bg-primary',
          defaultTitle: 'তথ্য',
          icon: <Info className="w-5 h-5" />,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border ${config.border} p-4 sm:p-4.5 transition-all duration-300 ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.topLine}`} />

      <div className="flex items-start gap-3.5 pt-0.5">
        {/* Animated Icon Badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg} transition-transform duration-300 hover:scale-105`}>
          {config.icon}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-2 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-bold tracking-tight ${config.titleColor}`}>
              {toast.title || config.defaultTitle}
            </h4>
          </div>

          {/* Single Text Display */}
          {displaySingleText && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {displaySingleText}
            </p>
          )}

          {/* Multiple Validation Bullet Points */}
          {displayList.length > 0 && (
            <div className="pt-1">
              <ul className="space-y-1.5">
                {displayList.map((msg, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-200 font-medium flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.bulletBg} mt-1.5 flex-shrink-0`} />
                    <span className="leading-snug">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Custom Action Button if present */}
          {toast.action && (
            <div className="pt-2">
              <button
                onClick={() => {
                  toast.action?.onClick();
                  handleClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>{toast.action.label}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Close Button */}
        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Animated Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${config.progressBar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
