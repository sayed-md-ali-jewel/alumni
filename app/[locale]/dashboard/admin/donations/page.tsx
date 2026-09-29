'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DonationModal } from '@/components/admin/DonationModal';
import { DonationReceiptModal } from '@/components/admin/DonationReceiptModal';
import { CampaignModal } from '@/components/admin/CampaignModal';
import {
  HeartHandshake,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Check,
  X,
  RefreshCw,
  Download,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Search,
  Receipt,
  Layers,
  Sparkles,
  PieChart,
  Users,
  ChevronDown,
  ChevronUp,
  Banknote,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function AdminDonationsPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const isBn = locale === 'bn';

  const [donations, setDonations] = useState<any[]>([]);
  const [bankTransfers, setBankTransfers] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);
  const [methodStats, setMethodStats] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<'campaigns' | 'all' | 'pending_transfers' | 'methods'>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');

  // Expanded campaigns in Campaign-wise tab
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any | null>(null);
  const [activeReceiptDonation, setActiveReceiptDonation] = useState<any | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCampaignFilter !== 'all') queryParams.set('campaign', selectedCampaignFilter);
      if (selectedStatusFilter !== 'all') queryParams.set('status', selectedStatusFilter);
      if (selectedMethodFilter !== 'all') queryParams.set('method', selectedMethodFilter);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const [resDonations, resStats] = await Promise.all([
        fetch(`/api/admin/donations?${queryParams.toString()}`),
        fetch('/api/admin/stats'),
      ]);

      if (resDonations.ok) {
        const donationData = await resDonations.json();
        setDonations(donationData.donations || []);
        setCampaignStats(donationData.campaignStats || []);
        setMethodStats(donationData.methodStats || []);
        setSummary(donationData.summary || null);
      }

      if (resStats.ok) {
        const statsData = await resStats.json();
        setBankTransfers(statsData.allBankTransfers || statsData.pendingTransfersList || []);
      }
    } catch (e) {
      console.error('Error fetching admin donation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampaignFilter, selectedStatusFilter, selectedMethodFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uniqueCampaignNames = useMemo(() => {
    return campaignStats.map((c) => c.campaign).filter(Boolean);
  }, [campaignStats]);

  // Delete Donation
  const handleDeleteDonation = (donation: any) => {
    showConfirm({
      title: isBn ? 'অনুদান রেকর্ড মুছে ফেলবেন?' : 'Delete Donation Record?',
      text: isBn
        ? `${donation.donorName}-এর ${formatCurrency(donation.amount, locale)} অনুদানের রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে।`
        : `Permanently delete ${formatCurrency(donation.amount, locale)} donation from ${donation.donorName}? This cannot be undone.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      confirmButtonVariant: 'destructive',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      onConfirm: async () => {
        setActionLoading(donation._id);
        try {
          const res = await fetch(`/api/admin/donations/${donation._id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete donation');
          }

          showToast({
            title: isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted',
            text: isBn ? 'অনুদান রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।' : 'Donation record has been removed.',
            type: 'success',
          });

          fetchData();
        } catch (e: any) {
          console.error(e);
          showAlert({
            title: isBn ? 'ত্রুটি' : 'Error',
            text: e.message || 'Failed to delete donation',
            type: 'error',
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Delete Campaign
  const handleDeleteCampaign = (campaignDoc: any, campaignName: string) => {
    const campaignId = campaignDoc?._id || campaignDoc?.id;
    if (!campaignId) {
      showToast({
        title: isBn ? 'ক্যাম্পেইন আইডি পাওয়া যায়নি' : 'Campaign ID not found',
        type: 'error',
      });
      return;
    }
    const title = isBn ? (campaignDoc.title_bn || campaignName) : (campaignDoc.title_en || campaignName);
    showConfirm({
      title: isBn ? 'ক্যাম্পেইন মুছে ফেলবেন?' : 'Delete Campaign?',
      text: isBn
        ? `"${title}" ক্যাম্পেইনটি স্থায়ীভাবে মুছে ফেলা হবে। পূর্বে প্রাপ্ত অনুদান রেকর্ড লেজারে অপরিবর্তিত থাকবে।`
        : `Permanently delete "${title}"? Existing donation records in the ledger will remain preserved.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      confirmButtonVariant: 'destructive',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      onConfirm: async () => {
        setActionLoading(`camp-${campaignId}`);
        try {
          const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete campaign');
          }

          showToast({
            title: isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted',
            text: isBn ? 'ক্যাম্পেইন সফলভাবে মুছে ফেলা হয়েছে।' : 'Campaign has been removed.',
            type: 'success',
          });

          fetchData();
        } catch (e: any) {
          console.error(e);
          showAlert({
            title: isBn ? 'ত্রুটি' : 'Error',
            text: e.message || 'Failed to delete campaign',
            type: 'error',
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Toggle Campaign Accordion
  const toggleCampaignAccordion = (campaignName: string) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignName]: !prev[campaignName],
    }));
  };

  // Bank Transfer actions
  const handleTransferAction = (requestId: string, action: 'approve' | 'reject', donorName: string, amount: number) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove
        ? (isBn ? 'ব্যাংক ট্রান্সফার অনুমোদন করবেন?' : 'Approve Bank Transfer?')
        : (isBn ? 'ট্রান্সফার প্রত্যাখ্যান করবেন?' : 'Reject Transfer?'),
      text: isApprove
        ? (isBn ? `${donorName}-এর ${formatCurrency(amount, locale)} তহবিলে যুক্ত হবে এবং অফিসিয়াল মানি রসিদ তৈরি হবে।` : `Credit ${formatCurrency(amount, locale)} to campaign and generate official receipt for ${donorName}.`)
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
            fetchData();
            showAlert({
              title: isApprove ? (isBn ? 'অনুমোদিত!' : 'Approved!') : (isBn ? 'প্রত্যাখ্যাত' : 'Rejected'),
              text: isApprove
                ? (isBn ? 'তহবিলে অর্থ সফলভাবে যুক্ত হয়েছে।' : 'Funds credited to campaign.')
                : (isBn ? 'অনুরোধটি বাতিল করা হয়েছে।' : 'Request rejected.'),
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

  // Quick Donation Status Approval
  const handleDonationAction = (donationId: string, action: 'approve' | 'reject', donorName: string, amount: number) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove
        ? (isBn ? 'অনুদান যাচাই ও অনুমোদন করবেন?' : 'Verify & Approve Donation?')
        : (isBn ? 'অনুদান বাতিল করবেন?' : 'Reject Donation?'),
      text: isApprove
        ? (isBn ? `${donorName}-এর ${formatCurrency(amount, locale)} তহবিলে যুক্ত হবে এবং অনুদান সম্পূর্ণ হিসেবে গণ্য হবে।` : `Credit ${formatCurrency(amount, locale)} to campaign and mark donation as completed.`)
        : (isBn ? 'এই অনুদান রেকর্ডটি বাতিল করা হবে।' : 'This donation record will be marked cancelled.'),
      type: isApprove ? 'question' : 'warning',
      confirmButtonText: isApprove ? (isBn ? 'হ্যাঁ, অনুমোদন দিন' : 'Approve') : (isBn ? 'বাতিল' : 'Reject'),
      confirmButtonVariant: isApprove ? 'emerald' : 'destructive',
      onConfirm: async () => {
        setActionLoading(donationId);
        try {
          const res = await fetch('/api/admin/approve-donation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donationId, action }),
          });

          if (res.ok) {
            fetchData();
            showAlert({
              title: isApprove ? (isBn ? 'অনুমোদিত!' : 'Approved!') : (isBn ? 'বাতিল করা হয়েছে' : 'Cancelled'),
              text: isApprove
                ? (isBn ? 'অনুদানের অর্থ সফলভাবে যাচাই ও যুক্ত হয়েছে।' : 'Donation verified successfully.')
                : (isBn ? 'অনুরোধটি বাতিল করা হয়েছে।' : 'Donation record cancelled.'),
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

  const pendingTransfers = bankTransfers.filter((b) => b.status === 'pending_review');

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Donor Name,Email,Phone,Amount,Campaign,Method,Transaction ID,Receipt Number,Status,Date\n' +
      donations
        .map(
          (d) =>
            `"${d.donorName}","${d.donorEmail}","${d.donorPhone || ''}",${d.amount},"${d.campaign}","${d.method}","${d.transactionId}","${d.receiptNumber || ''}","${d.status}","${d.createdAt}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alumni_donations_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <HeartHandshake className="w-4 h-4" />
            <span>{isBn ? 'ট্রেজারি ও অনুদান ব্যবস্থাপনা' : 'Treasury & Donation Management'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'অনুদান ও তহবিল কনসোল' : 'Donation & Campaign Ledger'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'ক্যাম্পেইন অনুযায়ী অনুদান বিশ্লেষণ, নতুন অনুদান রেকর্ড তৈরি, সম্পাদন ও ডিজিটাল মানি রসিদ ট্র্যাকিং'
              : 'Audit campaign collections, add/edit donation entries, verify deposits, and generate money receipts'}
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            onClick={() => {
              setEditingCampaign(null);
              setIsCampaignModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-emerald-600/20 py-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBn ? 'নতুন ক্যাম্পেইন তৈরি' : 'Create Campaign'}</span>
          </Button>

          <Button
            onClick={() => {
              setEditingDonation(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-rose-600/20 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন অনুদান রেকর্ড' : 'Add Donation'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="rounded-xl text-xs gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isBn ? 'সর্বমোট সংগৃহীত তহবিল' : 'Total Treasury Raised'}
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(summary?.totalRaised || 0, locale)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary?.completedCount || 0} {isBn ? 'টি অনুমোদিত অনুদান' : 'completed contributions'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isBn ? 'সক্রিয় ক্যাম্পেইন সংখ্যা' : 'Active Campaigns'}
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {campaignStats.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'তহবিল ও এনডাউমেন্ট খাত' : 'distinct endowment funds'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isBn ? 'অপেক্ষমাণ ব্যাংক রিভিউ' : 'Pending Verification'}
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingTransfers.length + (summary?.pendingCount || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'যাচাইয়ের অপেক্ষায় রয়েছে' : 'awaiting admin verification'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {isBn ? 'লেজার ডাউনলোড' : 'Financial Ledger'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBn ? 'সকল অনুদানের এক্সেল স্প্রেডশিট' : 'Export full CSV spreadsheet'}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isBn ? 'ডাউনলোড (CSV)' : 'Download Ledger CSV'}</span>
          </button>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'campaigns'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? 'ক্যাম্পেইন অনুযায়ী অনুদান' : 'Campaign-Wise Breakdown'}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            {campaignStats.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{isBn ? 'সকল অনুদান লেজার' : 'All Donations Ledger'}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {donations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending_transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending_transfers'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isBn ? 'পেন্ডিং ব্যাংক ট্রান্সফার' : 'Pending Deposits'}</span>
          {pendingTransfers.length > 0 && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                activeTab === 'pending_transfers' ? 'bg-amber-600 text-white' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              {pendingTransfers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('methods')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ml-auto ${
            activeTab === 'methods'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>{isBn ? 'পদ্ধতি ও বিতরণ' : 'Method Breakdown'}</span>
        </button>
      </div>

      {/* Tab 1: Campaign-Wise Breakdown (Donation Showing Donation Wise) */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {campaignStats.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {isBn ? 'কোনো ক্যাম্পেইনে অনুদান পাওয়া যায়নি' : 'No campaign donations recorded yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'প্রথম অনুদান রেকর্ড করতে উপরে বাটনে ক্লিক করুন।' : 'Click "+ Add Donation" to record the first contribution.'}
              </p>
            </Card>
          ) : (
            campaignStats.map((c) => {
              const isExpanded = expandedCampaigns[c.campaign];
              const campaignDonations = donations.filter((d) => d.campaign === c.campaign);
              const percentageOfTotal =
                summary?.totalRaised > 0
                  ? Math.round((c.totalRaised / summary.totalRaised) * 100)
                  : 0;

              return (
                <Card
                  key={c.campaign}
                  className="rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden"
                >
                  {/* Campaign Header Bar */}
                  <div
                    onClick={() => toggleCampaignAccordion(c.campaign)}
                    className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-rose-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20 mt-0.5">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                            {c.campaign}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                            {c.allCount} {isBn ? 'টি এন্ট্রি' : 'Donations'}
                          </span>
                          {c.category && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                              {c.category}
                            </span>
                          )}
                          {c.status && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                c.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {c.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {c.uniqueDonorsCount} {isBn ? 'জন অনন্য কৃতি দাতা' : 'unique alumni donors'} • {isBn ? 'গড় অনুদান:' : 'Average:'} {formatCurrency(c.avgAmount, locale)}
                          {c.goal ? ` • ${isBn ? 'লক্ষ্যমাত্রা:' : 'Goal:'} ${formatCurrency(c.goal, locale)}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Progress Pill */}
                    <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">
                          {isBn ? 'মোট সংগ্রহ' : 'Total Raised'}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(c.totalRaised, locale)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {percentageOfTotal}% {isBn ? 'সামগ্রিক তহবিলের অংশ' : 'of all treasury funds'}
                        </span>
                      </div>

                      {/* Action buttons (Edit / Delete / Expand) */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {c.campaignDoc && (
                          <>
                            <button
                              type="button"
                              title={isBn ? 'ক্যাম্পেইন সম্পাদনা' : 'Edit Campaign'}
                              onClick={() => {
                                setEditingCampaign(c.campaignDoc);
                                setIsCampaignModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title={isBn ? 'ক্যাম্পেইন মুছুন' : 'Delete Campaign'}
                              disabled={actionLoading === `camp-${c.campaignDoc._id}`}
                              onClick={() => handleDeleteCampaign(c.campaignDoc, c.campaign)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleCampaignAccordion(c.campaign)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Campaign Donor Table */}
                  {isExpanded && (
                    <div className="p-0 animate-in fade-in-50 duration-200">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-4">{isBn ? 'দাতার নাম ও যোগাযোগ' : 'Donor & Contact'}</th>
                              <th className="p-4">{isBn ? 'পরিমাণ (BDT)' : 'Amount'}</th>
                              <th className="p-4">{isBn ? 'পেমেন্ট পদ্ধতি ও TrxID' : 'Method & TrxID'}</th>
                              <th className="p-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                              <th className="p-4">{isBn ? 'তারিখ' : 'Date'}</th>
                              <th className="p-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                            {campaignDonations.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                                  {isBn ? 'এই ফিল্টারে কোনো অনুদান পাওয়া যায়নি' : 'No donations match current filter under this campaign'}
                                </td>
                              </tr>
                            ) : (
                              campaignDonations.map((d) => (
                                <tr key={d._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="p-4">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {d.isAnonymous ? `${d.donorName} (Anonymous)` : d.donorName}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono">{d.donorEmail}</p>
                                    {d.donorPhone && (
                                      <p className="text-[11px] text-slate-400 font-mono">{d.donorPhone}</p>
                                    )}
                                  </td>

                                  <td className="p-4">
                                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                      {formatCurrency(d.amount, locale)}
                                    </span>
                                  </td>

                                  <td className="p-4">
                                    <span className="font-semibold uppercase text-[11px] text-slate-700 dark:text-slate-300 block">
                                      {d.method}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px] block">
                                      {d.transactionId}
                                    </span>
                                  </td>

                                  <td className="p-4">
                                    <Badge
                                      variant={
                                        d.status === 'completed'
                                          ? 'success'
                                          : d.status === 'pending'
                                          ? 'warning'
                                          : 'destructive'
                                      }
                                      className="text-[10px] uppercase px-2 py-0.5 font-bold"
                                    >
                                      {d.status === 'pending' ? (isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Pending') : d.status}
                                    </Badge>
                                  </td>

                                  <td className="p-4 text-xs text-slate-500">
                                    {formatDate(d.paidAt || d.createdAt, locale)}
                                  </td>

                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Receipt Voucher Button */}
                                      {d.status === 'completed' && (
                                        <button
                                          onClick={() => setActiveReceiptDonation(d)}
                                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                                          title={isBn ? 'মানি রসিদ দেখুন' : 'View Money Receipt'}
                                        >
                                          <Receipt className="w-3.5 h-3.5 text-primary" />
                                        </button>
                                      )}

                                      {/* Edit Button */}
                                      <button
                                        onClick={() => {
                                          setEditingDonation(d);
                                          setIsCreateModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                                        title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete Button */}
                                      <button
                                        onClick={() => handleDeleteDonation(d)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
                                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: All Donations Ledger Table View */}
      {activeTab === 'all' && (
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Input
                placeholder={isBn ? 'দাতার নাম, ইমেইল, ফোন, TrxID বা রসিদ...' : 'Search by name, email, TrxID, receipt...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Campaign Filter */}
              <select
                value={selectedCampaignFilter}
                onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="all">{isBn ? 'সকল ক্যাম্পেইন' : 'All Campaigns'}</option>
                {uniqueCampaignNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                <option value="completed">{isBn ? 'অনুমোদিত / সম্পন্ন' : 'Completed'}</option>
                <option value="pending">{isBn ? 'প্রক্রিয়াধীন' : 'Pending'}</option>
                <option value="cancelled">{isBn ? 'বাতিল' : 'Cancelled'}</option>
              </select>

              {/* Method Filter */}
              <select
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="all">{isBn ? 'সকল পেমেন্ট মাধ্যম' : 'All Methods'}</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">{isBn ? 'দাতার বিবরণ' : 'Donor Details'}</th>
                  <th className="p-4">{isBn ? 'ক্যাম্পেইন / তহবিল' : 'Campaign Fund'}</th>
                  <th className="p-4">{isBn ? 'পরিমাণ (BDT)' : 'Amount'}</th>
                  <th className="p-4">{isBn ? 'পদ্ধতি ও TrxID' : 'Method & TrxID'}</th>
                  <th className="p-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="p-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                        <span>{common('loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      {isBn ? 'কোনো অনুদান রেকর্ড পাওয়া যায়নি' : 'No donation records match the selected filters'}
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {d.isAnonymous ? `${d.donorName} (Anonymous)` : d.donorName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{d.donorEmail}</p>
                        {d.donorPhone && <p className="text-[11px] text-slate-400 font-mono">{d.donorPhone}</p>}
                      </td>

                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 max-w-xs">
                        {d.campaign}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(d.amount, locale)}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold uppercase text-[11px] text-slate-700 dark:text-slate-300">
                          {d.method}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                          {d.transactionId}
                        </p>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              d.status === 'completed'
                                ? 'success'
                                : d.status === 'pending'
                                ? 'warning'
                                : 'destructive'
                            }
                            className="text-[10px] uppercase px-2 py-0.5 font-bold"
                          >
                            {d.status === 'pending' ? (isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Pending') : d.status}
                          </Badge>

                          {d.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <button
                                disabled={actionLoading === d._id}
                                onClick={() => handleDonationAction(d._id, 'approve', d.donorName, d.amount)}
                                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                                title={isBn ? 'অনুমোদন করুন' : 'Approve'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={actionLoading === d._id}
                                onClick={() => handleDonationAction(d._id, 'reject', d.donorName, d.amount)}
                                className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80 transition-all disabled:opacity-50"
                                title={isBn ? 'বাতিল করুন' : 'Reject'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-500">
                        {formatDate(d.paidAt || d.createdAt, locale)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receipt Voucher Button */}
                          {d.status === 'completed' && (
                            <button
                              onClick={() => setActiveReceiptDonation(d)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                              title={isBn ? 'মানি রসিদ দেখুন' : 'View Money Receipt'}
                            >
                              <Receipt className="w-3.5 h-3.5 text-primary" />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingDonation(d);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                            title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteDonation(d)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
                            title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Pending Bank Transfers Review Tab */}
      {activeTab === 'pending_transfers' && (
        <Card className="border-amber-300 dark:border-amber-500/40 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-amber-500/5 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{isBn ? 'অপেক্ষমাণ ব্যাংক ট্রান্সফার তালিকা' : 'Pending Bank Transfers Queue'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn ? 'স্লিপ ও রেফারেন্স নম্বর মিলিয়ে অনুমোদন করুন' : 'Verify bank receipts and credit donation campaigns'}
              </CardDescription>
            </div>
          </CardHeader>
          <div className="p-0">
            {pendingTransfers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {isBn ? 'কোনো অপেক্ষমাণ ব্যাংক ট্রান্সফার নেই!' : 'No pending bank transfers in the queue!'}
                </p>
                <p className="text-xs text-slate-400 mt-1">All offline bank deposits have been verified.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingTransfers.map((p) => (
                  <div key={p._id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{p.donorName}</p>
                        <Badge variant="warning" className="text-[10px] px-2 py-0">Pending Review</Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        {p.donorEmail} • {p.donorPhone}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Campaign: <span className="text-primary">{p.campaign}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Bank: {p.bankName}
                        </span>
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400">
                          Ref: {p.transactionRef}
                        </span>
                        {p.screenshotUrl && (
                          <a
                            href={p.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>View Deposit Slip</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-slate-400 block">Amount</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.amount, locale)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoading === p._id}
                          onClick={() => handleTransferAction(p._id, 'approve', p.donorName, p.amount)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs hover:shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                        </button>
                        <button
                          disabled={actionLoading === p._id}
                          onClick={() => handleTransferAction(p._id, 'reject', p.donorName, p.amount)}
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
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Method-Wise Summary */}
      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in-50 duration-200">
          {methodStats.map((m) => (
            <Card key={m.method} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  {m.method}
                </span>
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {formatCurrency(m.total, locale)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {m.count} {isBn ? 'টি লেনদেন সম্পন্ন' : 'total transactions'}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Donation Modal */}
      {isCreateModalOpen && (
        <DonationModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingDonation(null);
          }}
          initialData={editingDonation}
          campaignsList={uniqueCampaignNames}
          onSuccess={fetchData}
        />
      )}

      {/* Create / Edit Campaign Modal */}
      {isCampaignModalOpen && (
        <CampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => {
            setIsCampaignModalOpen(false);
            setEditingCampaign(null);
          }}
          initialData={editingCampaign}
          onSuccess={fetchData}
        />
      )}

      {/* Official Receipt Voucher Modal */}
      {activeReceiptDonation && (
        <DonationReceiptModal
          isOpen={!!activeReceiptDonation}
          onClose={() => setActiveReceiptDonation(null)}
          donation={activeReceiptDonation}
        />
      )}
    </div>
  );
}
