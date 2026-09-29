'use client';

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Clock,
  XCircle,
  HeartHandshake,
  Droplet,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { CompleteDonationModal } from './CompleteDonationModal';

interface DonorResponseTrackerProps {
  bloodRequest: any;
  isOwnerOrAdmin: boolean;
  onRefresh?: () => void;
}

export function DonorResponseTracker({
  bloodRequest,
  isOwnerOrAdmin,
  onRefresh,
}: DonorResponseTrackerProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [responses, setResponses] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeCompleteDonor, setActiveCompleteDonor] = useState<any>(null);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blood-requests/responses?bloodRequestId=${bloodRequest._id}&status=${filterStatus}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.responses) {
        setResponses(data.responses);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Error fetching donor responses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bloodRequest?._id) {
      fetchResponses();
    }
  }, [bloodRequest?._id, filterStatus]);

  if (!loading && counts.total === 0 && (!bloodRequest.contactedDonors || bloodRequest.contactedDonors.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
      {/* Header & Metric Counter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isBn ? '📬 রক্তদাতা সাড়া ও লাইভ ট্র্যাকিং' : '📬 Donor Responses & Status Tracking'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                {counts.total} {isBn ? 'জন' : 'Total'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'অনুরোধপ্রাপ্ত রক্তদাতাদের ব্যক্তিগত সাড়া (Accepted / Pending / Declined) সরাসরি পর্যবেক্ষণ করুন।'
                : 'Track individual responses from each contacted donor in real time.'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchResponses}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Accepted */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'accepted' ? 'all' : 'accepted')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'accepted'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'accepted' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {isBn ? '✓ রাজি হয়েছেন' : '✓ Accepted'}
            </span>
            <CheckCircle2 className={`w-4 h-4 ${filterStatus === 'accepted' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${filterStatus === 'accepted' ? 'text-white' : 'text-emerald-900 dark:text-emerald-200'}`}>
            {counts.accepted}
          </p>
        </button>

        {/* Pending */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'pending' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}`}>
              {isBn ? '⏳ অপেক্ষমান' : '⏳ Pending'}
            </span>
            <Clock className={`w-4 h-4 ${filterStatus === 'pending' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${filterStatus === 'pending' ? 'text-white' : 'text-amber-900 dark:text-amber-200'}`}>
            {counts.pending}
          </p>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'completed'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20'
              : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'completed' ? 'text-blue-100' : 'text-blue-700 dark:text-blue-400'}`}>
              {isBn ? '🩸 সম্পন্ন' : '🩸 Completed'}
            </span>
            <Sparkles className={`w-4 h-4 ${filterStatus === 'completed' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${filterStatus === 'completed' ? 'text-white' : 'text-blue-900 dark:text-blue-200'}`}>
            {counts.completed}
          </p>
        </button>

        {/* Declined */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'declined' ? 'all' : 'declined')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterStatus === 'declined'
              ? 'bg-slate-700 text-white border-slate-800 shadow-md'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'declined' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
              {isBn ? '✕ অপারগ' : '✕ Declined'}
            </span>
            <XCircle className={`w-4 h-4 ${filterStatus === 'declined' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${filterStatus === 'declined' ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
            {counts.declined}
          </p>
        </button>
      </div>

      {/* Response Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : responses.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {filterStatus !== 'all'
              ? (isBn ? `'${filterStatus}' স্ট্যাটাসে কোনো রক্তদাতা নেই` : `No donors with '${filterStatus}' status`)
              : (isBn ? 'এখনও কোনো রক্তদাতার সাড়া পাওয়া যায়নি' : 'No donor responses recorded yet')}
          </p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              {isBn ? 'সকল সাড়া দেখুন' : 'View all responses'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((res: any) => {
            const donorUser = res.donorId || {};
            const donorProfile = res.donorProfileId || {};
            const status = res.status || 'pending';
            const isAccepted = status === 'accepted';
            const isPending = status === 'pending';
            const isDeclined = status === 'declined';
            const isCompleted = status === 'completed';

            return (
              <div
                key={res._id}
                className={`p-5 rounded-3xl border transition-all space-y-3.5 relative flex flex-col justify-between ${
                  isAccepted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                    : isCompleted
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/80 shadow-xs'
                    : isDeclined
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Avatar & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={donorUser.image}
                        name={donorUser.name}
                        fallback={donorUser.name || 'BD'}
                        size="md"
                        className="w-11 h-11 rounded-2xl ring-2 ring-rose-500/20 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {donorUser.name || (isBn ? 'নাম অপ্রকাশিত' : 'Anonymous Donor')}
                          </h4>
                          {donorUser.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{donorProfile.donorLocation || donorProfile.location || 'Bangladesh'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Blood badge */}
                    <span className="px-2.5 py-1 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white font-black text-xs shrink-0 shadow-xs">
                      {donorProfile.bloodGroup || donorUser.bloodGroup || bloodRequest.bloodGroup}
                    </span>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="pt-1">
                    {isAccepted && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isBn ? '✓ রক্তদানে রাজি হয়েছেন' : '✓ Accepted Request'}</span>
                        </span>
                        {res.respondedAt && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                            {formatDate(res.respondedAt, locale)}
                          </span>
                        )}
                      </div>
                    )}

                    {isPending && (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>{isBn ? '⏳ সাড়ার অপেক্ষায়...' : '⏳ Awaiting Response'}</span>
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400">
                          {formatDate(res.createdAt, locale)}
                        </span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="px-3 py-1.5 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>{isBn ? '🩸 রক্তদান সম্পন্ন হয়েছে' : '🩸 Donation Completed'}</span>
                        </span>
                        {res.completedAt && (
                          <span className="text-[10px] text-blue-700 dark:text-blue-400">
                            {formatDate(res.completedAt, locale)}
                          </span>
                        )}
                      </div>
                    )}

                    {isDeclined && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>{isBn ? '✕ অপারগতা প্রকাশ করেছেন' : '✕ Declined'}</span>
                        </span>
                        {res.respondedAt && (
                          <span className="text-[10px] text-slate-500">
                            {formatDate(res.respondedAt, locale)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message/Notes if provided */}
                  {(res.message || res.declineReason || res.notes) && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 italic">
                      &ldquo;{res.message || res.declineReason || res.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  {/* If Accepted: Prominent Call & WhatsApp & Complete Action */}
                  {isAccepted && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {donorUser.phone ? (
                          <>
                            <a
                              href={`tel:${donorUser.phone}`}
                              className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{isBn ? 'কল করুন' : 'Call'}</span>
                            </a>
                            <a
                              href={`https://wa.me/${donorUser.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Assalamu Alaikum ${donorUser.name}, thank you for accepting our blood request for ${bloodRequest.patientName} at ${bloodRequest.hospitalName}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        ) : (
                          <span className="col-span-2 text-center text-[11px] text-slate-500 py-1">
                            {isBn ? 'ফোন নম্বর প্রোফাইলে সংরক্ষিত' : 'Phone in Profile'}
                          </span>
                        )}
                      </div>

                      {/* Requester/Admin: Mark Completed Button */}
                      {isOwnerOrAdmin && (
                        <Button
                          size="sm"
                          onClick={() => setActiveCompleteDonor(res)}
                          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-amber-600" />
                          <span>{isBn ? 'রক্তদান সম্পন্ন রেকর্ড করুন' : 'Mark Donation Completed'}</span>
                        </Button>
                      )}
                    </>
                  )}

                  {/* If Pending: Remind / Call */}
                  {isPending && donorUser.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${donorUser.phone}`}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{isBn ? 'সরাসরি কল' : 'Call'}</span>
                      </a>
                      <a
                        href={`https://wa.me/${donorUser.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Assalamu Alaikum ${donorUser.name}, reaching out regarding the urgent ${bloodRequest.bloodGroup} blood request for ${bloodRequest.patientName} at ${bloodRequest.hospitalName}. Please let us know if you can donate.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {/* If Completed: Verified Badge */}
                  {isCompleted && (
                    <div className="text-center py-1 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isBn ? '✓ রক্তদান সফলভাবে সম্পন্ন হয়েছে' : '✓ Verified Donation Complete'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Donation Modal */}
      {activeCompleteDonor && (
        <CompleteDonationModal
          isOpen={!!activeCompleteDonor}
          bloodRequest={bloodRequest}
          donor={activeCompleteDonor}
          onClose={() => setActiveCompleteDonor(null)}
          onSuccess={() => {
            fetchResponses();
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
