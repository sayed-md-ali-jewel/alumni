'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  Newspaper,
  HeartHandshake,
  PlusCircle,
  ExternalLink,
  Moon,
  Sun,
  Globe,
  ArrowRight,
  Sparkles,
  X,
  FileSpreadsheet,
  Sliders,
  Droplet,
  AlertOctagon,
  Database,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTransfersCount?: number;
  pendingUsersCount?: number;
}

export function AdminCommandPalette({
  isOpen,
  onClose,
  pendingTransfersCount = 0,
  pendingUsersCount = 0,
}: AdminCommandPaletteProps) {
  const router = useRouter();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { theme, setTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    {
      id: 'dash',
      title: isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Admin Command Center Overview',
      subtitle: isBn ? 'সার্বিক পরিসংখ্যান ও মেট্রিক্স' : 'Key metrics, charts & attention queue',
      icon: LayoutDashboard,
      category: isBn ? 'নেভিগেশন' : 'Navigation',
      href: '/dashboard/admin',
    },
    {
      id: 'alumni',
      title: isBn ? 'অ্যালামনাই ভেরিফিকেশন ও তালিকা' : 'Alumni Verification & Directory',
      subtitle: `${pendingUsersCount} ${isBn ? 'জন অনুমোদনের অপেক্ষায়' : 'pending verification'}`,
      icon: Users,
      category: isBn ? 'ব্যবস্থাপনা' : 'Management',
      href: '/dashboard/admin/alumni',
    },
    {
      id: 'blood-donors',
      title: isBn ? 'রক্তদাতা মডারেশন ও তালিকা' : 'Blood Donors Moderation',
      subtitle: isBn ? 'নিবন্ধিত রক্তদাতাদের প্রোফাইল পরিচালনা' : 'Manage registered blood donors & visibility',
      icon: Droplet,
      category: isBn ? 'ব্যবস্থাপনা' : 'Management',
      href: '/dashboard/admin/blood-donors',
    },
    {
      id: 'blood-requests',
      title: isBn ? 'জরুরী রক্তের চাহিদা পরিচালনা' : 'Blood Requests Management',
      subtitle: isBn ? 'চলমান ও জরুরী রক্তের আবেদন ট্র্যাক করুন' : 'Track and manage emergency blood requests',
      icon: AlertOctagon,
      category: isBn ? 'ব্যবস্থাপনা' : 'Management',
      href: '/dashboard/admin/blood-requests',
    },
    {
      id: 'events',
      title: isBn ? 'ইভেন্ট ও রিইউনিয়ন ব্যবস্থাপনা' : 'Events & Reunions Management',
      subtitle: isBn ? 'নতুন ইভেন্ট তৈরি ও তালিকা' : 'Manage reunions, RSVP lists & schedules',
      icon: Calendar,
      category: isBn ? 'ব্যবস্থাপনা' : 'Management',
      href: '/dashboard/admin/events',
    },
    {
      id: 'news',
      title: isBn ? 'সংবাদ ও ব্লগ প্রকাশনা' : 'News & Announcements CMS',
      subtitle: isBn ? 'ক্যাম্পাস ও অ্যালামনাই সংবাদ' : 'Publish stories, press releases & milestones',
      icon: Newspaper,
      category: isBn ? 'ব্যবস্থাপনা' : 'Management',
      href: '/dashboard/admin/news',
    },
    {
      id: 'donations',
      title: isBn ? 'অনুদান লেজার ও ব্যাংক ট্রান্সফার' : 'Donations Ledger & Bank Approvals',
      subtitle: `${pendingTransfersCount} ${isBn ? 'টি ব্যাংক ডিপোজিট পেন্ডিং' : 'pending manual bank transfers'}`,
      icon: HeartHandshake,
      category: isBn ? 'ট্রেজারি' : 'Treasury',
      href: '/dashboard/admin/donations',
    },
    {
      id: 'settings',
      title: isBn ? 'কমিউনিটি ও ফুটার কাস্টমাইজেশন' : 'Community & Footer Customization',
      subtitle: isBn ? 'ডায়নামিক নাম, হোয়াটসঅ্যাপ ও ফেসবুক লিঙ্ক' : 'Dynamic community name, WhatsApp & Facebook URLs',
      icon: Sliders,
      category: isBn ? 'সিস্টেম' : 'System',
      href: '/dashboard/admin/settings',
    },
    {
      id: 'backup',
      title: isBn ? 'ডাটা এক্সপোর্ট ও ইমপোর্ট ব্যাকআপ' : 'Export & Import Database Backup',
      subtitle: isBn ? 'ইউজার, রক্তদাতা, অনুদান ও সেটিংসের সম্পূর্ণ ব্যাকআপ সংরক্ষণ ও রিস্টোর' : 'Download complete JSON database snapshots or restore from file',
      icon: Database,
      category: isBn ? 'সিস্টেম' : 'System',
      href: '/dashboard/admin/settings',
    },
    {
      id: 'public-site',
      title: isBn ? 'পাবলিক ওয়েবসাইটে যান' : 'Exit to Public Alumni Portal',
      subtitle: isBn ? 'ওয়েবসাইটের মূল হোমপেজে যান' : 'Switch back to visitor & alumni view',
      icon: ExternalLink,
      category: isBn ? 'শর্টকাট' : 'Shortcuts',
      href: '/',
    },
    {
      id: 'toggle-theme',
      title: isBn ? 'থিম পরিবর্তন (ডার্ক / লাইট)' : 'Toggle Dark / Light Theme',
      subtitle: isBn ? 'ইন্টারফেস মোড পরিবর্তন করুন' : 'Switch admin portal visual appearance',
      icon: theme === 'dark' ? Sun : Moon,
      category: isBn ? 'সিস্টেম' : 'System',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ];

  const filtered = actions.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 xs:pt-20 sm:pt-28 px-2.5 xs:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              isBn
                ? 'দ্রুত খুঁজুন বা কমান্ড দিন... (যেমন: Alumni, Events, News)'
                : 'Type a command or jump to page... (e.g. Alumni, Events, Ledger)'
            }
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching admin commands found'}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              ↑↓
            </span>
            <span>Navigate</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-2">
              ↵
            </span>
            <span>Select</span>
          </div>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
