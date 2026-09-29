'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import confetti from 'canvas-confetti';
import { PDFReceiptModal, ReceiptData } from '@/components/shared/PDFReceiptModal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle2, ArrowRight, HeartHandshake } from 'lucide-react';

export default function DonateSuccessPage() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const locale = useLocale();
  const t = useTranslations('donate');
  const isBn = locale === 'bn';

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    const fetchReceipt = async () => {
      if (!tran_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/donate/receipt/${tran_id}`);
        if (res.ok) {
          const data = await res.json();
          setReceipt(data);
        }
      } catch (e) {
        console.error('Failed to fetch receipt:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [tran_id]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl space-y-8">
      <div className="text-center space-y-4 no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t('successTitle')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          {t('successSubtitle')}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
          <p className="text-sm text-slate-500">Generating receipt...</p>
        </div>
      ) : receipt ? (
        <PDFReceiptModal receipt={receipt} />
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-6 space-y-4">
          <CardContent className="p-0">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isBn
                ? 'আপনার পেমেন্ট রেকর্ড নথিভুক্ত হয়েছে। ট্রানজেকশন আইডি: '
                : 'Your payment record has been saved. Transaction Ref: '}
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {tran_id || 'N/A'}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="text-center no-print pt-4">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <span>{isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
