'use client';

import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function NotFoundLocale() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg">
          <GraduationCap className="w-8 h-8 text-amber-300" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {isBn ? '৪০৪' : '404'}
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আপনার অনুরোধকৃত পাতাটি খুঁজে পাওয়া যায়নি অথবা স্থানান্তর করা হয়েছে।'
              : 'The page you are looking for does not exist or has been moved.'}
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
