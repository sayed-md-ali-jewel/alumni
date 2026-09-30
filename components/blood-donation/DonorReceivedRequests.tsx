'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Textarea';
import {
  Droplet,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  AlertOctagon,
  Flame,
  Search,
  ExternalLink,
  RotateCcw,
  X,
  User,
  HeartHandshake,
  Layers,
  Inbox,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { formatDate } from '@/lib/utils';
import { isCompatibleDonor } from '@/lib/blood-compatibility';
import { CompleteDonationModal } from '@/components/blood-donation/CompleteDonationModal';

export function DonorReceivedRequests() {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast, showLoginPrompt } = useSweetAlert();

  // Tab: 'all' = All Requests across the alumni network; 'direct' = Requests sent directly to me
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'direct'>('all');

  // All Requests State
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [allFilterStatus, setAllFilterStatus] = useState<string>('all');
  const [allLoading, setAllLoading] = useState(true);

  // Direct Responses State
  const [responses, setResponses] = useState<any[]>([]);
  const [directFilterStatus, setDirectFilterStatus] = useState('all');
  const [directLoading, setDirectLoading] = useState(false);
  const [directCounts, setDirectCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    completed: 0,
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<any>(null);

  // Action Loading ID
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Accept / Decline Modal State
  const [activeModal, setActiveModal] = useState<{
    request: any;
    action: 'accept' | 'decline';
  } | null>(null);
  const [modalMessage, setModalMessage] = useState('');

  // Complete Donation Modal State
  const [completeModalRequest, setCompleteModalRequest] = useState<any | null>(null);

  const currentUserId = (session?.user as any)?.id;

  // Load User Profile for Blood Group
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
          console.error('Error loading profile in DonorReceivedRequests:', e);
        }
      }
    }
    loadProfile();
  }, [session?.user]);

  const currentUserBloodGroup =
    userProfile?.bloodGroup || (session?.user as any)?.bloodGroup || '';

  // Fetch All Requests
  const fetchAllRequests = async () => {
    try {
      setAllLoading(true);
      const url =
        allFilterStatus === 'all'
          ? '/api/blood-requests?status=all&limit=50'
          : `/api/blood-requests?status=${encodeURIComponent(allFilterStatus)}&limit=50`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.requests) {
        setAllRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching all requests:', err);
    } finally {
      setAllLoading(false);
    }
  };

  // Fetch Direct Received Requests
  const fetchDirectRequests = async () => {
    try {
      setDirectLoading(true);
      const res = await fetch(`/api/blood-requests/responses?role=donor&status=${directFilterStatus}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.responses) {
        setResponses(data.responses);
        if (data.counts) {
          setDirectCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Error fetching direct received requests:', err);
    } finally {
      setDirectLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      if (activeMainTab === 'all') {
        fetchAllRequests();
      } else {
        fetchDirectRequests();
      }
    }
  }, [session?.user, activeMainTab, allFilterStatus, directFilterStatus]);

  const handleRefresh = () => {
    if (activeMainTab === 'all') {
      fetchAllRequests();
    } else {
      fetchDirectRequests();
    }
  };

  const handleRespond = async (bloodRequestId: string, action: 'accept' | 'decline', message?: string) => {
    if (actionLoadingId) return;
    if (!session) {
      showLoginPrompt(isBn ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please sign in to respond');
      return;
    }

    setActionLoadingId(bloodRequestId);
    try {
      const res = await fetch(`/api/blood-requests/${bloodRequestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          message: action === 'accept' ? message : undefined,
          declineReason: action === 'decline' ? message : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to respond');
      }

      showToast({
        title: action === 'accept'
          ? (isBn ? 'অনুরোধ গ্রহণ করা হয়েছে!' : 'Request Accepted!')
          : (isBn ? 'অনুরোধ প্রত্যাখ্যান করা হয়েছে' : 'Request Declined'),
        text: data.message,
        type: action === 'accept' ? 'success' : 'info',
      });

      setActiveModal(null);
      setModalMessage('');
      handleRefresh();
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Failed to respond to blood request',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Main Tabs */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isBn ? 'রক্তের আবেদন ও অনুরোধ' : 'Blood Donation Requests'}</span>
                {currentUserBloodGroup && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-black">
                    {currentUserBloodGroup}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'সকল সক্রিয় রক্তের আবেদন পর্যালোচনা করুন, সরাসরি গ্রহণ করুন বা উপযুক্ত রক্তদাতা খুঁজুন।'
                  : 'Review all active blood requests, accept matching requests, or find donors.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>
        </div>

        {/* Main Mode Tabs: All Requests vs Direct Requests */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveMainTab('all')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeMainTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-rose-500" />
            <span>{isBn ? 'সকল রক্তের আবেদন (All Requests)' : 'All Blood Requests'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('direct')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all relative ${
              activeMainTab === 'direct'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4 text-rose-500" />
            <span>{isBn ? 'আমাকে পাঠানো অনুরোধ' : 'Direct Requests Sent to Me'}</span>
            {directCounts.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            )}
          </button>
        </div>

        {/* Sub-Filter Pills */}
        {activeMainTab === 'all' ? (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {[
              { id: 'all', label: isBn ? 'সকল আবেদন' : 'All Requests' },
              { id: 'Open', label: isBn ? 'অপেক্ষমান (Open)' : 'Open / Pending' },
              { id: 'Accepted', label: isBn ? 'গৃহীত (Accepted)' : 'Accepted' },
              { id: 'Fulfilled', label: isBn ? 'সম্পন্ন (Fulfilled)' : 'Fulfilled / Completed' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAllFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  allFilterStatus === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDirectFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                directFilterStatus === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isBn ? `সকল (${directCounts.total})` : `All (${directCounts.total})`}
            </button>
            <button
              type="button"
              onClick={() => setDirectFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                directFilterStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{isBn ? `নতুন (${directCounts.pending})` : `Pending (${directCounts.pending})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setDirectFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                directFilterStatus === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBn ? `গৃহীত (${directCounts.accepted})` : `Accepted (${directCounts.accepted})`}</span>
            </button>
            <button
              type="button"
              onClick={() => setDirectFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                directFilterStatus === 'completed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? `সম্পন্ন (${directCounts.completed})` : `Completed (${directCounts.completed})`}</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ALL ACTIVE BLOOD REQUESTS */}
      {/* ========================================================================= */}
      {activeMainTab === 'all' && (
        <>
          {allLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-60 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : allRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <Droplet className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                {isBn ? 'কোনো রক্তের আবেদন পাওয়া যায়নি' : 'No blood requests found'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'এই মুহূর্তে কোনো সক্রিয় রক্তের আবেদন নেই।'
                  : 'There are currently no active blood requests under this category.'}
              </p>
              <Link href="/blood-requests/create" className="inline-block mt-2">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                  {isBn ? '+ নতুন রক্তের আবেদন পোস্ট করুন' : '+ Post a Blood Request'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allRequests.map((req: any) => {
                const isEmergency = req.urgency === 'Emergency';
                const isUrgent = req.urgency === 'Urgent';
                const isFulfilled = req.status === 'Fulfilled';
                const isAccepted = req.status === 'Accepted';
                const isCreator = Boolean(
                  currentUserId &&
                    (req.requesterId?._id?.toString() === currentUserId.toString() ||
                      req.requesterId?.toString() === currentUserId.toString())
                );
                const isAcceptedByMe = Boolean(
                  currentUserId &&
                    req.acceptedByUserId &&
                    (req.acceptedByUserId._id?.toString() === currentUserId.toString() ||
                      req.acceptedByUserId.toString() === currentUserId.toString())
                );
                const isCompatible = isCompatibleDonor(currentUserBloodGroup, req.bloodGroup);

                return (
                  <Card
                    key={req._id}
                    className={`border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isEmergency
                        ? 'border-red-300 dark:border-red-900/80 ring-1 ring-red-500/20'
                        : isAccepted
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Urgency Strip */}
                    <div
                      className={`h-1.5 w-full ${
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

                    <CardContent className="p-6 space-y-4">
                      {/* Patient, Blood Badge & Urgency */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-white ${
                                isEmergency
                                  ? 'bg-red-600 animate-pulse'
                                  : isUrgent
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                            >
                              {isEmergency && <AlertOctagon className="w-3 h-3" />}
                              {isUrgent && <Flame className="w-3 h-3" />}
                              <span>{req.urgency || 'Urgent'}</span>
                            </span>

                            <Badge
                              variant={isFulfilled ? 'success' : isAccepted ? 'warning' : 'default'}
                              className={`text-[10px] py-0.5 ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
                                  : ''
                              }`}
                            >
                              {isAccepted ? (isBn ? 'গৃহীত' : 'Accepted') : req.status}
                            </Badge>

                            {isCreator && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold">
                                {isBn ? 'আমার আবেদন' : 'My Request'}
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-lg text-slate-900 dark:text-white truncate">
                            {req.patientName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {req.requiredUnits || 1} {isBn ? 'ব্যাগ রক্তের প্রয়োজন' : 'Unit(s) Needed'}
                          </p>
                        </div>

                        {/* Blood Group Badge */}
                        <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-sm font-black text-base shrink-0">
                          <span>{req.bloodGroup}</span>
                          <span className="text-[8px] uppercase tracking-wider text-rose-100">BLOOD</span>
                        </div>
                      </div>

                      {/* Hospital & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold truncate">{req.hospitalName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{req.hospitalLocation}</span>
                        </div>

                        {req.requiredDate && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 sm:col-span-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                              {isBn ? 'প্রয়োজনের তারিখ: ' : 'Needed by: '}
                              <strong>{formatDate(req.requiredDate, locale)}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Accepted Status Banner */}
                      {isAccepted && (
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {isBn
                                  ? `✓ রক্তদাতা গ্রহণ করেছেন: ${req.acceptedByName || 'Alumni Donor'}`
                                  : `✓ Accepted by: ${req.acceptedByName || 'Alumni Donor'}`}
                              </span>
                            </span>
                          </div>
                          {isAcceptedByMe ? (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                              {isBn
                                ? 'আপনি এই আবেদনটি গ্রহণ করেছেন।'
                                : 'You accepted this request.'}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {isBn
                                ? 'রক্তদানের সমন্বয় চলছে।'
                                : 'Donation is being coordinated.'}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        {isFulfilled ? (
                          <Link href={`/blood-requests/${req._id}`} className="block">
                            <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                              <span>{isBn ? 'সম্পন্ন আবেদন দেখুন' : 'View Fulfilled Request'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        ) : isAccepted ? (
                          <div className="flex items-center gap-2">
                            <Link href={`/blood-requests/${req._id}`} className="flex-1">
                              <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                                <span>{isBn ? 'বিবরণ দেখুন' : 'View Details'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>

                            {isCreator && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setCompleteModalRequest(req)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                <span>{isBn ? 'সম্পন্ন করুন' : 'Mark Fulfilled'}</span>
                              </Button>
                            )}

                            {isAcceptedByMe && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === req._id}
                                onClick={() => handleRespond(req._id, 'decline')}
                                className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs rounded-xl shrink-0"
                              >
                                <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
                              </Button>
                            )}
                          </div>
                        ) : isCreator ? (
                          <div className="flex items-center gap-2">
                            <Link href={`/blood-requests/${req._id}`} className="w-full">
                              <Button
                                type="button"
                                size="sm"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                              >
                                <Search className="w-3.5 h-3.5 text-rose-400" />
                                <span>{isBn ? 'রক্তদাতা খুঁজুন ও পরিচালনা করুন' : 'Find Donors & Manage'}</span>
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {isCompatible ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={actionLoadingId === req._id}
                                  onClick={() => setActiveModal({ request: req, action: 'accept' })}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'আমি দেব (Accept)' : 'Accept Request'}</span>
                                </Button>

                                <Link href={`/blood-requests/${req._id}`} className="block">
                                  <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                                    <span>{isBn ? 'বিবরণ' : 'Details'}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Link href={`/blood-requests/${req._id}`} className="w-full">
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                                  >
                                    <Search className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{isBn ? `উপযুক্ত ${req.bloodGroup} রক্তদাতা খুঁজুন` : `Find / Request ${req.bloodGroup} Donor`}</span>
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DIRECT REQUESTS SENT TO ME */}
      {/* ========================================================================= */}
      {activeMainTab === 'direct' && (
        <>
          {directLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-60 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <Droplet className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                {isBn ? 'আপনাকে পাঠানো কোনো সরাসরি রক্তের অনুরোধ নেই' : 'No direct requests received yet'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'অন্যান্য সদস্য রক্তের প্রয়োজনে সরাসরি যোগাযোগ করলে তা এখানে দৃশ্যমান হবে।'
                  : 'When alumni send direct requests to your profile, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {responses.map((resp: any) => {
                const req = resp.bloodRequestId;
                const requester = req?.requesterId || resp.requesterId || {};
                const isEmergency = req?.urgency === 'Emergency';
                const isUrgent = req?.urgency === 'Urgent';
                const status = resp.status || 'pending';
                const isPending = status === 'pending';
                const isAccepted = status === 'accepted';
                const isDeclined = status === 'declined';
                const isCompleted = status === 'completed';

                return (
                  <Card
                    key={resp._id}
                    className={`border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isEmergency
                        ? 'border-red-300 dark:border-red-900/80 ring-1 ring-red-500/20'
                        : isAccepted
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div
                      className={`h-1.5 w-full ${
                        isAccepted
                          ? 'bg-emerald-500'
                          : isCompleted
                          ? 'bg-blue-600'
                          : isEmergency
                          ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                          : isUrgent
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-white ${
                                isEmergency
                                  ? 'bg-red-600 animate-pulse'
                                  : isUrgent
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                            >
                              {isEmergency && <AlertOctagon className="w-3 h-3" />}
                              {isUrgent && <Flame className="w-3 h-3" />}
                              <span>{req?.urgency || 'Urgent'}</span>
                            </span>

                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {req?.requiredUnits || 1} {isBn ? 'ব্যাগ প্রয়োজন' : 'Unit(s) Needed'}
                            </span>
                          </div>

                          <h4 className="font-black text-lg text-slate-900 dark:text-white">
                            {req?.patientName}
                          </h4>
                        </div>

                        <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-sm font-black text-sm shrink-0">
                          <span>{req?.bloodGroup || resp.bloodGroup || 'O+'}</span>
                          <span className="text-[8px] uppercase tracking-wider text-rose-100">BLOOD</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold truncate">{req?.hospitalName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{req?.hospitalLocation}</span>
                        </div>

                        {req?.requiredDate && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 sm:col-span-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-semibold">{formatDate(req.requiredDate, locale)}</span>
                          </div>
                        )}
                      </div>

                      {(req?.additionalInformation || resp.message) && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 italic line-clamp-2">
                          &ldquo;{req?.additionalInformation || resp.message}&rdquo;
                        </p>
                      )}

                      {/* Status Banner */}
                      {isAccepted && (
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{isBn ? '✓ আপনি এই অনুরোধটি গ্রহণ করেছেন' : '✓ You accepted this request'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90">
                            {isBn
                              ? 'অনুগ্রহ করে নিচে উল্লেখিত নম্বরে যোগাযোগ করে হাসপাতালে পৌঁছান।'
                              : 'Please coordinate with the patient contact below.'}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        {isPending && (
                          <div className="grid grid-cols-2 gap-2.5">
                            <Button
                              type="button"
                              size="sm"
                              disabled={actionLoadingId === req?._id}
                              onClick={() => setActiveModal({ request: req, action: 'accept' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'গ্রহণ করুন (Accept)' : 'Accept Request'}</span>
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === req?._id}
                              onClick={() => setActiveModal({ request: req, action: 'decline' })}
                              className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs rounded-xl flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{isBn ? 'অপারগ (Decline)' : 'Decline'}</span>
                            </Button>
                          </div>
                        )}

                        {isAccepted && (
                          <div className="space-y-2">
                            {req?.contactPhone && (
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`tel:${req.contactPhone}`}
                                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'কল করুন' : 'Call Now'}</span>
                                </a>
                                <a
                                  href={`https://wa.me/${req.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Assalamu Alaikum, I have accepted your blood request for ${req.patientName} at ${req.hospitalName}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <Link href={`/blood-requests/${req?._id}`} className="flex-1">
                                <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                                  <span>{isBn ? 'সম্পূর্ণ বিবরণ' : 'View Request'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </Link>

                              <button
                                type="button"
                                onClick={() => setActiveModal({ request: req, action: 'decline' })}
                                className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold px-2 py-1"
                              >
                                {isBn ? 'অপারগ হলে বাতিল করুন' : 'Change to Decline'}
                              </button>
                            </div>
                          </div>
                        )}

                        {isDeclined && (
                          <div className="flex items-center justify-between gap-2">
                            <Link href={`/blood-requests/${req?._id}`} className="flex-1">
                              <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                                <span>{isBn ? 'বিবরণ দেখুন' : 'View Request'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleRespond(req?._id, 'accept')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                            >
                              <span>{isBn ? 'পুনরায় গ্রহণ করুন' : 'Re-Accept'}</span>
                            </Button>
                          </div>
                        )}

                        {isCompleted && (
                          <Link href={`/blood-requests/${req?._id}`} className="block">
                            <Button type="button" variant="outline" size="sm" className="w-full text-xs rounded-xl flex items-center justify-center gap-1">
                              <span>{isBn ? 'আবেদনের অবস্থা দেখুন' : 'View Request'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* ACCEPT / DECLINE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {activeModal.action === 'accept' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{isBn ? 'রক্তের অনুরোধ গ্রহণ নিশ্চিত করুন' : 'Accept Blood Request'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>{isBn ? 'অনুরোধ প্রত্যাখ্যান নিশ্চিত করুন' : 'Decline Blood Request'}</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {activeModal.request.patientName} ({activeModal.request.bloodGroup} Blood)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {activeModal.request.hospitalName}, {activeModal.request.hospitalLocation}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeModal.action === 'accept'
                  ? (isBn ? 'আবেদনকারীর উদ্দেশ্যে কোনো বার্তা (ঐচ্ছিক)' : 'Message for Requester (Optional)')
                  : (isBn ? 'অপারগতার কারণ (ঐচ্ছিক)' : 'Reason for Declining (Optional)')}
              </label>
              <Textarea
                rows={3}
                placeholder={
                  activeModal.action === 'accept'
                    ? (isBn ? 'যেমন: আমি আগামীকাল সকাল ১০টায় হাসপাতালে পৌঁছাতে পারব...' : 'e.g. I will reach the hospital by 10 AM tomorrow...')
                    : (isBn ? 'যেমন: বর্তমানে জ্বরে আক্রান্ত / শহরের বাইরে অবস্থান করছি...' : 'e.g. Currently out of town / feeling unwell...')
                }
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={Boolean(actionLoadingId)}
                onClick={() => setActiveModal(null)}
                className="rounded-xl text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={Boolean(actionLoadingId)}
                onClick={() => handleRespond(activeModal.request._id, activeModal.action, modalMessage)}
                className={`rounded-xl text-xs font-bold text-white disabled:opacity-60 ${
                  activeModal.action === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoadingId === activeModal.request._id ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{isBn ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                  </span>
                ) : activeModal.action === 'accept' ? (
                  (isBn ? 'নিশ্চিত ও গ্রহণ করুন' : 'Confirm & Accept')
                ) : (
                  (isBn ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Decline')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Donation Modal (for requesters in Profile) */}
      {completeModalRequest && (
        <CompleteDonationModal
          isOpen={!!completeModalRequest}
          onClose={() => setCompleteModalRequest(null)}
          bloodRequest={completeModalRequest}
          donor={
            completeModalRequest.acceptedByUserId ||
            completeModalRequest.acceptedByDonorId || {
              _id: completeModalRequest.acceptedByUserId,
              name: completeModalRequest.acceptedByName,
              phone: completeModalRequest.acceptedByPhone,
            }
          }
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
