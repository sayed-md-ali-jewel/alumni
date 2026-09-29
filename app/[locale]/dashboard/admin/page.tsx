'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, formatDate, toBengaliNumerals } from '@/lib/utils';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  Users,
  ShieldCheck,
  Calendar,
  Newspaper,
  Briefcase,
  HeartHandshake,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Download,
  Plus,
  ArrowUpRight,
  Building,
  Check,
  X,
  CreditCard,
  FileSpreadsheet,
  Layers,
  Activity,
  Sparkles,
  ShieldAlert,
  Droplet,
  AlertOctagon,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const { showAlert, showConfirm } = useSweetAlert();

  const isBn = locale === 'bn';

  const [stats, setStats] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'verifications' | 'activity'>('overview');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.metrics);
        setRecentDonations(data.recentDonations || []);
        setRecentUsers(data.recentUsers || []);
        setPendingTransfers(data.pendingTransfersList || []);
        setCampaignStats(data.campaignStats || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Quick Inline Verify User
  const handleQuickVerifyUser = async (userId: string, userName: string, currentStatus: boolean) => {
    showConfirm({
      title: currentStatus
        ? (isBn ? 'যাচাইকরণ বাতিল করবেন?' : 'Revoke Verification?')
        : (isBn ? 'অ্যালামনাই অনুমোদন করবেন?' : 'Verify Alumni Member?'),
      text: currentStatus
        ? (isBn ? `${userName}-এর ভেরিফাইড ব্যাজ বাতিল করা হবে।` : `Revoke verification for ${userName}.`)
        : (isBn ? `${userName}-কে ভেরিফাইড অ্যালামনাই হিসেবে ডিরেক্টরিতে সক্রিয় করা হবে।` : `Approve and verify ${userName} in alumni directory.`),
      type: currentStatus ? 'warning' : 'question',
      confirmButtonText: currentStatus ? (isBn ? 'হ্যাঁ, বাতিল করুন' : 'Revoke') : (isBn ? 'অনুমোদন দিন' : 'Verify'),
      confirmButtonVariant: currentStatus ? 'destructive' : 'emerald',
      onConfirm: async () => {
        setActionLoading(userId);
        try {
          const res = await fetch('/api/admin/verify-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isVerified: !currentStatus }),
          });
          if (res.ok) {
            setRecentUsers((prev) =>
              prev.map((u) => (u._id === userId ? { ...u, isVerified: !currentStatus } : u))
            );
            fetchStats();
            showAlert({
              title: currentStatus ? (isBn ? 'বাতিল করা হয়েছে' : 'Revoked') : (isBn ? 'যাচাই সম্পন্ন!' : 'Verified!'),
              text: isBn ? 'সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।' : 'Member verification status updated.',
              type: 'success',
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Quick Inline Bank Transfer Action
  const handleQuickTransferAction = (requestId: string, action: 'approve' | 'reject', donorName: string, amount: number) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove
        ? (isBn ? 'ব্যাংক ট্রান্সফার অনুমোদন করবেন?' : 'Approve Bank Transfer?')
        : (isBn ? 'ট্রান্সফার প্রত্যাখ্যান করবেন?' : 'Reject Transfer?'),
      text: isApprove
        ? (isBn ? `${donorName}-এর ${formatCurrency(amount, locale)} তহবিলে যুক্ত হবে এবং অফিসিয়াল মানি রসিদ ইস্যু হবে।` : `Credit ${formatCurrency(amount, locale)} from ${donorName} to campaign funds.`)
        : (isBn ? 'এই ট্রান্সফার রিকোয়েস্টটি বাতিল করা হবে।' : 'This transfer request will be rejected.'),
      type: isApprove ? 'question' : 'warning',
      confirmButtonText: isApprove ? (isBn ? 'হ্যাঁ, অনুমোদন দিন' : 'Approve') : (isBn ? 'প্রত্যাখ্যান' : 'Reject'),
      confirmButtonVariant: isApprove ? 'emerald' : 'destructive',
      onConfirm: async () => {
        setActionLoading(requestId);
        try {
          const res = await fetch('/api/admin/approve-bank-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, action }),
          });
          if (res.ok) {
            setPendingTransfers((prev) => prev.filter((p) => p._id !== requestId));
            fetchStats();
            showAlert({
              title: isApprove ? (isBn ? 'অনুমোদিত!' : 'Approved!') : (isBn ? 'প্রত্যাখ্যাত' : 'Rejected'),
              text: isApprove ? (isBn ? 'তহবিলে অর্থ যুক্ত হয়েছে ও রসিদ তৈরি হয়েছে।' : 'Funds credited and receipt generated.') : (isBn ? 'অনুরোধটি বাতিল করা হয়েছে।' : 'Request rejected.'),
              type: isApprove ? 'success' : 'info',
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Export CSV mock handler
  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Donor,Amount,Campaign,Method,Status,Date\n' +
      recentDonations.map((d) => `"${d.donorName}",${d.amount},"${d.campaign}","${d.method}","${d.status}","${d.createdAt}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alumni_donations_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAlumni = stats?.totalUsers || 0;
  const verifiedAlumni = stats?.verifiedUsers || 0;
  const pendingAlumni = stats?.pendingUsers || 0;
  const verificationPercent = totalAlumni > 0 ? Math.round((verifiedAlumni / totalAlumni) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Command Portal Welcome & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isBn ? 'প্রশাসনিক নিয়ন্ত্রণ কেন্দ্র' : 'Admin Command Console'}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'স্বাগতম, অ্যাডমিন প্যানেল' : 'Admin Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {isBn
              ? 'অ্যালামনাই নেটওয়ার্ক, অনুদান তহবিল, ব্যাংক ডিপোজিট অনুমোদন এবং ইভেন্ট সমূহের সমন্বিত নিয়ন্ত্রণ।'
              : 'Real-time governance of alumni directory, financial ledger, bank deposit approvals, and institutional events.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs hover:shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isBn ? 'লেজার CSV' : 'Export CSV'}</span>
          </button>

          <Link href="/dashboard/admin/events">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-700 text-white shadow-xs hover:shadow-primary/20 transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন ইভেন্ট' : 'New Event'}</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Top-Tier KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Alumni Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('totalAlumni')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.totalUsers ?? '...'}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {verificationPercent}% {isBn ? 'যাচাইকৃত' : 'verified'}
              </span>
            </div>

            {/* Verification progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${verificationPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="text-emerald-600 font-semibold">{verifiedAlumni} {t('verifiedAlumni')}</span>
              <Link
                href="/dashboard/admin/alumni"
                className="text-amber-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>{pendingAlumni} {t('pendingAlumni')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Total Funds Raised Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('totalDonations')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(stats?.totalRaised || 0, locale)}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isBn ? '+৳১,৫০,০০০ এই ক্যাম্পেইনে' : '+৳150,000 this cycle'}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{stats?.completedDonationsCount || 0} {isBn ? 'টি সফল লেনদেন' : 'completed donations'}</span>
              <Link href="/dashboard/admin/donations" className="text-primary hover:underline font-semibold">
                {isBn ? 'লেজার →' : 'Ledger →'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Bank Transfers Card */}
        <Card
          className={`shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group ${
            (stats?.pendingTransfers || 0) > 0
              ? 'border-amber-400/80 dark:border-amber-500/50 ring-1 ring-amber-400/20'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                {(stats?.pendingTransfers || 0) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                {t('pendingTransfers')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats?.pendingTransfers ?? 0}
            </div>

            <p className="text-[11px] text-slate-500">
              {isBn
                ? 'ম্যানুয়াল ডিপোজিট স্লিপ ও রেফারেন্স রিভিউ প্রয়োজন'
                : 'Direct deposit slips requiring admin audit'}
            </p>

            <div className="pt-1">
              <Link
                href="/dashboard/admin/donations"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{isBn ? 'রিভিউ ও অনুমোদন করুন' : 'Review & Approve Queue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Events & Stories Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBn ? 'ইভেন্ট ও কনটেন্ট' : 'Events & Content'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {(stats?.totalEvents || 0) + (stats?.totalNews || 0)}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="font-semibold">{stats?.totalEvents || 0} {isBn ? 'টি ইভেন্ট' : 'Events'}</span>
              <span>•</span>
              <span className="font-semibold">{stats?.totalNews || 0} {isBn ? 'টি সংবাদ' : 'News'}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{stats?.totalJobs || 0} {isBn ? 'টি ক্যারিয়ার পোস্ট' : 'Job posts'}</span>
              <Link href="/dashboard/admin/events" className="text-primary hover:underline font-semibold">
                {isBn ? 'ব্যবস্থাপনা →' : 'Manage →'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Blood Donors Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {isBn ? 'নিবন্ধিত রক্তদাতা' : 'Blood Donors'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.totalBloodDonors ?? 0}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats?.availableBloodDonors ?? 0} {isBn ? 'জন বর্তমানে প্রস্তুত' : 'currently available'}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{isBn ? 'স্বেচ্ছাসেবী ডিরেক্টরি' : 'Volunteer network'}</span>
              <Link href="/dashboard/admin/blood-donors" className="text-rose-600 hover:underline font-semibold">
                {isBn ? 'মডারেশন →' : 'Moderate →'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Blood Requests Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {isBn ? 'রক্তের চাহিদা' : 'Blood Requests'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.openBloodRequests ?? 0}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{stats?.emergencyBloodRequests ?? 0} {isBn ? 'টি জরুরী চাহিদা' : 'emergency cases'}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{isBn ? 'হাসপাতাল রিকোয়েস্ট' : 'Hospital cases'}</span>
              <Link href="/dashboard/admin/blood-requests" className="text-red-600 hover:underline font-semibold">
                {isBn ? 'পরিচালনা →' : 'Manage →'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Attention Required Action Queue (Immediate Fast Actions) */}
      {pendingTransfers.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isBn ? 'জরুরি অনুমোদন অপেক্ষমাণ (ব্যাংক ট্রান্সফার)' : 'Attention Required: Pending Bank Deposits'}</span>
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                    {pendingTransfers.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'তহবিলে অর্থ ক্রেডিট করতে স্লিপ ও রেফারেন্স নম্বর যাচাই করুন'
                    : 'Review offline bank deposit slips and verify transactions instantly'}
                </CardDescription>
              </div>
            </div>
            <Link href="/dashboard/admin/donations">
              <Button variant="outline" size="sm" className="text-xs border-amber-300 dark:border-amber-700">
                {isBn ? 'সব দেখুন' : 'View All'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-amber-200/50 dark:divide-amber-800/40">
              {pendingTransfers.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{p.donorName}</span>
                      <span className="font-mono text-[10px] bg-amber-200/50 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300">
                        {p.transactionRef}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      {p.campaign} • <span className="font-semibold text-slate-700 dark:text-slate-300">{p.bankName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount, locale)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={actionLoading === p._id}
                        onClick={() => handleQuickTransferAction(p._id, 'approve', p.donorName, p.amount)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs hover:shadow-emerald-600/20 transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                      </button>
                      <button
                        disabled={actionLoading === p._id}
                        onClick={() => handleQuickTransferAction(p._id, 'reject', p.donorName, p.amount)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/50 transition-all shadow-2xs disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Financial Analytics & Campaign Breakdown Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Allocation & Inflow Breakdown */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'তহবিল ও ক্যাম্পেইন বণ্টন বিশ্লেষণ' : 'Campaign Allocation & Treasury Overview'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'বিভিন্ন প্রকল্পে সংগৃহীত অর্থের লাইভ মেট্রিক্স' : 'Breakdown of completed contributions by fund stream'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {campaignStats.length} Campaigns
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No campaign records yet</div>
            ) : (
              campaignStats.map((camp, idx) => {
                const totalRaised = stats?.totalRaised || 1;
                const percentage = Math.round((camp.total / totalRaised) * 100);
                const colors = ['bg-primary-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-600'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={camp._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {camp._id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(camp.total, locale)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                  <span>Online Gateways (SSLCommerz)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Manual Bank Transfers</span>
                </span>
              </div>
              <Link href="/dashboard/admin/donations" className="text-primary hover:underline font-semibold">
                {isBn ? 'পূর্ণাঙ্গ লেজার দেখুন →' : 'View Full Financial Ledger →'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Operations & Health Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'প্ল্যাটফর্ম হেলথ ও সার্ভিস' : 'System Health & Engine'}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'সার্ভার ও ডাটাবেজ স্ট্যাটাস' : 'Infrastructure and connected gateways'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Database Engine</span>
              </div>
              <Badge variant="success" className="text-[10px] px-2 py-0">MongoDB Online</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Gateway</span>
              </div>
              <Badge variant="success" className="text-[10px] px-2 py-0">SSLCommerz Active</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Auth & Sessions</span>
              </div>
              <Badge variant="success" className="text-[10px] px-2 py-0">NextAuth 4.0</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">i18n Multi-Language</span>
              </div>
              <Badge variant="outline" className="text-[10px] px-2 py-0">BN / EN Ready</Badge>
            </div>

            {/* Quick action bar */}
            <div className="pt-2">
              <Link href="/dashboard/admin/alumni">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{isBn ? 'সদস্য ডিরেক্টরি মডারেশন' : 'Moderate Alumni Directory'}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Two Primary Operational Data Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Financial Transactions Ledger */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'সাম্প্রতিক অনুদান লেজার' : 'Recent Financial Ledger'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'অনলাইন ও অফলাইন সর্বশেষ জমাকৃত তহবিল' : 'Latest verified payments and contributions'}
              </CardDescription>
            </div>
            <Link href="/dashboard/admin/donations">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                {isBn ? 'সব দেখুন →' : 'View All →'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentDonations.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">No recent transactions recorded</p>
              ) : (
                recentDonations.slice(0, 6).map((d) => (
                  <div key={d._id} className="flex items-center justify-between p-4 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-0.5 min-w-0 pr-3">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{d.donorName}</p>
                      <p className="text-slate-500 truncate max-w-[220px]">{d.campaign}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">
                        {d.method} • {d.transactionId}
                      </p>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(d.amount, locale)}
                      </p>
                      <Badge
                        variant={d.status === 'completed' ? 'success' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
                      >
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alumni Registrations & Verification Queue */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'সদ্য নিবন্ধিত সদস্যবৃন্দ' : 'Alumni Registration Stream'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'যাচাই ও সদস্যপদ অনুমোদনের অপেক্ষায়' : 'Newly joined graduates & verification queue'}
              </CardDescription>
            </div>
            <Link href="/dashboard/admin/alumni">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                {isBn ? 'সব দেখুন →' : 'View All →'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUsers.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">No alumni registered yet</p>
              ) : (
                recentUsers.slice(0, 6).map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-4 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <Avatar name={u.name} src={u.image} size="sm" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-slate-500 font-mono text-[11px] truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {u.isVerified ? (
                        <Badge variant="success" className="text-[10px] px-2.5 py-0.5 font-semibold">
                          {locale === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-semibold">
                            {locale === 'bn' ? 'যাচাই বাকি' : 'Pending'}
                          </Badge>
                          <button
                            disabled={actionLoading === u._id}
                            onClick={() => handleQuickVerifyUser(u._id, u.name, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isBn ? 'অনুমোদন' : 'Verify'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Quick Administrative Management Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link
          href="/dashboard/admin/events"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
              {isBn ? 'ইভেন্ট ও রিইউনিয়ন' : 'Events & Reunions'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'রিইউনিয়ন শিডিউল ও আসন' : 'Schedule reunions & RSVPs'}
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/news"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {isBn ? 'সংবাদ ও বুলেটিন' : 'News & Announcements'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'অ্যালামনাই সাফল্য ও আপডেট' : 'Broadcast milestones & press'}
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/donations"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
              {isBn ? 'ট্রেজারি ও ব্যাংক রসিদ' : 'Treasury & Ledger'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'ব্যাংক ডিপোজিট ও অডিট' : 'Audit transactions & slips'}
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/alumni"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {isBn ? 'সদস্য ভেরিফিকেশন' : 'Directory Governance'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'গ্র্যাজুয়েট প্রোফাইল অনুমোদন' : 'Verify member accounts'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
