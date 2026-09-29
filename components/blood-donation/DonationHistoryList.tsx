'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { Droplet, Calendar, Building2, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface DonationRecord {
  _id: string;
  donationDate: string;
  donationTime?: string;
  recipientName?: string;
  recipientId?: any;
  nextEligibleDate: string;
  bloodGroup: string;
  unitsDonated: number;
  hospitalName?: string;
  location?: string;
  notes?: string;
  bloodRequestId?: {
    patientName?: string;
    hospitalName?: string;
    hospitalLocation?: string;
    urgency?: string;
  };
}

interface DonationHistoryListProps {
  donorId?: string;
  refreshTrigger?: number;
}

export function DonationHistoryList({ donorId, refreshTrigger }: DonationHistoryListProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = donorId
        ? `/api/blood-donation/history?donorId=${donorId}`
        : '/api/blood-donation/history';
      const res = await fetch(url);
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Error fetching donation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [donorId, refreshTrigger]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
          <Droplet className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          {isBn ? 'এখনো কোনো রক্তদানের রেকর্ড নেই' : 'No Donation Records Yet'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isBn
            ? 'আপনি যখনই রক্তদান করবেন, এখানে রেকর্ড করুন। আপনার জীবন বাঁচানোর ইতিহাস এখানে সংরক্ষিত থাকবে।'
            : 'Whenever you donate blood, record it here to track your lifelong lifesaving milestones.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {isBn ? `রক্তদানের ইতিহাস (${history.length} বার)` : `Donation History (${history.length} Times)`}
          </h4>
        </div>
        <Badge variant="success" className="text-[10px] px-2 py-0.5 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{isBn ? 'যাচাইকৃত ইতিহাস' : 'Verified Log'}</span>
        </Badge>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {history.map((item, idx) => {
          const recipientDisplay =
            item.recipientName || item.bloodRequestId?.patientName;

          return (
            <div key={item._id} className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-black leading-none">{item.bloodGroup}</span>
                    <span className="text-[9px] font-bold mt-0.5 text-rose-500">
                      {item.unitsDonated || 1}U
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatDate(item.donationDate, locale)}
                        {item.donationTime ? ` • ${item.donationTime}` : ''}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        #{history.length - idx}
                      </span>
                    </div>

                    {recipientDisplay && (
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {isBn ? 'গ্রহীতা / রোগী:' : 'Given To / Recipient:'} {recipientDisplay}
                      </p>
                    )}

                    {item.hospitalName && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.hospitalName}</span>
                      </p>
                    )}

                    {item.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.location}</span>
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isBn ? 'পরবর্তী উপযুক্ত' : 'Eligible Date'}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {formatDate(item.nextEligibleDate, locale)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
