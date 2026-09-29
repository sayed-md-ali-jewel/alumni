'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { BloodDonorCard } from '@/components/blood-donation/BloodDonorCard';
import { ContactDonorModal } from '@/components/blood-donation/ContactDonorModal';
import { BloodStatsBar } from '@/components/blood-donation/BloodStatsBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Droplet,
  Search,
  Filter,
  Heart,
  PlusCircle,
  Users,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ALUMNI_GROUPS, BLOOD_GROUPS, DONATION_STATUSES } from '@/lib/types';

export default function BloodDonorsPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('all');
  const [group, setGroup] = useState('all');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);

  const [activeContactDonor, setActiveContactDonor] = useState<any>(null);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (bloodGroup && bloodGroup !== 'all') params.set('bloodGroup', bloodGroup);
      if (group && group !== 'all') params.set('group', group);
      if (location) params.set('location', location);
      if (availability && availability !== 'all') params.set('availability', availability);
      if (currentUserId) params.set('excludeUserId', currentUserId);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/blood-donors?${params.toString()}`);
      const data = await res.json();

      if (data.donors) {
        const filtered = currentUserId
          ? data.donors.filter((d: any) => {
              const donorUid = d.userId?._id?.toString() || d.userId?.toString();
              const donorPid = d._id?.toString();
              return donorUid !== currentUserId.toString() && donorPid !== currentUserId.toString();
            })
          : data.donors;
        setDonors(filtered);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalDonors(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [page, bloodGroup, group, availability, currentUserId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setBloodGroup('all');
    setGroup('all');
    setLocation('');
    setAvailability('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-900 via-red-800 to-rose-700 text-white p-8 sm:p-12 shadow-2xl border border-rose-700/50">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-rose-200">
              <Droplet className="w-3.5 h-3.5 fill-current text-rose-300 animate-pulse" />
              <span>{isBn ? 'জীবন বাঁচানোর ব্রতে স্কুল অ্যালামনাই ব্লাড ব্যাংক' : 'School Alumni Blood Network'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isBn ? 'রক্তদাতা ডিরেক্টরি' : 'Alumni Blood Donors'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed">
              {isBn
                ? 'আমাদের বিদ্যালয়ের প্রাক্তন শিক্ষার্থীরা পরস্পরের আপদকালীন সহায়তায় একতাবদ্ধ। রক্তের গ্রুপের ভিত্তিতে দ্রুত উপযুক্ত দাতা খুঁজে নিন অথবা নিজে রক্তদাতা হিসেবে তালিকাভুক্ত হন।'
                : 'Connect with fellow school alumni who have pledged to donate blood. Search verified donors by blood group, group, and district, or register yourself to save lives.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/blood-requests/create">
                <Button className="bg-white text-rose-900 hover:bg-rose-50 font-bold rounded-2xl shadow-lg flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-rose-600" />
                  <span>{isBn ? 'রক্তের আবেদন করুন' : 'Post Blood Request'}</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-bold rounded-2xl flex items-center gap-2 backdrop-blur-sm"
                >
                  <Heart className="w-4 h-4 text-rose-300 fill-current" />
                  <span>{isBn ? 'রক্তদাতা হিসেবে যুক্ত হোন' : 'Become a Blood Donor'}</span>
                </Button>
              </Link>
              <Link href="/blood-requests">
                <Button
                  variant="ghost"
                  className="text-rose-100 hover:text-white hover:bg-white/10 font-medium rounded-2xl"
                >
                  {isBn ? 'চলমান রক্তের চাহিদা সমূহ →' : 'View Active Requests →'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Stats Bar & Quick Filter */}
        <BloodStatsBar
          selectedBloodGroup={bloodGroup}
          onSelectBloodGroup={(bg) => {
            setBloodGroup(bg);
            setPage(1);
          }}
          selectedAvailability={availability}
          onSelectAvailability={(avail) => {
            setAvailability(avail);
            setPage(1);
          }}
        />

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Search Query */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-10 rounded-2xl"
                  placeholder={isBn ? 'নাম বা অবস্থান দিয়ে খুঁজুন...' : 'Search by name, city...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Blood Group Filter */}
              <div>
                <select
                  aria-label="Filter by Blood Group"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 font-bold"
                  value={bloodGroup}
                  onChange={(e) => {
                    setBloodGroup(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{isBn ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <select
                  aria-label="Filter by Availability"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 font-semibold"
                  value={availability}
                  onChange={(e) => {
                    setAvailability(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{isBn ? 'সকল প্রাপ্যতা স্থিতি' : 'All Availability'}</option>
                  <option value="available">{isBn ? '🟢 রক্তদানে প্রস্তুত (Available)' : '🟢 Ready to Donate (Available)'}</option>
                  <option value="resting">{isBn ? '🟡 বিশ্রামকালীন (Resting)' : '🟡 Resting (Recently Donated)'}</option>
                </select>
              </div>

              {/* Group Filter */}
              <div>
                <select
                  aria-label="Filter by Group"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  value={group}
                  onChange={(e) => {
                    setGroup(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{isBn ? 'সকল গ্রুপ' : 'All Groups'}</option>
                  {ALUMNI_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <Input
                  placeholder={isBn ? 'জেলা / শহর (যেমন: চট্টগ্রাম)' : 'City/District (e.g. Chattogram)'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2 text-xs">
              {/* Quick Status View Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAvailability('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all text-xs ${
                    availability === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isBn ? `সকল রক্তদাতা (${totalDonors})` : `All Donors (${totalDonors})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvailability('available');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                    availability === 'available'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isBn ? 'রক্তদানে প্রস্তুত' : 'Available to Donate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvailability('resting');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                    availability === 'resting'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{isBn ? 'বিশ্রামকালীন (সম্প্রতি রক্তদান)' : 'Recently Donated (Resting)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </Button>
                <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs">
                  <Search className="w-3.5 h-3.5 mr-1" />
                  <span>{isBn ? 'অনুসন্ধান' : 'Search'}</span>
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Donors Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isBn ? 'কোনো রক্তদাতা খুঁজে পাওয়া যায়নি' : 'No blood donors found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'অনুগ্রহ করে ফিল্টার পরিবর্তন করুন অথবা আপনি যদি এই গ্রুপের রক্তদাতা হন, তবে প্রোফাইল থেকে তালিকাভুক্ত হোন।'
                : 'Try changing your blood group, location, or availability filters. Or register as a donor if you are willing to help.'}
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="rounded-2xl text-xs"
            >
              {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Reset all filters'}
            </Button>
          </div>
        ) : availability === 'all' && donors.some((d) => d.isAvailable) && donors.some((d) => !d.isAvailable) ? (
          /* Segmented View: Available vs Recently Donated */
          <div className="space-y-10">
            {/* 1. Available to Donate Section */}
            {donors.filter((d) => d.isAvailable).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-950/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {isBn ? '🟢 রক্তদানে প্রস্তুত রক্তদাতাগণ' : '🟢 Ready & Available to Donate'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      {donors.filter((d) => d.isAvailable).length} {isBn ? 'জন প্রস্তুত' : 'Donors Ready'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {isBn ? 'জরুরী প্রয়োজনে সরাসরি যোগাযোগ করুন' : 'Contact immediately for hospital emergencies'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {donors
                    .filter((d) => d.isAvailable)
                    .map((donor) => (
                      <BloodDonorCard
                        key={donor._id}
                        donor={donor}
                        onContact={(d) => setActiveContactDonor(d)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 2. Recently Donated / Resting Section */}
            {donors.filter((d) => !d.isAvailable).length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-950/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {isBn ? '🟡 সম্প্রতি রক্তদান করেছেন — বিশ্রামে রয়েছেন' : '🟡 Recently Donated — Resting Period Active'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      {donors.filter((d) => !d.isAvailable).length} {isBn ? 'জন বিশ্রামে' : 'Donors in Recovery'}
                    </span>
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    {isBn
                      ? 'রক্তদানের পর ৩ মাস বাধ্যতামূলক বিশ্রামের সময়কাল চলছে'
                      : '3-month mandatory recovery period after blood donation'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {donors
                    .filter((d) => !d.isAvailable)
                    .map((donor) => (
                      <BloodDonorCard
                        key={donor._id}
                        donor={donor}
                        onContact={(d) => setActiveContactDonor(d)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard / Filtered Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donors.map((donor) => (
              <BloodDonorCard
                key={donor._id}
                donor={donor}
                onContact={(d) => setActiveContactDonor(d)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl"
            >
              {isBn ? 'পূর্ববর্তী' : 'Previous'}
            </Button>
            <span className="text-xs text-slate-600 dark:text-slate-400 px-3">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl"
            >
              {isBn ? 'পরবর্তী' : 'Next'}
            </Button>
          </div>
        )}
      </div>

      {/* Contact Donor Modal */}
      {activeContactDonor && (
        <ContactDonorModal
          donor={activeContactDonor}
          isOpen={!!activeContactDonor}
          onClose={() => setActiveContactDonor(null)}
        />
      )}
    </div>
  );
}
