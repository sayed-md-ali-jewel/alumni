'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Bell, Droplet, HeartHandshake, CheckCheck, X } from 'lucide-react';
import { useLocale } from 'next-intl';

export function NotificationBell() {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
        aria-label="Notifications"
        title={isBn ? 'বিজ্ঞপ্তি' : 'Notifications'}
      >
        <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform duration-200 group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm shadow-rose-600/30 border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'বিজ্ঞপ্তি ও অনুরোধ' : 'Notifications'}
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                  {unreadCount} {isBn ? 'নতুন' : 'New'}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isBn ? 'পঠিত চিহ্নিত করুন' : 'Mark read'}</span>
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>{isBn ? 'কোনো নতুন বিজ্ঞপ্তি নেই' : 'No notifications right now'}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  href={n.link || '/profile'}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    !n.read ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'blood_request' || n.type === 'blood_donation' || n.type === 'blood_eligibility'
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {n.type === 'blood_request' || n.type === 'blood_donation' ? (
                        <Droplet className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <HeartHandshake className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
