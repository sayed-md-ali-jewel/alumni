'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { X, Droplet, ShieldCheck, HeartHandshake, AlertTriangle, Send } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BLOOD_REQUEST_URGENCIES } from '@/lib/types';
import { CHATTOGRAM_HOSPITALS, getHospitalDetails } from '@/lib/hospitals';

interface ContactDonorModalProps {
  donor: any;
  bloodRequest?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContactDonorModal({ donor, bloodRequest, isOpen, onClose, onSuccess }: ContactDonorModalProps) {
  const { data: session } = useSession();
  const { showToast, showLoginPrompt } = useSweetAlert();
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: bloodRequest?.urgency ? `${bloodRequest.urgency} Blood Request` : 'Blood required for an urgent patient',
    patientName: bloodRequest?.patientName || '',
    bloodGroup: bloodRequest?.bloodGroup || donor?.bloodGroup || 'O+',
    hospitalName: bloodRequest?.hospitalName || '',
    hospitalLocation: bloodRequest?.hospitalLocation || donor?.donorLocation || donor?.location || 'Chattogram, Bangladesh',
    urgency: bloodRequest?.urgency || 'Urgent',
    contactPhone: bloodRequest?.contactPhone || (session?.user as any)?.phone || '',
    message: bloodRequest?.patientName
      ? `Urgent blood request for ${bloodRequest.patientName} (${bloodRequest.requiredUnits || 1} Unit(s) ${bloodRequest.bloodGroup || donor.bloodGroup}) at ${bloodRequest.hospitalName}, ${bloodRequest.hospitalLocation}. Please contact if available.`
      : '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: bloodRequest?.urgency ? `${bloodRequest.urgency} Blood Request` : 'Blood required for an urgent patient',
        patientName: bloodRequest?.patientName || '',
        bloodGroup: bloodRequest?.bloodGroup || donor?.bloodGroup || 'O+',
        hospitalName: bloodRequest?.hospitalName || '',
        hospitalLocation: bloodRequest?.hospitalLocation || donor?.donorLocation || donor?.location || 'Chattogram, Bangladesh',
        urgency: bloodRequest?.urgency || 'Urgent',
        contactPhone: bloodRequest?.contactPhone || (session?.user as any)?.phone || '',
        message: bloodRequest?.patientName
          ? `Urgent blood request for ${bloodRequest.patientName} (${bloodRequest.requiredUnits || 1} Unit(s) ${bloodRequest.bloodGroup || donor.bloodGroup}) at ${bloodRequest.hospitalName}, ${bloodRequest.hospitalLocation}. Please contact if available.`
          : '',
      });
    }
  }, [isOpen, bloodRequest, donor, session]);

  if (!isOpen || !donor) return null;

  const user = donor.userId || donor;
  const currentUserId = (session?.user as any)?.id?.toString();
  const donorUserId = (donor?.userId?._id || donor?.userId || user?._id || donor?._id)?.toString();
  const isSelf = Boolean(currentUserId && donorUserId && currentUserId === donorUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!session) {
      showLoginPrompt(isBn ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please sign in to contact donors');
      return;
    }

    if (isSelf) {
      showToast({
        title: isBn ? 'অনুরোধ পাঠানো সম্ভব নয়' : 'Self-Request Not Allowed',
        text: isBn ? 'আপনি নিজের প্রোফাইলে রক্তের অনুরোধ পাঠাতে পারবেন না।' : 'You cannot send a blood donation request to your own profile.',
        type: 'error',
      });
      return;
    }

    if (!formData.patientName || !formData.hospitalName || !formData.contactPhone || !formData.message) {
      showToast({
        title: isBn ? 'সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill all required fields',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/blood-donation/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: donor._id || user._id,
          bloodRequestId: bloodRequest?._id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      showToast({
        title: isBn
          ? 'অনুরোধ পাঠানো হয়েছে!'
          : 'Request Sent Successfully!',
        text: isBn
          ? `${user?.name || 'রক্তদাতা'}-এর কাছে রক্তের অনুরোধ সরাসরি পৌঁছে দেওয়া হয়েছে এবং ট্র্যাকিংয়ে সংরক্ষণ করা হয়েছে।`
          : `Your blood request has been delivered directly to ${user?.name || 'the donor'} and tracked.`,
        type: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast({
        title: isBn ? 'ব্যর্থ হয়েছে' : 'Failed',
        text: err.message || 'Failed to send request',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 xs:px-6 py-4 xs:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 xs:gap-3">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <HeartHandshake className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base xs:text-lg leading-tight">
                {isBn ? `${user?.name}-কে রক্তের অনুরোধ পাঠান` : `Contact ${user?.name}`}
              </h3>
              <p className="text-xs text-rose-100 flex items-center gap-1.5 mt-0.5">
                <Droplet className="w-3 h-3 fill-current text-amber-200" />
                <span>{isBn ? `রক্তের গ্রুপ: ${donor.bloodGroup}` : `Blood Group: ${donor.bloodGroup}`}</span>
                <span>•</span>
                <span>{donor.group}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Self Warning Banner */}
        {isSelf && (
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-4 xs:px-6 py-2.5 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">
              {isBn
                ? 'এটি আপনার নিজস্ব প্রোফাইল। আপনি নিজের একাউন্টে রক্তের অনুরোধ পাঠাতে পারবেন না।'
                : 'This is your own profile. You cannot send a blood request to your own account.'}
            </span>
          </div>
        )}

        {/* Privacy Note */}
        {!isSelf && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-4 xs:px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {isBn
                ? 'নিরাপত্তা ও গোপনীয়তা বজায় রেখে দাতার কাছে আপনার বার্তাটি পৌঁছে দেওয়া হবে।'
                : "Privacy protected: Donor's direct contact is held securely until they choose to respond."}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 xs:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'রোগীর নাম *' : 'Patient Name *'}
              </label>
              <Input
                required
                placeholder={isBn ? 'রোগীর নাম' : 'e.g. Mrs. Fatema Begum'}
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'জরুরী অবস্থা *' : 'Urgency Level *'}
              </label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              >
                {BLOOD_REQUEST_URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'হাসপাতালের নাম *' : 'Hospital Name *'}
              </label>
              <Input
                required
                placeholder={isBn ? 'যেমন: চট্টগ্রাম মেডিকেল কলেজ' : 'e.g. Evercare Hospital'}
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">{isBn ? 'পরামর্শ:' : 'Popular:'}</span>
                {CHATTOGRAM_HOSPITALS.slice(0, 3).map((h) => (
                  <button
                    type="button"
                    key={h.name}
                    disabled={loading}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        hospitalName: h.name,
                        hospitalLocation: h.location || formData.hospitalLocation,
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    {h.name.replace(' Chattogram', '').replace(' Limited', '')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'হাসপাতালের স্থান / জেলা *' : 'Hospital Location *'}
              </label>
              <Input
                required
                placeholder={isBn ? 'যেমন: চট্টগ্রাম' : 'e.g. Chattogram'}
                value={formData.hospitalLocation}
                onChange={(e) => setFormData({ ...formData, hospitalLocation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'আপনার যোগাযোগের ফোন নম্বর *' : 'Your Contact Phone *'}
            </label>
            <Input
              required
              type="tel"
              placeholder="+880 1700-000000"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'অনুরোধের বিবরণ / বার্তা *' : 'Reason / Message for Donor *'}
            </label>
            <Textarea
              required
              rows={3}
              placeholder={
                isBn
                  ? 'রোগীর সমস্যা, রক্তের প্রয়োজনীয়তার সময় এবং অন্যান্য বিশেষ তথ্য লিখুন...'
                  : 'Specify the medical reason, required date/time, and any critical details...'
              }
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
              disabled={loading}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading || isSelf}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'অনুরোধ পাঠান' : 'Send Request'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
