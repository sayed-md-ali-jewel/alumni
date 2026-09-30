'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Droplet,
  MapPin,
  GraduationCap,
  CheckCircle2,
  HeartHandshake,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils';

interface BloodDonorCardProps {
  donor: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      image?: string;
      isVerified?: boolean;
      phone?: string;
      email?: string;
    };
    group: string;
    batchYear: number;
    bloodGroup?: string;
    donorLocation?: string;
    location?: string;
    donationStatus: string;
    dynamicStatus?: 'Available' | 'Recently Donated' | 'Temporarily Unavailable' | 'Not Available' | string;
    isAvailable?: boolean;
    lastDonationDate?: string | Date;
    nextEligibleDate?: string | Date;
    donorNotes?: string;
    contactPreference?: string;
    hasReceivedRequest?: boolean;
    contactedAt?: string | Date;
    contactStatus?: string;
  };
  onContact: (donor: any) => void;
}

export function BloodDonorCard({ donor, onContact }: BloodDonorCardProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';

  const user = donor.userId || (donor as any);
  const currentUserId = (session?.user as any)?.id?.toString();
  const donorUserId = (user?._id || (donor as any)?.userId?._id || (donor as any)?.userId || donor?._id)?.toString();
  const isSelf = Boolean(currentUserId && donorUserId && currentUserId === donorUserId);
  const locationText = donor.donorLocation || donor.location || (isBn ? 'চট্টগ্রাম, বাংলাদেশ' : 'Chattogram, Bangladesh');

  // Determine dynamic availability
  const dynamicStatus = donor.dynamicStatus || (donor.isAvailable ? 'Available' : donor.donationStatus || 'Available');
  const isAvailable = dynamicStatus === 'Available';
  const isResting = dynamicStatus === 'Recently Donated';
  const isTempUnavailable = dynamicStatus === 'Temporarily Unavailable';

  const groupColors: Record<string, string> = {
    Science: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Commerce: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Humanities: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  const groupLabelBn: Record<string, string> = {
    Science: 'বিজ্ঞান',
    Commerce: 'ব্যবসায় শিক্ষা',
    Humanities: 'মানবিক',
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/90 p-3.5 xs:p-5 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
      {/* Top blood glow accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isAvailable
            ? 'bg-gradient-to-r from-emerald-500 via-rose-500 to-red-600'
            : isResting
            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600'
            : 'bg-gradient-to-r from-slate-400 to-slate-600'
        }`}
      />

      <div className="space-y-4">
        {/* Header: Avatar, Name, Location & Blood Badge */}
        <div className="flex items-start justify-between gap-3 pt-1">
          {/* Avatar with Status Pulse Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                src={user?.image}
                name={user?.name}
                fallback={user?.name || 'BD'}
                size="lg"
                className="w-13 h-13 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md ring-2 ring-rose-500/20"
              />
              {/* Online/Availability Dot */}
              <span
                title={
                  isAvailable
                    ? isBn ? 'রক্তদানে প্রস্তুত' : 'Ready to donate'
                    : isResting
                    ? isBn ? 'বিশ্রামে রয়েছেন' : 'Resting period active'
                    : isBn ? 'অনুপলব্ধ' : 'Unavailable'
                }
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
                  isAvailable
                    ? 'bg-emerald-500'
                    : isResting
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              >
                {isAvailable && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                )}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/directory/${donor._id || user?._id}`}
                  className="font-bold text-slate-900 dark:text-white text-base truncate hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  {user?.name || (isBn ? 'নাম অপ্রকাশিত' : 'Anonymous Donor')}
                </Link>
                {user?.isVerified && (
                  <span title={isBn ? 'যাচাইকৃত প্রাক্তন শিক্ষার্থী' : 'Verified School Alumni'}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            </div>
          </div>

          {/* Blood Group Pill Badge */}
          <div className="flex flex-col items-center justify-center min-w-[58px] px-3 py-2 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-600/25 shrink-0 border border-rose-400/30 text-center transform transition-transform group-hover:scale-105">
            <div className="flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
              <span className="text-base font-black tracking-tight leading-none">
                {donor.bloodGroup || 'O+'}
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-100 mt-0.5">
              {isBn ? 'রক্ত' : 'BLOOD'}
            </span>
          </div>
        </div>

        {/* Academic Tags (Batch & Alumni Group) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {donor.group && (
            <span
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1 ${
                groupColors[donor.group] ||
                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span>{isBn ? groupLabelBn[donor.group] || donor.group : donor.group}</span>
            </span>
          )}
          {donor.batchYear && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? `ব্যাচ ${donor.batchYear}` : `Batch ${donor.batchYear}`}</span>
            </span>
          )}
          {donor.contactPreference && donor.contactPreference !== 'Both' && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
              {donor.contactPreference}
            </span>
          )}
        </div>

        {/* Dynamic Availability Status Pill */}
        <div className="pt-1">
          {isAvailable && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {isBn ? 'রক্তদানে প্রস্তুত' : 'Available to Donate'}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isBn ? 'সক্রিয়' : 'Ready'}
              </span>
            </div>
          )}

          {isResting && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate">
                  {isBn ? 'বিশ্রামকালীন সময়' : 'Recently Donated'}
                </span>
              </div>
              {donor.nextEligibleDate && (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                  {isBn ? 'উপযুক্ত: ' : 'Eligible: '}
                  {formatDate(donor.nextEligibleDate, locale)}
                </span>
              )}
            </div>
          )}

          {isTempUnavailable && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {isBn ? 'সাময়িক অনুপলব্ধ' : 'Temporarily Unavailable'}
              </span>
            </div>
          )}

          {dynamicStatus === 'Not Available' && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isBn ? 'অনুপলব্ধ' : 'Not Available'}
              </span>
            </div>
          )}
        </div>

        {/* Donation Timing Details */}
        {(donor.lastDonationDate || donor.nextEligibleDate) && (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-[11px]">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {isBn ? 'সর্বশেষ রক্তদান' : 'Last Donated'}
              </span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                {donor.lastDonationDate
                  ? formatDate(donor.lastDonationDate, locale)
                  : (isBn ? 'লগ নেই' : 'None logged')}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {isBn ? 'পরবর্তী উপযুক্ত তারিখ' : 'Next Eligible'}
              </span>
              <p className={`font-semibold mt-0.5 truncate ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {donor.nextEligibleDate
                  ? formatDate(donor.nextEligibleDate, locale)
                  : (isBn ? 'এখনই উপযুক্ত' : 'Eligible Now')}
              </p>
            </div>
          </div>
        )}

        {/* Optional Donor Note */}
        {donor.donorNotes && (
          <p className="text-xs text-slate-600 dark:text-slate-300 bg-rose-50/40 dark:bg-rose-950/20 p-2.5 rounded-2xl border border-rose-100/60 dark:border-rose-900/30 italic line-clamp-2">
            &ldquo;{donor.donorNotes}&rdquo;
          </p>
        )}
        {/* Request Sent Status Tracking Badge */}
        {donor.hasReceivedRequest && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-800 dark:text-emerald-300 truncate">
                {isBn ? '✓ রক্তের অনুরোধ পাঠানো হয়েছে' : '✓ Direct Request Sent'}
              </span>
            </div>
            {donor.contactedAt && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 shrink-0 font-medium">
                {formatDate(donor.contactedAt, locale)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5 xs:gap-2.5 mt-4">
        {isSelf ? (
          <Button
            size="sm"
            disabled
            className="w-full font-bold text-xs bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700"
          >
            <span>{isBn ? 'আপনার প্রোফাইল' : 'Your Profile'}</span>
          </Button>
        ) : (
          <Button
            onClick={() => onContact(donor)}
            size="sm"
            className={`w-full font-bold text-xs flex items-center justify-center gap-1.5 rounded-xl transition-all shadow-md ${
              donor.hasReceivedRequest
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>
              {donor.hasReceivedRequest
                ? isBn ? 'বার্তা পাঠান' : 'Send Message'
                : isBn ? 'রক্তের অনুরোধ' : 'Contact Donor'}
            </span>
          </Button>
        )}

        <Link href={`/directory/${donor._id || user?._id}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1"
          >
            <span>{isBn ? 'প্রোফাইল' : 'View Profile'}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
