'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const common = useTranslations('common');
  const isBn = locale === 'bn';
  const { data: session, status } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [pendingTransfersCount, setPendingTransfersCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Fetch pending items count for the badges
  const fetchBadgeCounts = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setPendingTransfersCount(data.metrics?.pendingTransfers || 0);
        setPendingUsersCount(data.metrics?.pendingUsers || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchBadgeCounts();
    }
  }, [session]);

  // Global keyboard shortcut for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Protection check
  const userRole = (session?.user as any)?.role;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium tracking-wider uppercase">Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  if (!session || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto ring-1 ring-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {isBn ? 'প্রশাসনিক অনুমতি প্রয়োজন' : 'Restricted Admin Console'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? 'এই পোর্টালে প্রবেশের জন্য আপনার অ্যাকাউন্টের সুপার অ্যাডমিন অনুমোদন প্রয়োজন।'
                : 'Access to the administrative command portal requires an authorized administrator session.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link href="/login" className="flex-1">
              <Button className="w-full text-xs">{common('login')}</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full text-xs border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                {isBn ? 'হোমপেজ' : 'Public Home'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        pendingTransfersCount={pendingTransfersCount}
        pendingUsersCount={pendingUsersCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Admin Header */}
        <AdminHeader
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(!mobileOpen);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          pendingTransfersCount={pendingTransfersCount}
          pendingUsersCount={pendingUsersCount}
        />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        {/* Admin System Footer Strip */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Alumni Association Admin Console
            </span>
            <span>•</span>
            <span className="font-mono">v2.4.0 (Enterprise Build)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MongoDB Connected</span>
            </span>
            <span>•</span>
            <span>SSLCommerz Active</span>
          </div>
        </footer>
      </div>

      {/* ⌘K Command Palette Modal */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        pendingTransfersCount={pendingTransfersCount}
        pendingUsersCount={pendingUsersCount}
      />
    </div>
  );
}
