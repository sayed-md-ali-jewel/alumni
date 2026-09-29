'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { XCircle, RefreshCcw, Building, ArrowLeft } from 'lucide-react';

export default function DonateFailPage() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const locale = useLocale();
  const t = useTranslations('donate');
  const isBn = locale === 'bn';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-lg space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto shadow-md">
        <XCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('failTitle')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('failSubtitle')}
        </p>
      </div>

      {tran_id && (
        <p className="text-xs text-slate-400 font-mono">
          Ref ID: {tran_id}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link href="/donate" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-primary">
            <RefreshCcw className="w-4 h-4" />
            <span>{t('retryPayment')}</span>
          </Button>
        </Link>
        <Link href="/donate/bank-transfer" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Building className="w-4 h-4" />
            <span>{isBn ? 'সরাসরি ব্যাংক ডিপোজিট' : 'Direct Bank Transfer'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
