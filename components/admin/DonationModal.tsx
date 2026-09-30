'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLocale } from 'next-intl';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  X,
  HeartHandshake,
  CreditCard,
  Building2,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  campaignsList?: string[];
}

const DEFAULT_CAMPAIGNS = [
  'Student Scholarship Endowment Fund',
  'Smart Classroom & AI Lab Renovation',
  'Emergency Student Medical Relief Fund',
  'General Alumni Endowment Fund',
  'Campus Tree Plantation & Green Initiative',
];

const PAYMENT_METHODS = [
  { id: 'bkash', label: 'bKash (বিকাশ)', color: 'text-pink-600' },
  { id: 'nagad', label: 'Nagad (নগদ)', color: 'text-orange-600' },
  { id: 'cash', label: 'Cash (নগদ সচিবালয় জমা)', color: 'text-emerald-600' },
  { id: 'bank', label: 'Bank Transfer (ব্যাংক ট্রান্সফার)', color: 'text-blue-600' },
  { id: 'card', label: 'Credit/Debit Card (কার্ড)', color: 'text-purple-600' },
  { id: 'rocket', label: 'Rocket (রকেট)', color: 'text-purple-700' },
  { id: 'upay', label: 'Upay (উপায়)', color: 'text-amber-600' },
];

export function DonationModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  campaignsList = [],
}: DonationModalProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast } = useSweetAlert();

  const isEditing = Boolean(initialData && initialData._id);

  const mergedCampaigns = Array.from(
    new Set([...DEFAULT_CAMPAIGNS, ...campaignsList.filter(Boolean)])
  );

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: 1000,
    campaign: mergedCampaigns[0] || 'Student Scholarship Endowment Fund',
    customCampaign: '',
    method: 'bkash',
    transactionId: '',
    receiptNumber: '',
    status: 'completed',
    isAnonymous: false,
    paidAt: new Date().toISOString().split('T')[0],
    givenTo: '',
    donationDate: new Date().toISOString().split('T')[0],
    donationTime: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const [useCustomCampaign, setUseCustomCampaign] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isCustom = !DEFAULT_CAMPAIGNS.includes(initialData.campaign);
        const pDate = initialData.paidAt
          ? new Date(initialData.paidAt).toISOString().split('T')[0]
          : initialData.donationDate
          ? new Date(initialData.donationDate).toISOString().split('T')[0]
          : initialData.createdAt
          ? new Date(initialData.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        setFormData({
          donorName: initialData.donorName || '',
          donorEmail: initialData.donorEmail || '',
          donorPhone: initialData.donorPhone || '',
          amount: initialData.amount || 1000,
          campaign: isCustom ? 'custom' : initialData.campaign || mergedCampaigns[0],
          customCampaign: isCustom ? initialData.campaign : '',
          method: initialData.method || 'bkash',
          transactionId: initialData.transactionId || '',
          receiptNumber: initialData.receiptNumber || '',
          status: initialData.status || 'completed',
          isAnonymous: Boolean(initialData.isAnonymous),
          paidAt: pDate,
          givenTo: initialData.givenTo || initialData.recipientName || '',
          donationDate: pDate,
          donationTime: initialData.donationTime || new Date().toTimeString().slice(0, 5),
          notes: initialData.notes || '',
        });
        setUseCustomCampaign(isCustom);
      } else {
        const todayDate = new Date().toISOString().split('T')[0];
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          amount: 1000,
          campaign: mergedCampaigns[0] || 'Student Scholarship Endowment Fund',
          customCampaign: '',
          method: 'bkash',
          transactionId: '',
          receiptNumber: '',
          status: 'completed',
          isAnonymous: false,
          paidAt: todayDate,
          givenTo: '',
          donationDate: todayDate,
          donationTime: new Date().toTimeString().slice(0, 5),
          notes: '',
        });
        setUseCustomCampaign(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.donorName.trim() || !formData.donorEmail.trim()) {
      showToast({
        title: isBn ? 'দাতার নাম ও ইমেইল আবশ্যক' : 'Donor Name & Email Required',
        type: 'error',
      });
      return;
    }

    if (!formData.amount || Number(formData.amount) < 10) {
      showToast({
        title: isBn ? 'সঠিক অনুদানের পরিমাণ দিন (সর্বনিম্ন ১০ টাকা)' : 'Minimum donation amount is 10 BDT',
        type: 'error',
      });
      return;
    }

    const finalCampaign = useCustomCampaign || formData.campaign === 'custom'
      ? formData.customCampaign.trim() || 'General Endowment Fund'
      : formData.campaign;

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/donations/${initialData._id}`
        : '/api/admin/donations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          campaign: finalCampaign,
          amount: Number(formData.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save donation record');
      }

      showToast({
        title: isEditing
          ? (isBn ? 'অনুদান তথ্য আপডেট হয়েছে' : 'Donation Updated Successfully')
          : (isBn ? 'নতুন অনুদান রেকর্ড তৈরি হয়েছে' : 'Donation Recorded Successfully'),
        text: isBn
          ? `${formData.donorName}-এর ${formData.amount} টাকার অনুদান সফলভাবে সংরক্ষিত হয়েছে।`
          : `Donation of ${formData.amount} BDT for ${formData.donorName} was saved.`,
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving donation:', err);
      showToast({
        title: isBn ? 'ব্যর্থ হয়েছে' : 'Operation Failed',
        text: err?.message || 'Failed to save donation record',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 xs:px-6 py-4 xs:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 xs:gap-3 min-w-0">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <HeartHandshake className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base xs:text-lg leading-tight truncate">
                {isEditing
                  ? (isBn ? 'অনুদান রেকর্ড সম্পাদনা' : 'Edit Donation Record')
                  : (isBn ? 'নতুন অনুদান রেকর্ড যোগ করুন' : 'Record New Donation')}
              </h3>
              <p className="text-[11px] xs:text-xs text-rose-100 mt-0.5 line-clamp-1">
                {isBn
                  ? 'অফলাইন ও অনলাইন তহবিলের জন্য অফিসিয়াল মানি রসিদ ও লেজার এন্ট্রি'
                  : 'Official Treasury ledger entry and receipt voucher generation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 xs:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Donor Information */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBn ? 'দাতার পরিচয় ও তথ্য' : 'Donor Information'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'দাতার নাম *' : 'Donor Name *'}
                </label>
                <Input
                  required
                  placeholder={isBn ? 'যেমন: ড. রফিকুল ইসলাম' : 'e.g. Dr. Rafiqul Islam'}
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                </label>
                <Input
                  required
                  type="email"
                  placeholder="donor@alumni.ac.bd"
                  value={formData.donorEmail}
                  onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ফোন নম্বর' : 'Phone Number'}
                </label>
                <Input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={formData.donorPhone}
                  onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
                <label htmlFor="isAnonymous" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  {isBn ? 'নাম গোপন রাখুন (Anonymous Donor)' : 'Keep Name Anonymous on Public Ledger'}
                </label>
              </div>
            </div>
          </div>

          {/* Donation & Campaign Details */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBn ? 'তহবিল ও অনুদানের পরিমাণ' : 'Campaign & Amount'}</span>
            </h4>

            {/* Campaign Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isBn ? 'ক্যাম্পেইন / তহবিল *' : 'Target Campaign / Endowment Fund *'}
              </label>

              {!useCustomCampaign ? (
                <div className="flex gap-2">
                  <select
                    value={formData.campaign}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setUseCustomCampaign(true);
                      } else {
                        setFormData({ ...formData, campaign: e.target.value });
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {mergedCampaigns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="custom">{isBn ? '➕ নতুন কাস্টম ক্যাম্পেইন...' : '➕ Custom Campaign Name...'}</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      required
                      placeholder={isBn ? 'কাস্টম ক্যাম্পেইনের নাম লিখুন...' : 'Enter custom campaign title...'}
                      value={formData.customCampaign}
                      onChange={(e) => setFormData({ ...formData, customCampaign: e.target.value })}
                      className="rounded-xl text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseCustomCampaign(false);
                        setFormData({ ...formData, campaign: mergedCampaigns[0] });
                      }}
                      className="rounded-xl text-xs shrink-0"
                    >
                      {isBn ? 'তালিকা থেকে পছন্দ করুন' : 'Pick from list'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Amount input & Quick Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isBn ? 'অনুদানের পরিমাণ (BDT) *' : 'Donation Amount (BDT) *'}
              </label>
              <div className="relative">
                <Input
                  required
                  type="number"
                  min={10}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                  className="rounded-xl text-sm font-black font-mono pl-9 text-emerald-600 dark:text-emerald-400"
                />
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">৳</span>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">{isBn ? 'কুইক:' : 'Quick:'}</span>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: q })}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      formData.amount === q
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    ৳{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment & Ledger Attributes */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBn ? 'পেমেন্ট মেথড ও লেনদেন স্ট্যাটাস' : 'Payment Method & Status'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'পেমেন্ট পদ্ধতি *' : 'Payment Method *'}
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'স্ট্যাটাস *' : 'Donation Status *'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="completed">{isBn ? '✓ সম্পন্ন / অনুমোদিত (Completed)' : '✓ Completed / Verified'}</option>
                  <option value="pending">{isBn ? '⏳ প্রক্রিয়াধীন (Pending Review)' : '⏳ Pending Review'}</option>
                  <option value="cancelled">{isBn ? '✗ বাতিল (Cancelled)' : '✗ Cancelled'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID'}
                </label>
                <Input
                  placeholder={isBn ? 'অটো-জেনারেট হবে' : 'Auto-generated if blank'}
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'রসিদ নম্বর (Receipt #)' : 'Receipt Number'}
                </label>
                <Input
                  placeholder={isBn ? 'অটো-জেনারেট হবে' : 'Auto-generated'}
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অনুদানের তারিখ (Date)' : 'Donation Date'}
                </label>
                <Input
                  type="date"
                  value={formData.paidAt}
                  onChange={(e) => setFormData({ ...formData, paidAt: e.target.value, donationDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অনুদানের সময় (Time)' : 'Donation Time'}
                </label>
                <Input
                  type="time"
                  value={formData.donationTime}
                  onChange={(e) => setFormData({ ...formData, donationTime: e.target.value })}
                  className="rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'গ্রহীতা (Given To / Recipient)' : 'Given To / Recipient'}
                </label>
                <Input
                  placeholder={isBn ? 'উদাঃ শিক্ষাবৃত্তি কমিটি / নির্দিষ্ট শিক্ষার্থী' : 'e.g. Scholarship Fund / Recipient'}
                  value={formData.givenTo}
                  onChange={(e) => setFormData({ ...formData, givenTo: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মন্তব্য (Note - ঐচ্ছিক)' : 'Note (Optional)'}
                </label>
                <Input
                  placeholder={isBn ? 'উদাঃ জরুরি অনুদান, সরাসরি রোগীকে দেওয়া হয়েছে...' : 'e.g. Emergency donation, Given directly to patient, etc.'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-xl text-xs px-6 shadow-md shadow-rose-600/20"
            >
              {loading
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : isEditing
                ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Record')
                : (isBn ? 'অনুদান রেকর্ড করুন' : 'Record Donation')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
