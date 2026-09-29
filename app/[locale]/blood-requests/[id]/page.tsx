'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { BloodDonorCard } from '@/components/blood-donation/BloodDonorCard';
import { ContactDonorModal } from '@/components/blood-donation/ContactDonorModal';
import { CompleteDonationModal } from '@/components/blood-donation/CompleteDonationModal';
import { DonorResponseTracker } from '@/components/blood-donation/DonorResponseTracker';
import { isCompatibleDonor } from '@/lib/blood-compatibility';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Droplet,
  MapPin,
  Calendar,
  Building2,
  Phone,
  User,
  AlertOctagon,
  Flame,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Share2,
  Send,
  MessageSquare,
  Sparkles,
  Heart,
  HeartHandshake,
  ShieldCheck,
  Navigation,
  X,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { formatDate } from '@/lib/utils';

export default function BloodRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { data: session } = useSession();
  const { showToast, showLoginPrompt } = useSweetAlert();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [matchingDonors, setMatchingDonors] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [hasSearchedDonors, setHasSearchedDonors] = useState(false);
  const [activeContactDonor, setActiveContactDonor] = useState<any>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptModalMessage, setAcceptModalMessage] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/blood-requests/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequest(data);
    } catch (err: any) {
      console.error('Error loading request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const currentUserId = (session?.user as any)?.id;

  // Fetch logged in user's profile for bloodGroup compatibility
  useEffect(() => {
    async function loadProfile() {
      if (session?.user) {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (data.profile) {
            setUserProfile(data.profile);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }
    }
    loadProfile();
  }, [session?.user]);

  const currentUserBloodGroup =
    userProfile?.bloodGroup || (session?.user as any)?.bloodGroup || '';

  const findMatchingDonors = async () => {
    setMatchingLoading(true);
    setHasSearchedDonors(true);
    try {
      const url = currentUserId
        ? `/api/blood-requests/${id}/matching-donors?excludeUserId=${encodeURIComponent(currentUserId)}`
        : `/api/blood-requests/${id}/matching-donors`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.donors) {
        const filtered = currentUserId
          ? data.donors.filter((d: any) => {
              const donorUid = d.userId?._id?.toString() || d.userId?.toString();
              const donorPid = d._id?.toString();
              return donorUid !== currentUserId.toString() && donorPid !== currentUserId.toString();
            })
          : data.donors;
        setMatchingDonors(filtered);
      }
    } catch (err) {
      console.error('Error finding matching donors:', err);
      showToast({
        title: isBn ? 'ম্যাচিং রক্তদাতা খুঁজতে সমস্যা হয়েছে' : 'Failed to load matching donors',
        type: 'error',
      });
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/blood-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequest(data.request);
      showToast({
        title: isBn ? `স্ট্যাটাস পরিবর্তন` : `Status Updated`,
        text: isBn ? `স্ট্যাটাস সফলভাবে '${newStatus}' করা হয়েছে` : `Status updated to ${newStatus}`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Error updating status',
        type: 'error',
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRespond = async (action: 'accept' | 'decline', message?: string) => {
    if (!session) {
      showLoginPrompt(
        isBn
          ? 'রক্তদানের অনুরোধ গ্রহণ করতে প্রথমে লগইন করুন।'
          : 'Please sign in to accept blood requests.'
      );
      return;
    }
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/blood-requests/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to respond');
      }
      showToast({
        title: action === 'accept'
          ? (isBn ? 'অনুরোধ গ্রহণ করা হয়েছে!' : 'Blood Request Accepted!')
          : (isBn ? 'অনুরোধ প্রত্যাহার করা হয়েছে' : 'Acceptance Cancelled'),
        text: data.message,
        type: action === 'accept' ? 'success' : 'info',
      });
      setShowAcceptModal(false);
      setAcceptModalMessage('');
      fetchRequest();
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Error processing response',
        type: 'error',
      });
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBn ? 'রক্তের আবেদনটি পাওয়া যায়নি' : 'Blood request not found'}
        </h2>
        <Link href="/blood-requests" className="mt-4 inline-block">
          <Button variant="outline">{isBn ? 'তালিকায় ফিরে যান' : 'Back to Requests'}</Button>
        </Link>
      </div>
    );
  }

  const isEmergency = request.urgency === 'Emergency';
  const isUrgent = request.urgency === 'Urgent';
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'admin';
  const isCreator = Boolean(
    currentUserId &&
      ((request.requesterId as any)?._id?.toString() === currentUserId.toString() ||
        request.requesterId?.toString() === currentUserId.toString())
  );
  const isOwner = isCreator || isAdmin;

  const requiredUnits = Number(request.requiredUnits) || 1;
  const fulfilledUnits = Number(request.fulfilledUnits) || 0;
  const remainingUnits = Math.max(0, requiredUnits - fulfilledUnits);
  const fulfillmentPercentage = Math.min(100, Math.round((fulfilledUnits / requiredUnits) * 100));
  const isFulfilled = request.status === 'Fulfilled' || fulfilledUnits >= requiredUnits;
  const isAccepted = request.status === 'Accepted';

  const acceptedUserIdStr =
    request.acceptedByUserId?._id?.toString() || request.acceptedByUserId?.toString();
  const isAcceptedByMe = Boolean(currentUserId && acceptedUserIdStr && acceptedUserIdStr === currentUserId.toString());
  const isCompatible = isCompatibleDonor(currentUserBloodGroup, request.bloodGroup);

  const formattedDate = new Date(request.requiredDate).toLocaleDateString(
    isBn ? 'bn-BD' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const displayedContactedDonors = (request.contactedDonors || []).filter((cd: any) => {
    const cdDonorUserId = cd.donorUserId?._id?.toString() || cd.donorUserId?.toString();
    const cdDonorId = cd.donorId?._id?.toString() || cd.donorId?.toString();
    const sessionUserId = currentUserId?.toString();
    const requesterId = (request.requesterId as any)?._id?.toString() || request.requesterId?.toString();

    if (sessionUserId && (cdDonorUserId === sessionUserId || cdDonorId === sessionUserId)) {
      return false;
    }
    if (requesterId && (cdDonorUserId === requesterId || cdDonorId === requesterId)) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/blood-requests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল রক্তের আবেদনে ফিরে যান' : 'Back to Blood Requests'}</span>
        </Link>

        {/* Main Request Card */}
        <div
          className={`relative bg-white dark:bg-slate-900 rounded-3xl border shadow-xl p-6 sm:p-10 overflow-hidden ${
            isEmergency
              ? 'border-red-300 dark:border-red-900/80 ring-2 ring-red-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Top urgency strip */}
          <div
            className={`absolute top-0 left-0 right-0 h-2 ${
              isEmergency
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                : isUrgent
                ? 'bg-amber-500'
                : 'bg-blue-500'
            }`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left Big Blood & Urgency Badge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-rose-50 to-red-50/50 dark:from-rose-950/30 dark:to-slate-800/50 border border-rose-200/80 dark:border-rose-900/40 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-600/30 border-2 border-rose-400/40 mb-3">
                <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                  {request.bloodGroup}
                </span>
                <span className="text-xs font-bold text-rose-100 uppercase tracking-widest mt-1">
                  {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </span>
              </div>

              <div className="text-xl font-black text-slate-900 dark:text-white">
                {request.requiredUnits} {isBn ? 'ব্যাগ প্রয়োজন' : request.requiredUnits > 1 ? 'Units Required' : 'Unit Required'}
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-white ${
                    isEmergency
                      ? 'bg-red-600 animate-pulse'
                      : isUrgent
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                >
                  {isEmergency && <AlertOctagon className="w-3.5 h-3.5" />}
                  {isUrgent && <Flame className="w-3.5 h-3.5" />}
                  <span>{request.urgency}</span>
                </span>
                <Badge
                  variant={isFulfilled ? 'success' : 'default'}
                  className="text-xs py-0.5"
                >
                  {request.status}
                </Badge>
              </div>

              {/* Status Update Controls for Requester / Admin: ONLY when NOT fulfilled */}
              {isOwner && !isFulfilled && (
                <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isBn ? 'আবেদনের স্ট্যাটাস পরিবর্তন' : 'Manage Status'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {request.status !== 'Fulfilled' && (
                      <Button
                        size="sm"
                        disabled={statusUpdating}
                        onClick={() => handleUpdateStatus('Fulfilled')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] rounded-xl font-bold"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>{isBn ? 'রক্ত পাওয়া গেছে' : 'Fulfilled'}</span>
                      </Button>
                    )}
                    {request.status !== 'Cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={statusUpdating}
                        onClick={() => handleUpdateStatus('Cancelled')}
                        className="w-full text-rose-600 hover:bg-rose-50 border-rose-200 text-[11px] rounded-xl"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Details Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  {isBn ? 'রোগীর বিবরণ' : 'Patient Information'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                  {request.patientName}
                </h1>
              </div>

              {/* Hospital & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                      {isBn ? 'হাসপাতাল' : 'Hospital'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {request.hospitalName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                      {isBn ? 'অবস্থান / জেলা' : 'Hospital Location'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {request.hospitalLocation}
                    </span>
                  </div>
                </div>

                {request.hospitalAddress && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <Navigation className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                        {isBn ? 'হাসপাতালের পূর্ণ ঠিকানা' : 'Hospital Street Address'}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        {request.hospitalAddress}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                      {isBn ? 'রক্তের প্রয়োজনীয়তার তারিখ' : 'Required Date & Schedule'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-5 rounded-3xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {isBn ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}
                    </span>
                  </div>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {request.contactName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-lg font-black text-slate-900 dark:text-white tracking-wider">
                    {request.contactPhone}
                  </span>
                  <a href={`tel:${request.contactPhone}`}>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      <span>{isBn ? 'সরাসরি কল করুন' : 'Call Now'}</span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Additional notes */}
              {request.additionalInformation && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    {isBn ? 'বিশেষ নির্দেশনা' : 'Additional Medical Notes'}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {request.additionalInformation}
                  </p>
                </div>
              )}

              {/* Multi-unit fulfillment progress bar */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-rose-500" />
                    <span>{isBn ? 'রক্ত সংগ্রহ অগ্রগতি' : 'Donation Fulfillment Progress'}</span>
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {fulfilledUnits} / {requiredUnits} {isBn ? 'ব্যাগ সংগৃহীত' : 'Units Fulfilled'} ({fulfillmentPercentage}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      fulfillmentPercentage >= 100
                        ? 'bg-emerald-500'
                        : fulfillmentPercentage > 0
                        ? 'bg-amber-500'
                        : isAccepted
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${fulfillmentPercentage > 0 ? fulfillmentPercentage : isAccepted ? 50 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    {isFulfilled
                      ? (isBn ? '✓ সম্পূর্ণ রক্ত সংগৃহীত হয়েছে' : '✓ Fully Fulfilled')
                      : isAccepted
                      ? (isBn ? '✓ রক্তদাতা গ্রহণ করেছেন — রক্তদানের অপেক্ষা' : '✓ Accepted by donor — Awaiting donation')
                      : (isBn ? `${remainingUnits} ব্যাগ রক্ত এখনও প্রয়োজন` : `${remainingUnits} more unit(s) needed`)}
                  </span>
                </div>
              </div>

              {/* Accepted Donor Showcase Card */}
              {isAccepted && (
                <div className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={request.acceptedByImage || request.acceptedByUserId?.image}
                        name={request.acceptedByName || request.acceptedByUserId?.name || 'Donor'}
                        fallback={(request.acceptedByName || 'BD').slice(0, 2)}
                        size="md"
                        className="w-12 h-12 rounded-2xl ring-2 ring-emerald-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            {isBn ? '✓ রক্তদাতা গ্রহণ করেছেন' : '✓ Accepted by Donor'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
                            {request.acceptedByUserId?.bloodGroup || request.bloodGroup} Blood
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {request.acceptedByName || request.acceptedByUserId?.name || 'Alumni Donor'}
                        </h4>
                        {request.acceptedAt && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isBn ? 'গ্রহণের সময়: ' : 'Accepted on: '}
                            {formatDate(request.acceptedAt, locale)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Buttons if requester/admin or accepted donor */}
                    {(isOwner || isAcceptedByMe) && (request.acceptedByPhone || request.acceptedByUserId?.phone) && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${request.acceptedByPhone || request.acceptedByUserId?.phone}`}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{request.acceptedByPhone || request.acceptedByUserId?.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${(request.acceptedByPhone || request.acceptedByUserId?.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Sub-actions for Accepted State */}
                  {isOwner ? (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        {isBn
                          ? 'রক্তদান সম্পন্ন হলে নিচের বাটনে ক্লিক করে রক্তদান সম্পন্ন হিসেবে রেকর্ড করুন।'
                          : 'Once donation is completed, click below to confirm and record.'}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowCompleteModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>{isBn ? 'রক্তদান সম্পন্ন রেকর্ড করুন' : 'Mark Donation Fulfilled / Completed'}</span>
                      </Button>
                    </div>
                  ) : isAcceptedByMe ? (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        {isBn
                          ? 'আপনি এই আবেদনটি গ্রহণ করেছেন। রোগী বা তার স্বজনের সাথে যোগাযোগ করুন।'
                          : 'You have accepted this request. Please coordinate with the patient contact.'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acceptLoading}
                        onClick={() => handleRespond('decline')}
                        className="border-rose-200 hover:bg-rose-50 text-rose-600 text-xs rounded-xl"
                      >
                        <span>{isBn ? 'অপারগ হলে বাতিল করুন' : 'Cancel Acceptance'}</span>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                      {isBn
                        ? 'এই রক্তের আবেদনটি একজন রক্তদাতা ইতিমধ্যে গ্রহণ করেছেন।'
                        : 'This blood request has already been accepted by an alumni donor.'}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons: Hide when Fulfilled */}
              {isFulfilled ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3.5 shadow-xs">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
                      {isBn ? '✓ রক্ত সংগ্রহ সফলভাবে সম্পন্ন হয়েছে' : '✓ Blood Request Successfully Fulfilled'}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                      {isBn
                        ? 'এই রোগীর জন্য প্রয়োজনীয় সকল রক্ত সফলভাবে সংগৃহীত হয়েছে। ধন্যবাদ সকল রক্তদাতাদের!'
                        : 'All required blood units have been collected for this patient. Thank you to the donor(s)!'}
                    </p>
                  </div>
                </div>
              ) : !isAccepted && (
                <div className="space-y-3 pt-2">
                  {isOwner ? (
                    <div>
                      <Button
                        onClick={findMatchingDonors}
                        disabled={matchingLoading}
                        className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 text-sm"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>
                          {matchingLoading
                            ? (isBn ? 'অনুসন্ধান চলছে...' : 'Finding Donors...')
                            : (isBn ? `ম্যাচিং ${request.bloodGroup} রক্তদাতা খুঁজুন` : `Find ${request.bloodGroup} Donors`)}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {isCompatible ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            onClick={() => {
                              if (!session) {
                                showLoginPrompt(
                                  isBn
                                    ? 'রক্তদানের অনুরোধ গ্রহণ করতে প্রথমে লগইন করুন।'
                                    : 'Please sign in to accept blood requests.'
                                );
                                return;
                              }
                              setShowAcceptModal(true);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <span>{isBn ? 'আমি রক্ত দিতে রাজি (Accept Request)' : 'Accept Blood Request'}</span>
                          </Button>

                          <Button
                            onClick={findMatchingDonors}
                            disabled={matchingLoading}
                            variant="outline"
                            className="w-full border-rose-300 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 text-sm"
                          >
                            <Search className="w-4 h-4" />
                            <span>
                              {matchingLoading
                                ? (isBn ? 'অনুসন্ধান চলছে...' : 'Finding Donors...')
                                : (isBn ? `অন্যান্য ${request.bloodGroup} রক্তদাতা খুঁজুন` : `Find Other ${request.bloodGroup} Donors`)}
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            onClick={findMatchingDonors}
                            disabled={matchingLoading}
                            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 text-sm"
                          >
                            <Search className="w-4 h-4 text-amber-300" />
                            <span>
                              {matchingLoading
                                ? (isBn ? 'অনুসন্ধান চলছে...' : 'Finding Donors...')
                                : (isBn ? `উপযুক্ত ${request.bloodGroup} রক্তদাতা খুঁজুন ও অনুরোধ পাঠান` : `Find / Request ${request.bloodGroup} Donor`)}
                            </span>
                          </Button>
                          {currentUserBloodGroup && (
                            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                              {isBn
                                ? `আপনার রক্তের গ্রুপ ${currentUserBloodGroup}। রোগীর রক্তের গ্রুপ ${request.bloodGroup}-এর সাথে মিল না থাকায় আপনি উপযুক্ত রক্তদাতা খুঁজে অনুরোধ পাঠাতে পারেন।`
                                : `Your blood group is ${currentUserBloodGroup}. Since it does not match ${request.bloodGroup}, you can find and forward this request to an eligible donor.`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* When Request is NOT fulfilled: Show Donor Response Tracker for Owner/Admin */}
        {!isFulfilled && (
          <DonorResponseTracker
            bloodRequest={request}
            isOwnerOrAdmin={isOwner}
            onRefresh={() => fetchRequest()}
          />
        )}

        {/* When Request is FULFILLED: Show Admin-Only Fulfilling Donors Record */}
        {isFulfilled && isAdmin && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-300/80 dark:border-emerald-800/60 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {isBn ? '🩸 রক্তদাতা সংক্রান্ত বিবরণী' : '🩸 Verified Fulfilling Donor(s)'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider">
                      {isBn ? 'কেবল এডমিন' : 'Admin Only'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isBn
                      ? 'এই রক্তদান সম্পন্নকারী রক্তদাতার বিস্তারিত পরিচিতি ও রক্তদানের রেকর্ড (কেবলমাত্র এডমিনদের জন্য দৃশ্যমান)।'
                      : 'Verified donor record and donation details that fulfilled this blood request (visible to Admins only).'}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                {fulfilledUnits} {isBn ? 'ব্যাগ সম্পন্ন' : 'Unit(s) Fulfilled'}
              </div>
            </div>

            {/* List fulfilling donors */}
            {(() => {
              const donations = request.fulfillingDonations || [];
              const completedResponses = request.completedResponses || [];
              const acceptedContacted = (request.contactedDonors || []).filter(
                (cd: any) => cd.status === 'Accepted' || cd.status === 'Completed'
              );

              const hasDonors = donations.length > 0 || completedResponses.length > 0 || acceptedContacted.length > 0;

              if (!hasDonors) {
                return (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    {isBn
                      ? 'কোনো নির্দিষ্ট রক্তদাতা রেকর্ড সংযুক্ত নেই (ম্যানুয়ালি সম্পন্ন করা হয়েছে)'
                      : 'No specific donor history record attached (marked fulfilled manually).'}
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {donations.map((d: any, idx: number) => {
                    const donor = d.donorId || {};
                    return (
                      <div
                        key={d._id || idx}
                        className="p-5 rounded-3xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/90 dark:border-emerald-900/60 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              src={donor.image}
                              name={donor.name}
                              fallback={donor.name || 'BD'}
                              size="md"
                              className="w-12 h-12 rounded-2xl ring-2 ring-emerald-500/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {donor.name || 'Alumni Donor'}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {donor.email}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white font-black text-xs shrink-0 shadow-xs">
                            {d.bloodGroup || donor.bloodGroup || request.bloodGroup}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {isBn ? 'রক্তদানের তারিখ' : 'Donation Date'}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatDate(d.donationDate, locale)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {isBn ? 'প্রদত্ত পরিমাণ' : 'Units Given'}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {d.unitsDonated || 1} {isBn ? 'ব্যাগ' : 'Unit(s)'}
                            </span>
                          </div>
                          {d.hospitalName && (
                            <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                {isBn ? 'হাসপাতাল' : 'Hospital'}
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {d.hospitalName} {d.location ? `• ${d.location}` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {d.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                            &ldquo;{d.notes}&rdquo;
                          </p>
                        )}

                        {donor.phone && (
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`tel:${donor.phone}`}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{donor.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Fallback to completedResponses if donations array was empty */}
                  {donations.length === 0 && completedResponses.map((cr: any, idx: number) => {
                    const donor = cr.donorId || {};
                    const profile = cr.donorProfileId || {};
                    return (
                      <div
                        key={cr._id || idx}
                        className="p-5 rounded-3xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/90 dark:border-emerald-900/60 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              src={donor.image}
                              name={donor.name}
                              fallback={donor.name || 'BD'}
                              size="md"
                              className="w-12 h-12 rounded-2xl ring-2 ring-emerald-500/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {donor.name || 'Alumni Donor'}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {profile.group ? `${profile.group} • Batch ${profile.batchYear || ''}` : donor.email}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white font-black text-xs shrink-0 shadow-xs">
                            {profile.bloodGroup || donor.bloodGroup || request.bloodGroup}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {isBn ? 'সম্পন্নের তারিখ' : 'Completed Date'}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatDate(cr.completedAt || cr.updatedAt, locale)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {isBn ? 'প্রদত্ত পরিমাণ' : 'Units Given'}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {cr.unitsDonated || 1} {isBn ? 'ব্যাগ' : 'Unit(s)'}
                            </span>
                          </div>
                        </div>

                        {donor.phone && (
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`tel:${donor.phone}`}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{donor.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Matching Donors Algorithm Results Section: ONLY when NOT fulfilled */}
        {!isFulfilled && hasSearchedDonors && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-1">
                  <Droplet className="w-3.5 h-3.5 fill-current" />
                  <span>{isBn ? 'স্মার্ট ম্যাচিং ফলাফল' : 'Smart Donor Matching'}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isBn
                    ? `${matchingDonors.length} জন উপযুক্ত ${request.bloodGroup} রক্তদাতা পাওয়া গেছে`
                    : `Found ${matchingDonors.length} Matching ${request.bloodGroup} Donors`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'রক্তের গ্রুপ, অবস্থান এবং স্বেচ্ছায় রক্তদানের সম্মতির ভিত্তিতে তালিকাভুক্ত করা হয়েছে।'
                    : 'Ranked by blood group compatibility, proximity to hospital location, and active donor consent.'}
                </p>
              </div>
            </div>

            {matchingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : matchingDonors.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center max-w-lg mx-auto space-y-3 shadow-sm">
                <Droplet className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isBn
                    ? `এই মুহূর্তে কোনো সক্রিয় ${request.bloodGroup} রক্তদাতা পাওয়া যায়নি`
                    : `No available ${request.bloodGroup} donors found right now`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'আপনি সম্পূর্ণ রক্তদাতা ডিরেক্টরি থেকেও অন্যান্য জেলার দাতাদের খুঁজে দেখতে পারেন।'
                    : 'You can also browse the full alumni directory to find contacts.'}
                </p>
                <Link href="/blood-donors">
                  <Button variant="outline" className="rounded-xl text-xs">
                    {isBn ? 'সম্পূর্ণ রক্তদাতা ডিরেক্টরি দেখুন' : 'Browse All Blood Donors'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingDonors.map((donor) => (
                  <BloodDonorCard
                    key={donor._id}
                    donor={donor}
                    onContact={(d) => {
                      if (!session) {
                        showLoginPrompt(
                          isBn
                            ? 'রক্তদাতাকে সরাসরি অনুরোধ পাঠাতে অনুগ্রহ করে প্রথমে লগইন করুন।'
                            : 'Please sign in to send blood donation requests directly to alumni donors.'
                        );
                        return;
                      }
                      setActiveContactDonor(d);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {activeContactDonor && (
        <ContactDonorModal
          donor={activeContactDonor}
          isOpen={!!activeContactDonor}
          bloodRequest={request}
          onClose={() => setActiveContactDonor(null)}
          onSuccess={() => {
            fetchRequest();
            if (hasSearchedDonors) {
              findMatchingDonors();
            }
          }}
        />
      )}

      {/* Accept Confirmation Modal for Donor */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isBn ? 'রক্তদানের অনুরোধ গ্রহণ করুন' : 'Accept Blood Request'}</span>
              </h3>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {request.patientName}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs">
                  {request.bloodGroup} Blood
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {request.hospitalName}, {request.hospitalLocation}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {isBn ? 'প্রয়োজনের তারিখ: ' : 'Required date: '}
                <strong>{formattedDate}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আবেদনকারীর উদ্দেশ্যে কোনো বার্তা (ঐচ্ছিক)' : 'Message for Requester (Optional)'}
              </label>
              <Textarea
                rows={3}
                placeholder={
                  isBn
                    ? 'যেমন: আমি রক্ত দিতে হাসপাতালে আসছি, সকাল ১০টায় পৌঁছাতে পারব...'
                    : 'e.g. I will arrive at the hospital by 10 AM to donate blood...'
                }
                value={acceptModalMessage}
                onChange={(e) => setAcceptModalMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={acceptLoading}
                onClick={() => setShowAcceptModal(false)}
                className="rounded-xl text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                size="sm"
                disabled={acceptLoading}
                onClick={() => handleRespond('accept', acceptModalMessage)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {acceptLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{isBn ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing...'}</span>
                  </span>
                ) : (
                  <span>{isBn ? 'অনুরোধ গ্রহণ নিশ্চিত করুন' : 'Confirm & Accept'}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Donation Modal (Requester / Admin only) */}
      {showCompleteModal && (
        <CompleteDonationModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          bloodRequest={request}
          donor={
            request.acceptedByUserId ||
            request.acceptedByDonorId || {
              _id: request.acceptedByUserId,
              name: request.acceptedByName,
              phone: request.acceptedByPhone,
            }
          }
          onSuccess={() => {
            fetchRequest();
          }}
        />
      )}
    </div>
  );
}
