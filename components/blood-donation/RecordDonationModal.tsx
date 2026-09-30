'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Droplet,
  Heart,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  MapPin,
  X,
  CheckCircle2,
  Sparkles,
  Info,
  User,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BLOOD_GROUPS } from '@/lib/types';
import { calculateNextEligibleDate, formatDate } from '@/lib/utils';
import { CHATTOGRAM_HOSPITALS, getHospitalDetails } from '@/lib/hospitals';

interface RecordDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultData?: {
    bloodRequestId?: string;
    recipientId?: string;
    recipientName?: string;
    patientName?: string;
    donorUserId?: string;
    donorName?: string;
    bloodGroup?: string;
    hospitalName?: string;
    location?: string;
    unitsDonated?: number;
  };
}

export function RecordDonationModal({
  isOpen,
  onClose,
  onSuccess,
  defaultData,
}: RecordDonationModalProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast, showLoginPrompt } = useSweetAlert();

  const [loading, setLoading] = useState(false);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5); // e.g. "14:30"

  const [formData, setFormData] = useState({
    recipientId: '',
    recipientName: '',
    givenTo: '',
    donationDate: todayStr,
    donationTime: nowTimeStr,
    bloodGroup: defaultData?.bloodGroup || 'O+',
    unitsDonated: defaultData?.unitsDonated || 1,
    hospitalName: defaultData?.hospitalName || '',
    location: defaultData?.location || 'Chattogram, Bangladesh',
    notes: '',
  });

  const [isCustomRecipient, setIsCustomRecipient] = useState(false);

  // Fetch existing recipients (Blood requests and alumni users)
  useEffect(() => {
    if (isOpen) {
      setRecipientsLoading(true);
      fetch('/api/blood-donation/recipients')
        .then((res) => (res.ok ? res.json() : { recipients: [] }))
        .then((data) => {
          setRecipients(data.recipients || []);
        })
        .catch((err) => console.error('Error fetching recipients:', err))
        .finally(() => setRecipientsLoading(false));
    }
  }, [isOpen]);

  // Calculate live preview of next eligible date
  const previewNextDate = calculateNextEligibleDate(formData.donationDate || todayStr);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      const initialRecipientName =
        defaultData?.recipientName || defaultData?.patientName || '';
      const initialRecipientId =
        defaultData?.recipientId || defaultData?.bloodRequestId || '';

      setFormData({
        recipientId: initialRecipientId,
        recipientName: initialRecipientName,
        givenTo: initialRecipientName,
        donationDate: todayStr,
        donationTime: nowTimeStr,
        bloodGroup: defaultData?.bloodGroup || (session?.user as any)?.bloodGroup || 'O+',
        unitsDonated: defaultData?.unitsDonated || 1,
        hospitalName: defaultData?.hospitalName || '',
        location: defaultData?.location || 'Chattogram, Bangladesh',
        notes: '',
      });

      setIsCustomRecipient(Boolean(initialRecipientName && !initialRecipientId));
    }
  }, [isOpen, defaultData, session]);

  if (!isOpen) return null;

  const handleRecipientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomRecipient(true);
      setFormData((prev) => ({
        ...prev,
        recipientId: '',
      }));
    } else {
      setIsCustomRecipient(false);
      const found = recipients.find((r) => r.id === val);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          recipientId: found.id,
          recipientName: found.name,
          givenTo: found.name,
          hospitalName: found.hospitalName || prev.hospitalName,
          bloodGroup: found.bloodGroup || prev.bloodGroup,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          recipientId: '',
          recipientName: '',
          givenTo: '',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!session) {
      showLoginPrompt(isBn ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please sign in to record blood donation');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/blood-donation/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipientName: formData.recipientName || formData.givenTo,
          givenTo: formData.givenTo || formData.recipientName,
          bloodRequestId: defaultData?.bloodRequestId || (recipients.find((r) => r.id === formData.recipientId && r.type === 'blood_request')?.id),
          donorUserId: defaultData?.donorUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record donation');
      }

      showToast({
        title: isBn ? 'রক্তদান রেকর্ড সফল!' : 'Donation Recorded!',
        text: isBn
          ? 'আপনার রক্তদানের তথ্য সংরক্ষিত হয়েছে এবং পরবর্তী উপযুক্ত তারিখ নির্ধারণ করা হয়েছে।'
          : 'Your donation has been recorded. Next eligible donation date has been calculated.',
        type: 'success',
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Error recording donation',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white px-4 xs:px-6 py-4 xs:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 xs:gap-3 min-w-0">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Droplet className="w-4 h-4 xs:w-5 xs:h-5 fill-current text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base xs:text-lg leading-tight truncate">
                {isBn ? 'রক্তদান রেকর্ড করুন' : 'Record Blood Donation'}
              </h3>
              <p className="text-[11px] xs:text-xs text-rose-100 mt-0.5 line-clamp-1">
                {defaultData?.donorName
                  ? isBn
                    ? `${defaultData.donorName}-এর রক্তদান নিশ্চিত করুন`
                    : `Confirming donation for ${defaultData.donorName}`
                  : isBn
                  ? 'গ্রহীতা, রক্তদানের তারিখ, সময় ও অন্যান্য বিবরণ সংরক্ষণ করুন'
                  : 'Log recipient, date, time and recovery schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white disabled:opacity-50 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 xs:p-6 overflow-y-auto custom-scrollbar space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informational Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-200">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'রক্তদান নিশ্চিত করলে আপনার পরবর্তী রক্তদানের সম্ভাব্য তারিখ ৩ মাস (+৩ মাস) স্বয়ংক্রিয়ভাবে হিসাব করা হবে।'
                  : 'Confirming this donation automatically computes your next eligible donation date (+3 months).'}
              </span>
            </div>

            {/* Given To / Recipient Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isBn ? 'রক্তগ্রহীতা (Given To / Recipient)' : 'Given To / Recipient'} *</span>
                </span>
                {!isCustomRecipient ? (
                  <button
                    type="button"
                    onClick={() => setIsCustomRecipient(true)}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    {isBn ? '+ নাম সরাসরি লিখুন' : '+ Enter custom name'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustomRecipient(false)}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    {isBn ? 'তালিকা থেকে নির্বাচন করুন' : 'Select from list'}
                  </button>
                )}
              </label>

              {!isCustomRecipient ? (
                <select
                  value={formData.recipientId || (formData.recipientName ? 'custom' : '')}
                  disabled={loading || recipientsLoading}
                  onChange={handleRecipientSelect}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold disabled:opacity-60"
                >
                  <option value="">{isBn ? '-- রক্তগ্রহীতা নির্বাচন করুন --' : '-- Select Recipient --'}</option>
                  {recipients.length > 0 && (
                    <>
                      <optgroup label={isBn ? 'সক্রিয় রক্তের আবেদনকারী / রোগী' : 'Active Patient Blood Requests'}>
                        {recipients
                          .filter((r) => r.type === 'blood_request')
                          .map((r) => (
                            <option key={`req-${r.id}`} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label={isBn ? 'অ্যালামনাই সদস্য' : 'Alumni Members'}>
                        {recipients
                          .filter((r) => r.type === 'user')
                          .map((r) => (
                            <option key={`user-${r.id}`} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                      </optgroup>
                    </>
                  )}
                  <option value="custom">{isBn ? 'অন্যান্য / সরাসরি গ্রহীতার নাম লিখুন...' : 'Other / Enter recipient name directly...'}</option>
                </select>
              ) : (
                <Input
                  type="text"
                  required
                  disabled={loading}
                  placeholder={isBn ? 'রোগী বা রক্তগ্রহীতার পুরো নাম...' : 'Patient or recipient full name...'}
                  value={formData.givenTo || formData.recipientName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      givenTo: e.target.value,
                      recipientName: e.target.value,
                    })
                  }
                  className="rounded-xl text-xs font-medium"
                />
              )}
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Donation Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isBn ? 'রক্তদানের তারিখ (Date)' : 'Donation Date'} *</span>
                </label>
                <Input
                  type="date"
                  required
                  disabled={loading}
                  value={formData.donationDate}
                  max={todayStr}
                  onChange={(e) => setFormData({ ...formData, donationDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Donation Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isBn ? 'রক্তদানের সময় (Time)' : 'Donation Time'} *</span>
                </label>
                <Input
                  type="time"
                  required
                  disabled={loading}
                  value={formData.donationTime}
                  onChange={(e) => setFormData({ ...formData, donationTime: e.target.value })}
                  className="rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isBn ? 'রক্তের গ্রুপ' : 'Blood Group'} *</span>
                </label>
                <select
                  value={formData.bloodGroup}
                  disabled={loading}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold disabled:opacity-60"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isBn ? 'প্রদত্ত ব্যাগ সংখ্যা' : 'Units Donated'} *</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  required
                  disabled={loading}
                  value={formData.unitsDonated}
                  onChange={(e) => setFormData({ ...formData, unitsDonated: Number(e.target.value) || 1 })}
                  className="rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Hospital with quick suggestion chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{isBn ? 'হাসপাতালের নাম (ঐচ্ছিক)' : 'Hospital / Clinic (Optional)'}</span>
              </label>
              <Input
                type="text"
                disabled={loading}
                placeholder={isBn ? 'উদাঃ এভারকেয়ার হাসপাতাল' : 'e.g. Evercare Hospital'}
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="rounded-xl text-xs"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">{isBn ? 'পরামর্শ:' : 'Quick select:'}</span>
                {CHATTOGRAM_HOSPITALS.slice(0, 4).map((h) => (
                  <button
                    type="button"
                    key={h.name}
                    disabled={loading}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        hospitalName: h.name,
                        location: h.location || formData.location,
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    {h.name.replace(' Chattogram', '').replace(' Limited', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{isBn ? 'জেলা / এলাকা (ঐচ্ছিক)' : 'Location / District (Optional)'}</span>
              </label>
              <Input
                type="text"
                disabled={loading}
                placeholder={isBn ? 'উদাঃ ঢাকা, চট্টগ্রাম, সিলেট' : 'e.g. Dhaka, Chattogram'}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'মন্তব্য (Note - ঐচ্ছিক)' : 'Note (Optional)'}
              </label>
              <Textarea
                rows={2}
                disabled={loading}
                placeholder={isBn ? 'উদাঃ জরুরি রক্তদান, সরাসরি রোগীকে দেওয়া হয়েছে ইত্যাদি...' : 'e.g. Emergency donation, Given directly to patient, etc.'}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Next Eligible Date Preview */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                  {isBn ? 'স্বয়ংক্রিয় পরবর্তী উপযুক্ত তারিখ (+৩ মাস):' : 'Automatic Next Eligible Date (+3 months):'}
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {formatDate(previewNextDate, locale)}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                {isBn ? '৩ মাস বিশ্রাম' : '3 Mo. Rest'}
              </span>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 xs:gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="w-full xs:w-auto rounded-xl text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full xs:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs gap-2 shadow-lg shadow-rose-600/25 disabled:opacity-60 disabled:cursor-not-allowed py-2 px-5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{isBn ? 'রক্তদান নিশ্চিত করুন' : 'Confirm Donation'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
