'use client';

import React, { useEffect, useState } from 'react';
import { Droplet, Heart, Users, Activity, Clock, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLocale } from 'next-intl';

interface BloodStatsBarProps {
  selectedBloodGroup?: string;
  onSelectBloodGroup?: (bg: string) => void;
  selectedAvailability?: string;
  onSelectAvailability?: (avail: string) => void;
}

export function BloodStatsBar({
  selectedBloodGroup = 'all',
  onSelectBloodGroup,
  selectedAvailability = 'all',
  onSelectAvailability,
}: BloodStatsBarProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/blood-donation/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching blood stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const summary = stats?.summary || {
    totalAlumni: 0,
    totalDonors: 0,
    availableDonors: 0,
    restingDonors: 0,
    openRequests: 0,
    emergencyRequests: 0,
  };

  const distribution = stats?.distribution || {};
  const restingCountTotal = summary.restingDonors ?? Math.max(0, summary.totalDonors - summary.availableDonors);

  return (
    <div className="w-full space-y-6">
      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donors */}
        <div
          onClick={() => onSelectAvailability && onSelectAvailability('all')}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
            selectedAvailability === 'all'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {isBn ? 'মোট নিবন্ধিত রক্তদাতা' : 'Total Donors'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '...' : summary.totalDonors}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'বিদ্যালয়ের অঙ্গীকারবদ্ধ রক্তদাতা' : 'Registered alumni blood donors'}
          </p>
        </div>

        {/* Available Donors */}
        <div
          onClick={() => onSelectAvailability && onSelectAvailability('available')}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
            selectedAvailability === 'available'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isBn ? 'রক্তদানে প্রস্তুত' : 'Available Donors'}</span>
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : summary.availableDonors}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'এই মুহূর্তে রক্তদানে প্রস্তুত' : 'Ready to donate immediately'}
          </p>
        </div>

        {/* Recently Donated (Resting) */}
        <div
          onClick={() => onSelectAvailability && onSelectAvailability('resting')}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
            selectedAvailability === 'resting'
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{isBn ? 'বিশ্রামকালীন দাতা' : 'Recently Donated'}</span>
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {loading ? '...' : restingCountTotal}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'সম্প্রতি রক্তদান করেছেন (৩ মাস বিশ্রাম)' : 'Resting period (+3 months)'}
          </p>
        </div>

        {/* Active Requests */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {isBn ? 'সক্রিয় রক্তের চাহিদা' : 'Active Requests'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/25">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '...' : summary.openRequests}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'জরুরী চিকিৎসাধীন রোগী' : 'Patients seeking emergency blood'}
          </p>
        </div>
      </div>

      {/* Blood Group Distribution Selector Bar with Group-wise Available & Resting breakdown */}
      {onSelectBloodGroup && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-500 fill-current" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'রক্তের গ্রুপ অনুযায়ী প্রাপ্যতা ও পরিসংখ্যান' : 'Donors by Blood Group (Available & Resting)'}
              </h4>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isBn ? 'প্রস্তুত (Available)' : 'Available'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{isBn ? 'বিশ্রামে (Resting)' : 'Recently Donated'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {/* All Groups Button */}
            <button
              type="button"
              onClick={() => onSelectBloodGroup('all')}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[72px] ${
                selectedBloodGroup === 'all'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 font-bold scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
              }`}
            >
              <span className="text-xs font-black tracking-tight">{isBn ? 'সকল গ্রুপ' : 'All Groups'}</span>

              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                <span
                  className={`px-1.5 py-0.5 rounded-md ${
                    selectedBloodGroup === 'all'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                  title={isBn ? 'প্রস্তুত' : 'Available'}
                >
                  🟢 {summary.availableDonors}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md ${
                    selectedBloodGroup === 'all'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                  title={isBn ? 'বিশ্রামে' : 'Resting'}
                >
                  🟡 {restingCountTotal}
                </span>
              </div>
            </button>

            {/* Individual Blood Group Chips */}
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const active = selectedBloodGroup === bg;
              const item = distribution[bg] || { donorsCount: 0, availableCount: 0, restingCount: 0 };
              const available = item.availableCount || 0;
              const resting = item.restingCount || 0;
              const total = item.donorsCount || 0;

              return (
                <button
                  type="button"
                  key={bg}
                  onClick={() => onSelectBloodGroup(bg)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[72px] ${
                    active
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25 font-bold scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-rose-300'
                  }`}
                >
                  <span className="text-xs font-black tracking-tight">{bg}</span>

                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                      title={`${available} ${isBn ? 'জন প্রস্তুত' : 'Available'}`}
                    >
                      🟢 {available}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${
                        active
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                      title={`${resting} ${isBn ? 'জন বিশ্রামে' : 'Recently Donated'}`}
                    >
                      🟡 {resting}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
