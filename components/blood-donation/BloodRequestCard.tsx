'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Droplet,
  MapPin,
  Calendar,
  Building2,
  AlertOctagon,
  Flame,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useLocale } from 'next-intl';

interface BloodRequestCardProps {
  request: {
    _id: string;
    patientName: string;
    bloodGroup: string;
    requiredUnits: number;
    hospitalName: string;
    hospitalLocation: string;
    requiredDate: string | Date;
    urgency: string;
    status: string;
    contactName: string;
    contactPhone?: string;
    additionalInformation?: string;
    acceptedByName?: string;
    acceptedByUserId?: {
      name?: string;
      image?: string;
      bloodGroup?: string;
    };
    requesterId?: {
      name: string;
      image?: string;
      isVerified?: boolean;
    };
  };
}

export function BloodRequestCard({ request }: BloodRequestCardProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const isEmergency = request.urgency === 'Emergency';
  const isUrgent = request.urgency === 'Urgent';
  const isAccepted = request.status === 'Accepted';
  const isFulfilled = request.status === 'Fulfilled';

  const urgencyColors = isEmergency
    ? 'bg-red-500 text-white animate-pulse'
    : isUrgent
    ? 'bg-amber-500 text-white'
    : 'bg-blue-500 text-white';

  const formattedDate = new Date(request.requiredDate).toLocaleDateString(
    isBn ? 'bn-BD' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const acceptedDonorName =
    request.acceptedByName ||
    request.acceptedByUserId?.name ||
    (isBn ? 'অ্যালামনাই রক্তদাতা' : 'Alumni Donor');

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isEmergency
          ? 'border-red-300 dark:border-red-900/60 ring-2 ring-red-500/20'
          : isAccepted
          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/5'
          : 'border-slate-200/90 dark:border-slate-700/80'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isAccepted
            ? 'bg-emerald-500'
            : isFulfilled
            ? 'bg-blue-600'
            : isEmergency
            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
            : isUrgent
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />

      <div>
        {/* Header Badges: Urgency & Blood Group */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Blood group display */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-500/25 border border-rose-400/30 shrink-0">
              <span className="text-xl font-black tracking-tight leading-none">
                {request.bloodGroup}
              </span>
              <span className="text-[10px] font-semibold text-rose-100 uppercase tracking-wider mt-0.5">
                {request.requiredUnits} {isBn ? 'ব্যাগ' : request.requiredUnits > 1 ? 'Units' : 'Unit'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 ${urgencyColors}`}>
                  {isEmergency && <AlertOctagon className="w-3.5 h-3.5" />}
                  {isUrgent && <Flame className="w-3.5 h-3.5" />}
                  <span>{request.urgency}</span>
                </span>
                {isAccepted && (
                  <Badge variant="warning" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    <span>{isBn ? 'গৃহীত' : 'Accepted'}</span>
                  </Badge>
                )}
                {isFulfilled && (
                  <Badge variant="success" className="text-xs">
                    {isBn ? 'সম্পন্ন' : 'Fulfilled'}
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1">
                {request.patientName}
              </h3>
            </div>
          </div>
        </div>

        {/* Accepted By Banner */}
        {isAccepted && (
          <div className="mb-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                {isBn ? 'রক্তদাতা গ্রহণ করেছেন' : 'Accepted By'}
              </span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 truncate block">
                {acceptedDonorName}
              </span>
            </div>
          </div>
        )}

        {/* Details list */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {request.hospitalName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{request.hospitalLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isBn ? 'প্রয়োজনের তারিখ: ' : 'Required by: '}
              <strong className="text-slate-900 dark:text-white">{formattedDate}</strong>
            </span>
          </div>
        </div>

        {request.additionalInformation && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
            &ldquo;{request.additionalInformation}&rdquo;
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
        <Link href={`/blood-requests/${request._id}`} className="w-full">
          <Button
            size="sm"
            className={`w-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm ${
              isAccepted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
            }`}
          >
            {isAccepted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isBn ? 'বিবরণ ও গৃহীত দাতা দেখুন' : 'View Details & Accepted Donor'}</span>
              </>
            ) : isFulfilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'সম্পন্ন আবেদন দেখুন' : 'View Fulfilled Request'}</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBn ? 'দাতার সন্ধান ও বিবরণ' : 'Find Donors & Details'}</span>
              </>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
