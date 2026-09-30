'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { X, Droplet, Heart, CheckCircle2, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSweetAlert } from '@/components/ui/SweetAlert';

interface CompleteDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodRequest: any;
  donor: any;
  onSuccess?: () => void;
}

export function CompleteDonationModal({
  isOpen,
  onClose,
  bloodRequest,
  donor,
  onSuccess,
}: CompleteDonationModalProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast } = useSweetAlert();

  const [loading, setLoading] = useState(false);
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [donationTime, setDonationTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  if (!isOpen || !bloodRequest || !donor) return null;

  const donorUser = donor.donorId || donor.userId || donor;
  const donorId = donorUser?._id || donor.donorId || donor._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/blood-requests/${bloodRequest._id}/complete-donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId,
          unitsDonated: Number(unitsDonated) || 1,
          donationDate,
          donationTime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete donation');
      }

      showToast({
        title: isBn ? 'রক্তদান সম্পন্ন হয়েছে!' : 'Blood Donation Verified!',
        text: isBn
          ? `${donorUser?.name || 'রক্তদাতা'}-এর রক্তদান সফলভাবে রেকর্ড করা হয়েছে এবং ৩ মাসের বিশ্রামকাল প্রযোজ্য হয়েছে।`
          : `Donation by ${donorUser?.name || 'donor'} has been recorded. Donor entered a 3-month recovery schedule.`,
        type: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Failed to record donation completion',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 xs:px-6 py-4 xs:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 xs:gap-3">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base xs:text-lg leading-tight">
                {isBn ? 'রক্তদান সম্পন্ন নিশ্চিত করুন' : 'Confirm Blood Donation'}
              </h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span>{donorUser?.name || 'Alumni Donor'}</span>
                <span>•</span>
                <span>{bloodRequest.bloodGroup}</span>
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

        {/* 3-Month Recovery Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200/60 dark:border-emerald-900/40 px-4 xs:px-6 py-2.5 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            {isBn
              ? 'নিশ্চিত করলে দাতার প্রোফাইলে ৩ মাসের বিশ্রামকাল (Resting Period) স্বয়ংক্রিয়ভাবে কার্যকর হবে এবং রিকোয়েস্টের অগ্রগতি বৃদ্ধি পাবে।'
              : 'Completing this logs verified donation history, applies a 3-month recovery schedule for the donor, and updates request units.'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 xs:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{isBn ? 'রোগী / গ্রহীতা (Given To):' : 'Given To / Patient:'}</span>
              <span className="font-bold text-slate-900 dark:text-white">{bloodRequest.patientName}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{isBn ? 'হাসপাতাল:' : 'Hospital:'}</span>
              <span className="font-bold text-slate-900 dark:text-white">{bloodRequest.hospitalName}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{isBn ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
              <span className="font-black text-rose-600 dark:text-rose-400">{bloodRequest.bloodGroup}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'রক্তদানের তারিখ *' : 'Donation Date *'}
              </label>
              <Input
                type="date"
                required
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                className="rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'রক্তদানের সময় *' : 'Donation Time *'}
              </label>
              <Input
                type="time"
                required
                value={donationTime}
                onChange={(e) => setDonationTime(e.target.value)}
                className="rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'প্রদত্ত ব্যাগ সংখ্যা *' : 'Units Donated *'}
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              required
              value={unitsDonated}
              onChange={(e) => setUnitsDonated(parseInt(e.target.value, 10) || 1)}
              className="rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'মন্তব্য (Note - ঐচ্ছিক)' : 'Note (Optional)'}
            </label>
            <Textarea
              rows={2}
              placeholder={isBn ? 'উদাঃ জরুরি রক্তদান, সরাসরি রোগীকে দেওয়া হয়েছে...' : 'e.g. Emergency donation, Given directly to patient, etc.'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
              disabled={loading}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {loading ? (
                <span>{isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রক্তদান সম্পন্ন করুন' : 'Confirm & Complete'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
