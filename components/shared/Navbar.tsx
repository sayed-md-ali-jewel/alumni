'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  X,
  GraduationCap,
  Users,
  Calendar,
  Newspaper,
  HeartHandshake,
  ShieldAlert,
  UserCheck,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Droplet,
  HeartPulse,
  Award,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

export function Navbar() {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { settings, siteName, tagline } = useSiteSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false);
  const [mobileAuthDropdownOpen, setMobileAuthDropdownOpen] = useState(false);

  const authDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileAuthDropdownRef = useRef<HTMLDivElement>(null);
  const mobileProfileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setAuthDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (mobileAuthDropdownRef.current && !mobileAuthDropdownRef.current.contains(event.target as Node)) {
        setMobileAuthDropdownOpen(false);
      }
      if (mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(event.target as Node)) {
        setMobileProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatically close dropdowns on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setAuthDropdownOpen(false);
    setMobileProfileDropdownOpen(false);
    setMobileAuthDropdownOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: t('home'), icon: GraduationCap },
    { href: '/committee', label: t('committee'), icon: Award },
    { href: '/directory', label: t('directory'), icon: Users },
    { href: '/blood-donors', label: t('bloodDonors'), icon: Droplet, isBlood: true },
    { href: '/blood-requests', label: t('bloodRequests'), icon: HeartPulse, isBlood: true },
    { href: '/events', label: t('events'), icon: Calendar },
    { href: '/news', label: t('news'), icon: Newspaper },
    { href: '/donate', label: t('donate'), icon: HeartHandshake },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const user = session?.user as any;

  // Render nothing if inside dedicated admin portal
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  const renderProfileDropdownContent = (closeMenu: () => void) => (
    <div className="w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {user?.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {user?.email}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {user?.role === 'admin' && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0">
              {locale === 'bn' ? 'অ্যাডমিন' : 'Admin'}
            </Badge>
          )}
          {user?.isVerified ? (
            <Badge variant="success" className="text-[10px] px-2 py-0 flex items-center gap-1">
              <UserCheck className="w-2.5 h-2.5" />
              <span>{locale === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px] px-2 py-0 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>{locale === 'bn' ? 'যাচাই প্রক্রিয়াধীন' : 'Pending'}</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="py-1">
        <Link
          href="/profile"
          onClick={closeMenu}
          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <User className="w-4 h-4 text-primary" />
          <span>{t('profile')}</span>
        </Link>

        {user?.role === 'admin' && (
          <Link
            href="/dashboard/admin"
            onClick={closeMenu}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-500" />
            <span>{t('dashboard')}</span>
          </Link>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
        <button
          onClick={() => {
            closeMenu();
            signOut({ callbackUrl: `/${locale}` });
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  const renderAuthDropdownContent = (closeMenu: () => void) => (
    <div className="w-48 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
      <Link
        href="/login"
        onClick={closeMenu}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <LogIn className="w-4 h-4 text-primary" />
        <span>{t('login')}</span>
      </Link>
      <Link
        href="/register"
        onClick={closeMenu}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
      >
        <UserPlus className="w-4 h-4 text-emerald-500" />
        <span>{t('register')}</span>
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-900 via-primary-700 to-primary-500 text-white flex items-center justify-center shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105 border border-primary-400/30 overflow-hidden shrink-0">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="w-full h-full object-cover"
              />
            ) : (
              <GraduationCap className="w-6 h-6 text-amber-300" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight truncate max-w-[130px] sm:max-w-none">
              {siteName}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate max-w-[130px] sm:max-w-none">
              {tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isBlood = item.isBlood;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 group ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isBlood
                      ? 'text-red-500 dark:text-red-400 fill-red-500/20'
                      : active
                      ? 'text-primary'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Controls: Switcher, Theme, NotificationBell, Auth */}
        <div className="hidden xl:flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />

          {session ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all duration-200 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                aria-label="User profile menu"
              >
                <Avatar
                  src={user?.image}
                  fallback={user?.name || 'AL'}
                  size="sm"
                  className="w-7 h-7 rounded-full border border-slate-100 dark:border-slate-700 object-cover shrink-0"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>

              {/* Desktop Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2">
                  {renderProfileDropdownContent(() => setProfileDropdownOpen(false))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={authDropdownRef}>
              <button
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                aria-label="Account / Login"
                title={locale === 'bn' ? 'লগইন / নিবন্ধন' : 'Login / Register'}
              >
                <LogIn className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform duration-200 group-hover:scale-110" />
              </button>

              {/* Desktop Login / Register Popover */}
              {authDropdownOpen && (
                <div className="absolute right-0 mt-2">
                  {renderAuthDropdownContent(() => setAuthDropdownOpen(false))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile / Tablet Action Controls (when hamburger menu appears) */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />

          {/* Mobile Profile Pill or Login Icon */}
          {session ? (
            <div className="relative" ref={mobileProfileDropdownRef}>
              <button
                onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all duration-200 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 group shrink-0"
                aria-label="User profile menu"
              >
                <Avatar
                  src={user?.image}
                  fallback={user?.name || 'AL'}
                  size="sm"
                  className="w-7 h-7 rounded-full border border-slate-100 dark:border-slate-700 object-cover shrink-0"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[80px] md:max-w-[110px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>

              {/* Mobile Profile Dropdown Menu */}
              {mobileProfileDropdownOpen && (
                <div className="absolute right-0 mt-2">
                  {renderProfileDropdownContent(() => setMobileProfileDropdownOpen(false))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={mobileAuthDropdownRef}>
              <button
                onClick={() => setMobileAuthDropdownOpen(!mobileAuthDropdownOpen)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                aria-label="Account / Login"
                title={locale === 'bn' ? 'লগইন / নিবন্ধন' : 'Login / Register'}
              >
                <LogIn className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform duration-200 group-hover:scale-110" />
              </button>

              {/* Mobile Login / Register Popover */}
              {mobileAuthDropdownOpen && (
                <div className="absolute right-0 mt-2">
                  {renderAuthDropdownContent(() => setMobileAuthDropdownOpen(false))}
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Absolute Overlay) */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 py-5 space-y-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const isBlood = item.isBlood;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isBlood
                          ? 'text-red-500 dark:text-red-400 fill-red-500/20'
                          : active
                          ? 'text-primary'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Avatar src={user?.image} fallback={user?.name || 'AL'} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('profile')}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t('dashboard')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: `/${locale}` });
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 rounded-xl text-xs font-semibold h-10 border-slate-200 dark:border-slate-700">
                    <LogIn className="w-3.5 h-3.5 text-primary" />
                    <span>{t('login')}</span>
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full gap-2 rounded-xl text-xs font-semibold h-10 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('register')}</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

