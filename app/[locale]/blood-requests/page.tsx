'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { BloodRequestCard } from '@/components/blood-donation/BloodRequestCard';
import { BloodStatsBar } from '@/components/blood-donation/BloodStatsBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Droplet,
  Search,
  PlusCircle,
  AlertOctagon,
  HeartHandshake,
  Flame,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_REQUEST_URGENCIES, BLOOD_REQUEST_STATUSES } from '@/lib/types';

export default function BloodRequestsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('all');
  const [urgency, setUrgency] = useState('all');
  const [status, setStatus] = useState('all');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (bloodGroup && bloodGroup !== 'all') params.set('bloodGroup', bloodGroup);
      if (urgency && urgency !== 'all') params.set('urgency', urgency);
      if (status && status !== 'all') params.set('status', status);
      if (location) params.set('location', location);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/blood-requests?${params.toString()}`);
      const data = await res.json();

      if (data.requests) {
        setRequests(data.requests);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, bloodGroup, urgency, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const handleReset = () => {
    setSearch('');
    setBloodGroup('all');
    setUrgency('all');
    setStatus('all');
    setLocation('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl space-y-8 sm:space-y-10">
        {/* Header Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-900 via-rose-800 to-amber-900 text-white p-5 xs:p-8 sm:p-12 shadow-2xl border border-red-800/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-400/30 text-xs font-bold text-red-200 uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5 text-red-300 animate-pulse" />
              <span>{isBn ? 'জরুরী রক্তের চাহিদা বোর্ড' : 'Emergency Blood Requests'}</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isBn ? 'চলমান রক্তের চাহিদা সমূহ' : 'Active Blood Requests'}
            </h1>

            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed">
              {isBn
                ? 'আমাদের বিদ্যালয় পরিবার ও তাদের আত্মীয়দের জন্য জরুরী রক্তের প্রয়োজন হলে এখানে সরাসরি আবেদন করুন অথবা চলমান চাহিদাগুলোতে সাড়া দিয়ে জীবন বাঁচাতে এগিয়ে আসুন।'
                : 'View urgent and emergency blood requests from school alumni and their families. Find matching donors or post an emergency request for prompt assistance.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <Link href="/blood-requests/create" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-red-900 hover:bg-rose-50 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4 text-red-600" />
                  <span>{isBn ? 'নতুন রক্তের আবেদন তৈরি করুন' : 'Post Blood Request'}</span>
                </Button>
              </Link>
              <Link href="/blood-donors" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-bold rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Droplet className="w-4 h-4 text-rose-300 fill-current" />
                  <span>{isBn ? 'রক্তদাতা ডিরেক্টরি খুঁজুন' : 'Search Blood Donors'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Statistics */}
        <BloodStatsBar
          selectedBloodGroup={bloodGroup}
          onSelectBloodGroup={(bg) => {
            setBloodGroup(bg);
            setPage(1);
          }}
        />

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Query */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-10 rounded-2xl"
                  placeholder={isBn ? 'রোগী, হাসপাতাল বা জেলা...' : 'Search by patient, hospital, city...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Urgency Filter */}
              <div>
                <select
                  aria-label="Filter by Urgency"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  value={urgency}
                  onChange={(e) => {
                    setUrgency(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{isBn ? 'সকল জরুরী অবস্থা' : 'All Urgency Levels'}</option>
                  <option value="Emergency">{isBn ? '🚨 জরুরী (Emergency)' : '🚨 Emergency'}</option>
                  <option value="Urgent">{isBn ? '🔥 দ্রুত প্রয়োজন (Urgent)' : '🔥 Urgent'}</option>
                  <option value="Normal">{isBn ? 'সাধারণ (Normal)' : 'Normal'}</option>
                </select>
              </div>

              {/* Location Input */}
              <div>
                <Input
                  placeholder={isBn ? 'হাসপাতালের স্থান / জেলা' : 'Hospital location/city'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  aria-label="Filter by Request Status"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{isBn ? 'চলমান ও সকল স্ট্যাটাস' : 'Open / All Status'}</option>
                  <option value="Open">{isBn ? 'খোলা (Open)' : 'Open'}</option>
                  <option value="Accepted">{isBn ? 'গৃহীত (Accepted)' : 'Accepted'}</option>
                  <option value="Partially Fulfilled">{isBn ? 'আংশিক সম্পন্ন' : 'Partially Fulfilled'}</option>
                  <option value="Fulfilled">{isBn ? 'সম্পন্ন (Fulfilled)' : 'Fulfilled'}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                {isBn
                  ? `মোট ${totalCount} টি রক্তের আবেদন তালিকাভুক্ত রয়েছে`
                  : `Showing ${requests.length} of ${totalCount} blood requests`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
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

        {/* Blood Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isBn ? 'কোনো সক্রিয় রক্তের আবেদন নেই' : 'No active blood requests at the moment'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'এই ফিল্টারে কোনো অনুরোধ পাওয়া যায়নি। প্রয়োজনে নতুন আবেদন তৈরি করতে পারেন।'
                : 'No blood requests matching your filters. You can post a new request if needed.'}
            </p>
            <Link href="/blood-requests/create">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs mt-2">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>{isBn ? 'নতুন রক্তের আবেদন তৈরি করুন' : 'Post Blood Request'}</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <BloodRequestCard key={req._id} request={req} />
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
    </div>
  );
}
