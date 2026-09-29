'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CampaignModal } from '@/components/admin/CampaignModal';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  Layers,
  Star,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function AdminCampaignsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { data: session } = useSession();
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error('Error fetching campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = (campaign: any) => {
    const title = isBn ? campaign.title_bn : campaign.title_en;
    showConfirm({
      title: isBn ? 'ক্যাম্পেইন মুছে ফেলবেন?' : 'Delete Campaign?',
      text: isBn
        ? `"${title}" ক্যাম্পেইনটি স্থায়ীভাবে মুছে ফেলা হবে।`
        : `Permanently delete "${title}"? Existing donations will remain in the treasury ledger.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      confirmButtonVariant: 'destructive',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      onConfirm: async () => {
        setActionLoading(campaign._id);
        try {
          const res = await fetch(`/api/admin/campaigns/${campaign._id}`, {
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

          fetchCampaigns();
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

  const filteredCampaigns = campaigns.filter((c) => {
    const title = ((c.title_en || '') + ' ' + (c.title_bn || '')).toLowerCase();
    const desc = ((c.description_en || '') + ' ' + (c.description_bn || '')).toLowerCase();
    const matchesSearch = !searchQuery.trim() || title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalRaisedAcrossCampaigns = campaigns.reduce(
    (sum, c) => sum + (Number(c.liveRaised) || Number(c.raised) || 0),
    0
  );

  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Building2 className="w-4 h-4" />
            <span>{isBn ? 'এনডাউমেন্ট ও তহবিল ক্যাম্পেইন' : 'Endowment & Fundraising'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'ক্যাম্পেইন পরিচালনা কনসোল' : 'Campaigns Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'নতুন তহবিল ক্যাম্পেইন চালু করুন, অনুদানের লক্ষ্যমাত্রা ও সংগৃহীত অর্থ পর্যবেক্ষণ করুন'
              : 'Launch fundraising causes, manage scholarship and infrastructure campaigns'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            onClick={() => {
              setEditingCampaign(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-rose-600/20 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন ক্যাম্পেইন তৈরি' : 'Create Campaign'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchCampaigns}
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
            {isBn ? 'মোট ক্যাম্পেইন সংগ্রহ' : 'Total Raised (Live)'}
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRaisedAcrossCampaigns, locale)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'অনলাইন ও অফলাইন সফল অনুদান' : 'Across all verified causes'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isBn ? 'চলমান সক্রিয় ক্যাম্পেইন' : 'Active Campaigns'}
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {activeCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'পাবলিক পোর্টালে দৃশ্যমান' : 'Open for public contributions'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isBn ? 'সম্পন্ন / লক্ষ্যমাত্রাপ্রাপ্ত' : 'Completed Causes'}
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {completedCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'শতভাগ সফল ক্যাম্পেইন' : 'Target reached successfully'}
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {isBn ? 'অনুদান লেজার' : 'Treasury Ledger'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBn ? 'ক্যাম্পেইন ভিত্তিক সকল লেনদেন' : 'View specific donation entries'}
            </p>
          </div>
          <Link href="/dashboard/admin/donations" className="block mt-2">
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
              <span>{isBn ? 'অনুদান লেজার দেখুন' : 'Go to Donations'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Input
            placeholder={isBn ? 'ক্যাম্পেইন নাম বা বিবরণ খুঁজুন...' : 'Search campaigns by title or description...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
            <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
            <option value="paused">{isBn ? 'স্থগিত (Paused)' : 'Paused'}</option>
            <option value="draft">{isBn ? 'ড্রাফট (Draft)' : 'Draft'}</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Medical">Medical Relief</option>
            <option value="Relief">Emergency Relief</option>
            <option value="Endowment">Endowment Fund</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো ক্যাম্পেইন পাওয়া যায়নি' : 'No campaigns match your filters'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isBn ? 'নতুন ক্যাম্পেইন যোগ করতে উপরে বাটনে ক্লিক করুন।' : 'Click "+ Create Campaign" to launch a new cause.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const raised = Number(camp.liveRaised) || Number(camp.raised) || 0;
            const progress = Math.min(100, Math.round((raised / (camp.goal || 1)) * 100));

            return (
              <Card
                key={camp._id}
                className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900"
              >
                {/* Banner Image or Gradient */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {camp.image ? (
                    <img
                      src={camp.image}
                      alt={camp.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white">
                      <Building2 className="w-12 h-12 opacity-40" />
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {camp.category}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'active'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : camp.status === 'completed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {camp.status}
                  </span>

                  {camp.isFeatured && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors">
                      {isBn ? camp.title_bn : camp.title_en}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {isBn ? camp.description_bn : camp.description_en}
                    </p>
                  </div>

                  {/* Progress Bar & Amounts */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">
                          {isBn ? 'সংগৃহীত' : 'Raised'}
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                          {formatCurrency(raised, locale)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">
                          {isBn ? 'লক্ষ্য' : 'Goal'}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {formatCurrency(camp.goal, locale)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {progress}% {isBn ? 'সম্পূর্ণ' : 'Funded'}
                      </span>
                      <span>
                        {camp.uniqueDonorsCount || camp.donorCount || 0} {isBn ? 'জন দাতা' : 'Donors'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/donate`}
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 font-semibold flex items-center gap-1"
                  >
                    <span>{isBn ? 'পাবলিক পেজ' : 'Public Page'}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCampaign(camp);
                        setIsModalOpen(true);
                      }}
                      className="rounded-xl text-xs h-8 px-2.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                      <span>{isBn ? 'এডিট' : 'Edit'}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCampaign(camp)}
                      className="rounded-xl text-xs h-8 px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CampaignModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCampaign(null);
          }}
          initialData={editingCampaign}
          onSuccess={fetchCampaigns}
        />
      )}
    </div>
  );
}
