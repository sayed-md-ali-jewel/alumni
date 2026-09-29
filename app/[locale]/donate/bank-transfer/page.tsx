'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { formatCurrency } from '@/lib/utils';
import {
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';

export default function BankTransferPage() {
  const t = useTranslations('bankTransfer');
  const common = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const isBn = locale === 'bn';

  const defaultCampaign = searchParams.get('campaign') || 'Student Scholarship Endowment Fund';
  const defaultAmount = searchParams.get('amount') || '5000';

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: defaultAmount,
    campaign: defaultCampaign,
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Dutch-Bangla Bank PLC',
    branch: process.env.NEXT_PUBLIC_BANK_BRANCH || 'Karwan Bazar Branch, Dhaka',
    transactionRef: '',
    screenshotUrl: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/donate/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit bank transfer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      <Link href="/donate" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'অনুদান পেজে ফিরে যান' : 'Back to Donation Page'}</span>
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
          <Building className="w-4 h-4" />
          <span>{isBn ? 'ব্যাংক ট্রান্সফার' : 'Offline Bank Transfer'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Bank Account Info Box */}
      <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            {t('bankDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[11px] uppercase font-bold">{t('bankName')}</p>
                <p className="font-bold text-slate-900 dark:text-white">Dutch-Bangla Bank PLC</p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[11px] uppercase font-bold">{t('accountName')}</p>
                <p className="font-bold text-slate-900 dark:text-white">Alumni Association Welfare Trust</p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[11px] uppercase font-bold">{t('accountNumber')}</p>
                <p className="font-mono font-bold text-base text-primary">102.120.9876543</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('102.120.9876543', 'ac')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                {copiedField === 'ac' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[11px] uppercase font-bold">{t('bkashMerchant')}</p>
                <p className="font-mono font-bold text-base text-rose-600">01700-000000</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('01700000000', 'bkash')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                {copiedField === 'bkash' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {t('formTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 space-y-3 text-center border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold">
                {isBn ? 'ট্রান্সফার তথ্য সফলভাবে জমা হয়েছে!' : 'Transfer Details Submitted!'}
              </h3>
              <p className="text-xs sm:text-sm">
                {t('submittedSuccess')}
              </p>
              <Link href="/donate" className="inline-block pt-2">
                <Button variant="outline">{isBn ? 'অনুদান পেজে যান' : 'Back to Donation Page'}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {locale === 'bn' ? 'আপনার নাম' : 'Donor Name'} *
                  </label>
                  <Input
                    required
                    placeholder="Tanvir Ahmed"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'Donor Email'} *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="tanvir@example.com"
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {locale === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *
                  </label>
                  <Input
                    required
                    placeholder="01712345678"
                    value={formData.donorPhone}
                    onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('amount')} *
                  </label>
                  <Input
                    type="number"
                    min="10"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('campaign')} *
                </label>
                <Input
                  required
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('txnRef')} *
                  </label>
                  <Input
                    required
                    placeholder="e.g. DBBL-DEP-884920 / TrxID 9K8L2M"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <ImageUpload
                    shape="rectangle"
                    label={t('screenshotUrl')}
                    value={formData.screenshotUrl}
                    onChange={(url) => setFormData({ ...formData, screenshotUrl: url })}
                    helperText={isBn ? 'ব্যাংক স্লিপ বা ট্রানজেকশনের স্ক্রিনশট আপলোড করুন' : 'Upload photo of deposit slip or transaction screenshot'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('notes')}
                </label>
                <Textarea
                  placeholder={isBn ? 'অন্য কোনো তথ্য থাকলে উল্লেখ করুন...' : 'Any additional notes or instructions...'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                {t('submitBtn')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
