'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
      title={locale === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
}
