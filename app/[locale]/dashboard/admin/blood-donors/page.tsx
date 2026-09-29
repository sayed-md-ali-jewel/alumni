'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Droplet,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { ALUMNI_GROUPS, BLOOD_GROUPS, DONATION_STATUSES } from '@/lib/types';

export default function AdminBloodDonorsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast } = useSweetAlert();

  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('all');
  const [group, setGroup] = useState('all');
  const [status, setStatus] = useState('all');

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (bloodGroup && bloodGroup !== 'all') params.set('bloodGroup', bloodGroup);
      if (group && group !== 'all') params.set('group', group);
      if (status && status !== 'all') params.set('status', status);

      const res = await fetch(`/api/admin/blood-donors?${params.toString()}`);
      const data = await res.json();
      if (data.donors) {
        setDonors(data.donors);
      }
    } catch (err) {
      console.error('Error fetching admin donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, group, status]);

  const handleToggleConsent = async (profileId: string, currentConsent: boolean) => {
    try {
      const res = await fetch('/api/admin/blood-donors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          bloodDonationConsent: !currentConsent,
        }),
      });
      if (!res.ok) throw new Error('Failed to update consent');

      setDonors((prev) =>
        prev.map((d) =>
          d._id === profileId ? { ...d, bloodDonationConsent: !currentConsent } : d
        )
      );
      showToast({
        title: isBn ? 'দৃশ্যমানতা আপডেট' : 'Visibility Updated',
        text: isBn
          ? `দাতার দৃশ্যমানতা ${!currentConsent ? 'সক্রিয়' : 'লুকানো'} করা হয়েছে`
          : `Donor visibility set to ${!currentConsent ? 'Visible' : 'Hidden'}`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message,
        type: 'error',
      });
    }
  };

  const handleStatusChange = async (profileId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/blood-donors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          donationStatus: newStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setDonors((prev) =>
        prev.map((d) => (d._id === profileId ? { ...d, donationStatus: newStatus } : d))
      );
      showToast({
        title: isBn ? 'সফল হয়েছে' : 'Success',
        text: isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
            <Droplet className="w-4 h-4 fill-current" />
            <span>{isBn ? 'রক্তদান প্রশাসন' : 'Blood Donation Governance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isBn ? 'রক্তদাতা মডারেশন ও ব্যবস্থাপনা' : 'Blood Donors Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn
              ? 'নিবন্ধিত রক্তদাতাদের প্রোফাইল, রক্তের গ্রুপ এবং দৃশ্যমানতা পর্যালোচনা ও পরিচালনা করুন।'
              : 'Review registered blood donors, verify blood groups, and manage moderation visibility.'}
          </p>
        </div>

        <Button
          onClick={fetchDonors}
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={isBn ? 'নাম বা অবস্থান...' : 'Search by name, location...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDonors()}
              className="pl-10 rounded-xl"
            />
          </div>

          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="all">{isBn ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>

          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">{isBn ? 'সকল গ্রুপ' : 'All Groups'}</option>
            {ALUMNI_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">{isBn ? 'সকল প্রাপ্যতা' : 'All Availability'}</option>
            {DONATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">{isBn ? 'রক্তদাতা' : 'Donor / Member'}</th>
                <th className="px-4 py-4">{isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}</th>
                <th className="px-4 py-4">{isBn ? 'গ্রুপ ও ব্যাচ' : 'Group & Batch'}</th>
                <th className="px-4 py-4">{isBn ? 'অবস্থান' : 'Location'}</th>
                <th className="px-4 py-4">{isBn ? 'প্রাপ্যতা স্ট্যাটাস' : 'Status'}</th>
                <th className="px-4 py-4">{isBn ? 'দৃশ্যমানতা' : 'Visibility'}</th>
                <th className="px-6 py-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>{isBn ? 'লোড হচ্ছে...' : 'Loading donors...'}</span>
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {isBn ? 'কোনো রক্তদাতা পাওয়া যায়নি' : 'No donors found'}
                  </td>
                </tr>
              ) : (
                donors.map((donor) => {
                  const user = donor.userId;
                  return (
                    <tr key={donor._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user?.image} fallback={user?.name || 'BD'} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {user?.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{user?.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-black text-xs inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                          <Droplet className="w-3 h-3 fill-current text-rose-500" />
                          <span>{donor.bloodGroup || 'O+'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {donor.group}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Batch {donor.batchYear}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {donor.donorLocation || donor.location || 'Chattogram, Bangladesh'}
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={donor.donationStatus}
                          onChange={(e) => handleStatusChange(donor._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            donor.donationStatus === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {DONATION_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={donor.bloodDonationConsent ? 'success' : 'secondary'}
                          className="text-[10px]"
                        >
                          {donor.bloodDonationConsent
                            ? (isBn ? 'সম্মতি প্রদানকৃত' : 'Consented')
                            : (isBn ? 'লুকানো' : 'Hidden')}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() =>
                            handleToggleConsent(donor._id, donor.bloodDonationConsent)
                          }
                          variant="outline"
                          size="sm"
                          className="text-[11px] rounded-xl"
                        >
                          {donor.bloodDonationConsent ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1 text-slate-400" />
                              <span>{isBn ? 'লুকান' : 'Hide'}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1 text-emerald-500" />
                              <span>{isBn ? 'দেখান' : 'Show'}</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
