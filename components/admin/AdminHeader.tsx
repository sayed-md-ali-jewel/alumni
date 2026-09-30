'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Command,
  ChevronDown,
  ShieldCheck,
  Users,
  Calendar,
  Newspaper,
  HeartHandshake,
  ExternalLink,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  pendingTransfersCount?: number;
  pendingUsersCount?: number;
}

export function AdminHeader({
  onToggleSidebar,
  onOpenCommandPalette,
  pendingTransfersCount = 0,
  pendingUsersCount = 0,
}: AdminHeaderProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isBn = locale === 'bn';

  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const totalAlerts = pendingTransfersCount + pendingUsersCount;
  const user = session?.user as any;

  // Get Breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    if (pathname.includes('/dashboard/admin/alumni')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'অ্যালামনাই ভেরিফিকেশন' : 'Alumni Directory & Verification', href: '/dashboard/admin/alumni' },
      ];
    }
    if (pathname.includes('/dashboard/admin/blood-donors')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'রক্তদাতা ব্যবস্থাপনা' : 'Blood Donors Moderation', href: '/dashboard/admin/blood-donors' },
      ];
    }
    if (pathname.includes('/dashboard/admin/blood-requests')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'রক্তের আবেদন পরিচালনা' : 'Blood Requests Management', href: '/dashboard/admin/blood-requests' },
      ];
    }
    if (pathname.includes('/dashboard/admin/events')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'ইভেন্ট ও রিইউনিয়ন' : 'Events & Reunions Management', href: '/dashboard/admin/events' },
      ];
    }
    if (pathname.includes('/dashboard/admin/news')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'সংবাদ ও বুলেটিন' : 'News & Announcements CMS', href: '/dashboard/admin/news' },
      ];
    }
    if (pathname.includes('/dashboard/admin/donations')) {
      return [
        { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
        { label: isBn ? 'অনুদান ও ব্যাংক ট্রান্সফার' : 'Donations Ledger & Bank Approvals', href: '/dashboard/admin/donations' },
      ];
    }
    return [
      { label: isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal', href: '/dashboard/admin' },
      { label: isBn ? 'কমান্ড সেন্টার ওভারভিউ' : 'Command Center Overview', href: '/dashboard/admin' },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200 flex items-center justify-between px-2.5 xs:px-4 sm:px-6 lg:px-8">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 xs:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 xs:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb trail */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href + idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <Link
                href={crumb.href}
                className={`font-medium transition-colors truncate ${
                  idx === breadcrumbs.length - 1
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Quick Search Trigger Button */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
            <span>
              {isBn
                ? 'অনুসন্ধান করুন (অ্যালামনাই, ইভেন্ট, অনুদান)...'
                : 'Search alumni, events, transactions...'}
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Status Pill, Quick Actions, Notifications, Theme, Locale, User Profile */}
      <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 shrink-0">
        {/* Live Health Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isBn ? 'সিস্টেম সক্রিয়' : 'System Operational'}</span>
        </div>

        {/* Quick Action Button Dropdown */}
        <div className="relative" ref={actionsRef}>
          <Button
            size="sm"
            onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
            className="gap-1 xs:gap-1.5 text-xs font-semibold px-2 xs:px-3 py-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isBn ? 'নতুন অ্যাকশন' : 'Quick Action'}</span>
            <ChevronDown className="w-3 h-3 opacity-80 shrink-0" />
          </Button>

          {actionsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 xs:w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isBn ? 'প্রশাসনিক শর্টকাট' : 'Administrative Actions'}
              </div>
              <Link
                href="/dashboard/admin/events"
                onClick={() => setActionsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">{isBn ? 'নতুন ইভেন্ট তৈরি করুন' : 'Schedule New Event'}</span>
              </Link>
              <Link
                href="/dashboard/admin/news"
                onClick={() => setActionsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Newspaper className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{isBn ? 'সংবাদ / বুলেটিন প্রকাশ' : 'Publish News Story'}</span>
              </Link>
              <Link
                href="/dashboard/admin/alumni"
                onClick={() => setActionsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{isBn ? 'অ্যালামনাই ভেরিফাই করুন' : 'Verify Alumni Members'}</span>
              </Link>
              <Link
                href="/dashboard/admin/donations"
                onClick={() => setActionsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{isBn ? 'ব্যাংক ট্রান্সফার রিভিউ' : 'Review Bank Deposits'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 xs:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications & Pending Items"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] xs:w-80 max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {isBn ? 'নোটিফিকেশন ও অ্যালার্ট' : 'Pending Action Items'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  {totalAlerts} {isBn ? 'টি বাকি' : 'Pending'}
                </span>
              </div>

              <div className="space-y-2">
                {pendingTransfersCount > 0 ? (
                  <Link
                    href="/dashboard/admin/donations"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {pendingTransfersCount} {isBn ? 'টি বিচারাধীন ব্যাংক ট্রান্সফার' : 'Pending Bank Deposits'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'যাচাই ও অনুমোদন করতে ক্লিক করুন' : 'Click to review deposit slips & approve'}
                      </p>
                    </div>
                  </Link>
                ) : null}

                {pendingUsersCount > 0 ? (
                  <Link
                    href="/dashboard/admin/alumni"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors group"
                  >
                    <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {pendingUsersCount} {isBn ? 'জন নতুন সদস্য যাচাই বাকি' : 'Pending Alumni Signups'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'ডিরেক্টরিতে সক্রিয় করতে অনুমোদন দিন' : 'Review profiles & grant verified status'}
                      </p>
                    </div>
                  </Link>
                ) : null}

                {totalAlerts === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <p>{isBn ? 'সবকিছু আপ-টু-ডেট আছে!' : 'All queues cleared. System up to date!'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
            title="Admin Profile Menu"
          >
            <Avatar
              name={user?.name || 'Admin'}
              src={user?.image}
              size="sm"
              className="ring-1 ring-slate-300 dark:ring-slate-700"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {user?.email || 'admin@alumni.ac.bd'}
                </p>
                <Badge variant="warning" className="mt-1.5 text-[9px] px-1.5 py-0">
                  Super Admin
                </Badge>
              </div>

              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{isBn ? 'আমার প্রোফাইল' : 'My Profile'}</span>
              </Link>
              <Link
                href="/"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'পাবলিক পোর্টাল' : 'Public Alumni Portal'}</span>
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isBn ? 'লগআউট' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
