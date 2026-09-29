'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Newspaper,
  HeartHandshake,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Activity,
  ArrowUpRight,
  Database,
  Building,
  Sliders,
  Droplet,
  AlertOctagon,
  Award,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  onOpenCommandPalette: () => void;
  pendingTransfersCount?: number;
  pendingUsersCount?: number;
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenCommandPalette,
  pendingTransfersCount = 0,
  pendingUsersCount = 0,
}: AdminSidebarProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isBn = locale === 'bn';

  const user = session?.user as any;

  const navGroups = [
    {
      label: isBn ? 'মূল ড্যাশবোর্ড' : 'CORE OVERVIEW',
      items: [
        {
          href: '/dashboard/admin',
          label: isBn ? 'কমান্ড সেন্টার' : 'Overview & KPIs',
          icon: LayoutDashboard,
          badge: null,
          exact: true,
        },
      ],
    },
    {
      label: isBn ? 'ব্যবস্থাপনা ও রেকর্ড' : 'MANAGEMENT & RECORDS',
      items: [
        {
          href: '/dashboard/admin/alumni',
          label: isBn ? 'অ্যালামনাই ভেরিফিকেশন' : 'Alumni Directory',
          icon: Users,
          badge:
            pendingUsersCount > 0
              ? { text: `${pendingUsersCount}`, variant: 'warning' as const }
              : null,
          exact: false,
        },
        {
          href: '/dashboard/admin/blood-donors',
          label: isBn ? 'রক্তদাতা ব্যবস্থাপনা' : 'Blood Donors',
          icon: Droplet,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/blood-requests',
          label: isBn ? 'রক্তের চাহিদা পরিচালনা' : 'Blood Requests',
          icon: AlertOctagon,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/events',
          label: isBn ? 'ইভেন্ট ও রিইউনিয়ন' : 'Events & Reunions',
          icon: Calendar,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/news',
          label: isBn ? 'সংবাদ ও বুলেটিন' : 'News & Stories',
          icon: Newspaper,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/campaigns',
          label: isBn ? 'তহবিল ও ক্যাম্পেইন' : 'Endowment & Campaigns',
          icon: Building,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/donations',
          label: isBn ? 'অনুদান ও ব্যাংক ট্রান্সফার' : 'Donations & Treasury',
          icon: HeartHandshake,
          badge:
            pendingTransfersCount > 0
              ? { text: `${pendingTransfersCount}`, variant: 'destructive' as const }
              : null,
          exact: false,
        },
        {
          href: '/dashboard/admin/committee',
          label: isBn ? 'কমিটি ও পদবী' : 'Committee & Leadership',
          icon: Award,
          badge: null,
          exact: false,
        },
      ],
    },
    {
      label: isBn ? 'সিস্টেম ও কাস্টমাইজেশন' : 'SYSTEM & SETTINGS',
      items: [
        {
          href: '/dashboard/admin/slider',
          label: isBn ? 'হোমপেজ হিরো স্লাইডার' : 'Hero Slider & Stats',
          icon: Sliders,
          badge: null,
          exact: false,
        },
        {
          href: '/dashboard/admin/settings',
          label: isBn ? 'হেডার, লোগো ও ফুটার' : 'Branding & Header/Footer',
          icon: Sliders,
          badge: null,
          exact: false,
        },
      ],
    },
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Portal Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-800/80 bg-slate-950/50">
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 overflow-hidden ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-primary-600 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-900/40 shrink-0 border border-amber-400/30">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight truncate">
                    Admin Portal
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  Command Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search trigger shortcut button in sidebar */}
        <div className="px-3 pt-4">
          <button
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-all group ${
              isCollapsed ? 'justify-center px-2' : 'justify-between'
            }`}
            title="Quick Search (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-300" />
              {!isCollapsed && <span>{isBn ? 'কমান্ড সার্চ...' : 'Quick Search...'}</span>}
            </div>
            {!isCollapsed && (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 border border-slate-700 rounded">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                        active
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-md shadow-primary-900/30 border border-primary-400/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {/* Pending count badge */}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            item.badge.variant === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.badge.text}
                        </span>
                      )}

                      {/* Collapsed indicator dot */}
                      {isCollapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section: Public Portal Link & Admin Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          {/* Public Portal Shortcut */}
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Return to Public Site"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-[11px] font-semibold">
                {isBn ? 'পাবলিক ওয়েবসাইটে যান' : 'Exit to Public Site'}
              </span>
            )}
          </Link>

          {/* User Profile Card */}
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <Avatar
              name={user?.name || 'Admin'}
              src={user?.image}
              size="sm"
              className="ring-2 ring-primary-500/40 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
