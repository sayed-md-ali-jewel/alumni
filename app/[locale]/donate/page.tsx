'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DonationProgress } from '@/components/shared/DonationProgress';
import { formatCurrency, parseErrorMessages } from '@/lib/utils';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  HeartHandshake,
  CreditCard,
  Banknote,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DonatePage() {
  const t = useTranslations('donate');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const { settings } = useSiteSettings();
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const isBn = locale === 'bn';

  const DEFAULT_CAMPAIGNS = [
    {
      id: 'Student Scholarship Endowment Fund',
      title_bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থী শিক্ষাবৃত্তি তহবিল',
      title_en: 'Student Scholarship Endowment Fund',
      desc_bn: 'অসচ্ছল শিক্ষার্থীদের বার্ষিক পূর্ণ টিউশন ফি এবং মাসিক শিক্ষা ভাতা অনুদান।',
      desc_en: 'Sponsoring full undergraduate tuition and living stipends for talented students in need.',
      goal: 1000000,
      raised: 350000,
    },
    {
      id: 'Smart Classroom & AI Lab Renovation',
      title_bn: 'স্মার্ট ক্লাসরুম ও অত্যাধুনিক এআই ল্যাব উন্নয়ন',
      title_en: 'Smart Classroom & AI Lab Renovation',
      desc_bn: 'আধুনিক জিপিইউ সার্ভার ও রোবোটিক্স ল্যাব উন্নয়ন।',
      desc_en: 'Equipping computing labs with GPU servers and modern interactive tech tools.',
      goal: 750000,
      raised: 200000,
    },
    {
      id: 'Emergency Student Medical Relief Fund',
      title_bn: 'জরুরি শিক্ষার্থী চিকিৎসা সহায়তা তহবিল',
      title_en: 'Emergency Student Medical Relief Fund',
      desc_bn: 'অপ্রত্যাশিত দুর্ঘটনা ও জটিল রোগের জরুরি চিকিৎসা অনুদান।',
      desc_en: 'Providing immediate medical subsidies for students during severe health emergencies.',
      goal: 500000,
      raised: 125000,
    },
  ];

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const [campaigns, setCampaigns] = useState<any[]>(DEFAULT_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState(DEFAULT_CAMPAIGNS[0].id);

  useEffect(() => {
    const fetchLiveCampaigns = async () => {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const data = await res.json();
          if (data.campaigns && data.campaigns.length > 0) {
            setCampaigns(data.campaigns);
          }
        }
      } catch (e) {
        console.error('Error loading live campaigns:', e);
      }
    };
    fetchLiveCampaigns();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [donorName, setDonorName] = useState(session?.user?.name || '');
  const [donorEmail, setDonorEmail] = useState(session?.user?.email || '');
  const [donorPhone, setDonorPhone] = useState('01700000000');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [givenTo, setGivenTo] = useState('');
  const [donationDate, setDonationDate] = useState(todayStr);
  const [donationTime, setDonationTime] = useState(nowTimeStr);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cash'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Dynamic Payment Settings from Admin site settings
  const bkashNumber = settings?.bkashNumber || '01712345678';
  const bkashType = settings?.bkashType || 'Personal';
  const bkashInstructions =
    (isBn ? settings?.bkashInstructions_bn : settings?.bkashInstructions_en) ||
    (isBn
      ? '১. বিকাশ অ্যাপে Send Money অথবা Payment অপশনে যান।\n২. উপরের বিকাশ নম্বরে অনুদানের সঠিক পরিমাণ পাঠান।\n৩. রেফারেন্সে "Alumni" লিখুন।\n৪. প্রাপ্ত Transaction ID (TrxID) নিচে লিখে সাবমিট করুন।'
      : '1. Open bKash App and select Send Money / Payment.\n2. Send the donation amount to the number above.\n3. Enter "Alumni" in reference.\n4. Copy and paste the Transaction ID below and submit.');

  const nagadNumber = settings?.nagadNumber || '01812345678';
  const nagadType = settings?.nagadType || 'Personal';
  const nagadInstructions =
    (isBn ? settings?.nagadInstructions_bn : settings?.nagadInstructions_en) ||
    (isBn
      ? '১. নগদ অ্যাপে যান এবং Send Money নির্বাচন করুন।\n২. উপরের নম্বরে অনুদানের টাকা পাঠান।\n৩. প্রাপ্ত Transaction ID (TxnID) নিচে ইনপুট দিয়ে অনুদান সম্পন্ন করুন।'
      : '1. Open Nagad App and choose Send Money.\n2. Transfer the exact amount to the number above.\n3. Enter the Transaction ID below to confirm.');

  const cashInstructions =
    (isBn ? settings?.cashInstructions_bn : settings?.cashInstructions_en) ||
    (isBn
      ? 'আপনি সরাসরি বিদ্যালয় অ্যালামনাই সচিবালয় অফিসে (কক্ষ নং ১০২, মূল ক্যাম্পাস, ঢাকা) নগদ অর্থ জমা দিতে পারেন। রসিদ প্রদান করা হবে এবং অনলাইন প্রোফাইলে স্ট্যাটাস অনুমোদিত হবে।'
      : 'You can deposit cash directly at the Alumni Secretariat Desk (Office #102, Central Campus, Dhaka). A physical receipt will be issued upon deposit.');

  const handleSelectQuickAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleCopyNumber = (num: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopied(true);
      showSuccessToast(
        isBn ? 'নম্বর কপি করা হয়েছে' : 'Number copied to clipboard',
        isBn ? 'কপি সম্পন্ন' : 'Copied'
      );
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleProceedDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!transactionId || transactionId.trim().length < 4) {
        const msg = isBn
          ? 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (Transaction ID) প্রদান করুন।'
          : 'Please enter a valid Transaction ID from your payment SMS/App.';
        setError(msg);
        showErrorToast(msg, isBn ? 'ট্রানজেকশন আইডি প্রয়োজন' : 'Transaction ID Required');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: isAnonymous ? (isBn ? 'গোপন দাতা' : 'Anonymous Donor') : donorName,
          donorEmail,
          donorPhone,
          amount,
          campaign: selectedCampaign,
          isAnonymous,
          method: paymentMethod,
          transactionId: paymentMethod === 'cash' ? undefined : transactionId.trim(),
          givenTo: givenTo.trim() || undefined,
          recipientName: givenTo.trim() || undefined,
          donationDate,
          donationTime: donationTime || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.errors || data.error || 'Failed to record donation';
        throw new Error(typeof errorContent === 'object' ? JSON.stringify(errorContent) : errorContent);
      }

      setSuccessData(data);
      showSuccessToast(
        isBn ? 'অনুদান সফলভাবে সম্পন্ন হয়েছে! অ্যাডমিন যাচাইয়ের পর রসিদ প্রস্তুত হবে।' : 'Donation recorded successfully! Pending admin verification.',
        isBn ? 'ধন্যবাদ!' : 'Thank You!'
      );
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || 'Donation submission failed';
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'অনুদানে সমস্যা হয়েছে' : 'Donation Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
            <HeartHandshake className="w-4 h-4" />
            <span>{isBn ? 'বিদ্যাপীঠে অবদান ও সমাজসেবা' : 'Giving Back to Alma Mater'}</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Success Modal / State */}
        {successData ? (
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
            <div className="p-5 xs:p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {t('successTitle')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('successDesc')}
                </p>
              </div>

              {/* Summary Details */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3 text-left text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('receiptNo')}</span>
                  <span className="font-mono font-bold text-primary">#{successData.receiptNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isBn ? 'অনুদানের পরিমাণ' : 'Amount'}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {formatCurrency(amount, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('paymentMethod')}</span>
                  <span className="font-bold uppercase text-slate-800 dark:text-slate-200">
                    {paymentMethod}
                  </span>
                </div>
                {successData.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('trackingTrx')}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {successData.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">{isBn ? 'স্ট্যাটাস' : 'Status'}</span>
                  <Badge variant="warning" className="text-xs px-2.5 py-0.5 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{t('pendingVerification')}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    setSuccessData(null);
                    setTransactionId('');
                  }}
                  variant="outline"
                  className="w-full rounded-2xl"
                >
                  {isBn ? 'আরেকটি অনুদান দিন' : 'Make Another Donation'}
                </Button>
                <Link href="/" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold">
                    {t('backHome')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Campaigns Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                {t('campaigns')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {campaigns.map((camp) => {
                  const isSelected = selectedCampaign === camp.id;
                  return (
                    <Card
                      key={camp.id}
                      onClick={() => setSelectedCampaign(camp.id)}
                      className={`cursor-pointer transition-all duration-200 rounded-3xl border-2 ${
                        isSelected
                          ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <CardContent className="p-4 xs:p-5 sm:p-6 space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {isBn ? camp.title_bn : camp.title_en}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {isBn ? camp.desc_bn : camp.desc_en}
                          </p>
                        </div>

                        <DonationProgress raised={camp.raised} goal={camp.goal} />

                        <div className="pt-2">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-primary' : 'text-slate-400'
                            }`}
                          >
                            {isSelected
                              ? isBn
                                ? '✓ নির্বাচিত ক্যাম্পেইন'
                                : '✓ Selected Cause'
                              : isBn
                              ? 'নির্বাচন করতে ক্লিক করুন'
                              : 'Click to select'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Donation Form Card */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 p-4 xs:p-6 sm:p-8">
                <CardTitle className="text-lg xs:text-xl font-bold text-slate-900 dark:text-white">
                  {isBn ? 'অনুদানের তথ্য ও পেমেন্ট বিবরণ' : 'Donation & Payment Details'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {isBn
                    ? 'বিকাশ, নগদ অথবা সরাসরি ক্যাশ জমার মাধ্যমে আপনার পছন্দের তহবিলে অনুদান প্রদান করুন।'
                    : 'Support your chosen fund with bKash, Nagad, or direct Cash deposit.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 xs:p-6 sm:p-8 space-y-8">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center gap-2.5 border border-destructive/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleProceedDonation} className="space-y-6">
                  {/* Amount Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('selectAmount')}
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {quickAmounts.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSelectQuickAmount(q)}
                          className={`py-2.5 rounded-2xl font-bold text-sm transition-all border ${
                            amount === q
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {formatCurrency(q, locale)}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-medium text-slate-500">
                        {t('customAmount')}
                      </label>
                      <Input
                        type="number"
                        min="10"
                        required
                        placeholder="e.g. 5000"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="mt-1 font-bold text-lg rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('donorDetails')}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('donorName')} *
                        </label>
                        <Input
                          required
                          disabled={isAnonymous}
                          placeholder={isBn ? 'তানভীর আহমেদ' : 'Tanvir Ahmed'}
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('donorEmail')} *
                        </label>
                        <Input
                          type="email"
                          required
                          placeholder="tanvir@example.com"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('donorPhone')} *
                        </label>
                        <Input
                          required
                          placeholder="01712345678"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="anonCheck"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                      <label htmlFor="anonCheck" className="text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                        {t('anonymousDonation')}
                      </label>
                    </div>

                    {/* Additional Required Donation Details: Given To, Date, Time, Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? 'গ্রহীতা (Given To / Recipient)' : 'Given To / Recipient'}
                        </label>
                        <Input
                          placeholder={isBn ? 'উদাঃ শিক্ষাবৃত্তি কমিটি / নির্দিষ্ট শিক্ষার্থী' : 'e.g. Scholarship Fund / Recipient'}
                          value={givenTo}
                          onChange={(e) => setGivenTo(e.target.value)}
                          className="rounded-2xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? 'অনুদানের তারিখ (Date) *' : 'Donation Date *'}
                        </label>
                        <Input
                          type="date"
                          required
                          value={donationDate}
                          onChange={(e) => setDonationDate(e.target.value)}
                          className="rounded-2xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? 'অনুদানের সময় (Time)' : 'Donation Time'}
                        </label>
                        <Input
                          type="time"
                          value={donationTime}
                          onChange={(e) => setDonationTime(e.target.value)}
                          className="rounded-2xl text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isBn ? 'মন্তব্য (Note - ঐচ্ছিক)' : 'Note (Optional)'}
                      </label>
                      <Input
                        placeholder={isBn ? 'উদাঃ জরুরি অনুদান, সরাসরি রোগীকে দেওয়া হয়েছে...' : 'e.g. Emergency donation, Given directly to patient, etc.'}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-2xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector (bKash, Nagad, Cash) */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('paymentMethod')}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* bKash Option */}
                      <div
                        onClick={() => setPaymentMethod('bkash')}
                        className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                          paymentMethod === 'bkash'
                            ? 'border-pink-500 bg-pink-500/5 shadow-md ring-2 ring-pink-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-pink-600 inline-block" />
                            {t('bkash')}
                          </span>
                          <Badge variant="secondary" className="text-[10px] bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                            Manual
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {t('bkashDesc')}
                        </p>
                      </div>

                      {/* Nagad Option */}
                      <div
                        onClick={() => setPaymentMethod('nagad')}
                        className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                          paymentMethod === 'nagad'
                            ? 'border-amber-500 bg-amber-500/5 shadow-md ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                            {t('nagad')}
                          </span>
                          <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            Manual
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {t('nagadDesc')}
                        </p>
                      </div>

                      {/* Cash Option */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                          paymentMethod === 'cash'
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            {t('cash')}
                          </span>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            In-Person
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {t('cashDesc')}
                        </p>
                      </div>
                    </div>

                    {/* bKash Details Box */}
                    {paymentMethod === 'bkash' && (
                      <div className="p-5 rounded-3xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 space-y-4 animate-in fade-in-50 duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-pink-900/40 shadow-xs">
                          <div>
                            <span className="text-[11px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider block">
                              bKash Number ({bkashType})
                            </span>
                            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                              {bkashNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(bkashNumber)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-sm transition-all shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'নম্বর কপি করুন' : 'Copy Number')}</span>
                          </button>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            <span>{t('instructions')}</span>
                          </span>
                          <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-pink-100 dark:border-pink-900/30">
                            {bkashInstructions}
                          </p>
                        </div>

                        {/* Transaction ID Input */}
                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('transactionId')} *</span>
                            <span className="text-[11px] text-pink-600 font-normal">Required</span>
                          </label>
                          <Input
                            required
                            placeholder={t('transactionIdPlaceholder')}
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            className="font-mono text-base font-bold tracking-wider rounded-2xl border-pink-300 focus:ring-pink-500 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Nagad Details Box */}
                    {paymentMethod === 'nagad' && (
                      <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-4 animate-in fade-in-50 duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40 shadow-xs">
                          <div>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                              Nagad Number ({nagadType})
                            </span>
                            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                              {nagadNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(nagadNumber)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'নম্বর কপি করুন' : 'Copy Number')}</span>
                          </button>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            <span>{t('instructions')}</span>
                          </span>
                          <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            {nagadInstructions}
                          </p>
                        </div>

                        {/* Transaction ID Input */}
                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('transactionId')} *</span>
                            <span className="text-[11px] text-amber-600 font-normal">Required</span>
                          </label>
                          <Input
                            required
                            placeholder={t('transactionIdPlaceholder')}
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            className="font-mono text-base font-bold tracking-wider rounded-2xl border-amber-300 focus:ring-amber-500 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Cash Details Box */}
                    {paymentMethod === 'cash' && (
                      <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-4 animate-in fade-in-50 duration-200">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                          <Building className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {isBn ? 'সচিবালয়ে সরাসরি ক্যাশ প্রদান' : 'Secretariat Office Cash Deposit'}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                              {cashInstructions}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {isBn
                              ? 'অনলাইন ফর্মটি সাবমিট করলে একটি ট্র্যাকিং নম্বর তৈরি হবে, যা অফিসে গিয়ে প্রদর্শন করবেন।'
                              : 'Submitting this form records your pledge. Show the tracking reference at the office desk.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/25"
                      isLoading={isLoading}
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {t('submitDonation')} — {formatCurrency(amount, locale)}
                      </span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
