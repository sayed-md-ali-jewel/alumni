'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useLocale } from 'next-intl';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  X,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
} from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const CATEGORIES = [
  { id: 'Scholarship', label_en: 'Scholarship', label_bn: 'শিক্ষাবৃত্তি' },
  { id: 'Infrastructure', label_en: 'Infrastructure', label_bn: 'অবকাঠামো ও ল্যাব' },
  { id: 'Medical', label_en: 'Medical Relief', label_bn: 'চিকিৎসা সহায়তা' },
  { id: 'Relief', label_en: 'Emergency Relief', label_bn: 'জরুরি ত্রাণ' },
  { id: 'General', label_en: 'General Welfare', label_bn: 'সাধারণ কল্যাণ' },
  { id: 'Endowment', label_en: 'Endowment Fund', label_bn: 'স্থায়ী এনডাউমেন্ট' },
  { id: 'Sports', label_en: 'Sports & Culture', label_bn: 'ক্রীড়া ও সংস্কৃতি' },
  { id: 'Technology', label_en: 'Technology & AI', label_bn: 'প্রযুক্তি ও এআই' },
];

export function CampaignModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CampaignModalProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast } = useSweetAlert();

  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    goal: 500000,
    category: 'Scholarship',
    image: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title_en: initialData.title_en || '',
          title_bn: initialData.title_bn || '',
          description_en: initialData.description_en || '',
          description_bn: initialData.description_bn || '',
          goal: initialData.goal || 500000,
          category: initialData.category || 'Scholarship',
          image: initialData.image || '',
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          endDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : '',
          status: initialData.status || 'active',
          isFeatured: Boolean(initialData.isFeatured),
        });
      } else {
        setFormData({
          title_en: '',
          title_bn: '',
          description_en: '',
          description_bn: '',
          goal: 500000,
          category: 'Scholarship',
          image: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'active',
          isFeatured: false,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const quickGoals = [100000, 250000, 500000, 750000, 1000000, 2500000, 5000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en.trim() || !formData.title_bn.trim()) {
      showToast({
        title: isBn ? 'ইংরেজি ও বাংলা শিরোনাম আবশ্যক' : 'English & Bengali titles are required',
        type: 'error',
      });
      return;
    }

    if (!formData.description_en.trim() || !formData.description_bn.trim()) {
      showToast({
        title: isBn ? 'ইংরেজি ও বাংলা বিবরণ আবশ্যক' : 'Descriptions are required',
        type: 'error',
      });
      return;
    }

    if (!formData.goal || Number(formData.goal) < 1000) {
      showToast({
        title: isBn ? 'সঠিক লক্ষ্যমাত্রা নির্ধারণ করুন (ন্যূনতম ১,০০০ টাকা)' : 'Minimum goal is 1,000 BDT',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/campaigns/${initialData._id}`
        : '/api/admin/campaigns';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal: Number(formData.goal),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save campaign');
      }

      showToast({
        title: isEditing
          ? (isBn ? 'ক্যাম্পেইন আপডেট হয়েছে' : 'Campaign Updated Successfully')
          : (isBn ? 'নতুন ক্যাম্পেইন তৈরি হয়েছে' : 'Campaign Created Successfully'),
        text: isBn
          ? `"${formData.title_bn}" সফলভাবে সংরক্ষিত হয়েছে।`
          : `"${formData.title_en}" was saved successfully.`,
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      showToast({
        title: isBn ? 'ব্যর্থ হয়েছে' : 'Operation Failed',
        text: err?.message || 'Failed to save campaign',
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
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 xs:px-6 py-4 xs:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 xs:gap-3 min-w-0">
            <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Building2 className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base xs:text-lg leading-tight truncate">
                {isEditing
                  ? (isBn ? 'ক্যাম্পেইন সম্পাদনা' : 'Edit Campaign Details')
                  : (isBn ? 'নতুন অনুদান ক্যাম্পেইন তৈরি' : 'Create New Campaign')}
              </h3>
              <p className="text-[11px] xs:text-xs text-rose-100 mt-0.5 line-clamp-1">
                {isBn
                  ? 'বিদ্যালয়ের উন্নয়ন ও শিক্ষার্থীদের সহায়তায় নতুন তহবিল ফান্ড চালু করুন'
                  : 'Launch and manage public fundraising and endowment causes'}
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
          {/* Titles in EN & BN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাম্পেইন শিরোনাম (English) *' : 'Campaign Title (English) *'}
              </label>
              <Input
                required
                placeholder="e.g. Student Scholarship Endowment Fund"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাম্পেইন শিরোনাম (বাংলা) *' : 'Campaign Title (Bengali) *'}
              </label>
              <Input
                required
                placeholder="যেমন: মেধাবী ও অসচ্ছল শিক্ষার্থী বৃত্তি তহবিল"
                value={formData.title_bn}
                onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Goal & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'অনুদানের লক্ষ্যমাত্রা (Goal BDT) *' : 'Target Fundraising Goal (BDT) *'}
              </label>
              <div className="relative">
                <Input
                  required
                  type="number"
                  min={1000}
                  placeholder="500000"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: Number(e.target.value) || 0 })}
                  className="rounded-xl text-xs font-black font-mono pl-9 text-emerald-600 dark:text-emerald-400"
                />
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">৳</span>
              </div>

              {/* Quick Goal Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {quickGoals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g })}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                      formData.goal === g
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ৳{(g / 100000).toFixed(g % 100000 === 0 ? 0 : 1)}L
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাটাগরি / খাত *' : 'Category / Classification *'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isBn ? cat.label_bn : cat.label_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descriptions in EN & BN */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাম্পেইনের বিবরণ (English) *' : 'Description / Cause Story (English) *'}
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Explain the purpose, who will benefit, and why alumni should contribute..."
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাম্পেইনের বিবরণ (বাংলা) *' : 'Description / Cause Story (Bengali) *'}
              </label>
              <Textarea
                required
                rows={3}
                placeholder="তহবিলের উদ্দেশ্য, কারা উপকৃত হবে এবং বিস্তারিত বর্ণনা লিখুন..."
                value={formData.description_bn}
                onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-1.5">
            <ImageUpload
              shape="rectangle"
              label={isBn ? 'ক্যাম্পেইন ব্যানার ছবি (Banner Image)' : 'Campaign Banner Image'}
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              helperText={
                isBn
                  ? 'ব্যানার ছবি আপলোড করুন (JPG, PNG, WEBP, সর্বোচ্চ ৫ মেগাবাইট)'
                  : 'Upload a campaign cover banner image (JPG, PNG, WEBP up to 5MB)'
              }
            />
          </div>

          {/* Status, Dates & Featured Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাম্পেইন স্ট্যাটাস' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active (Public)'}</option>
                <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
                <option value="paused">{isBn ? 'সাময়িক স্থগিত (Paused)' : 'Paused'}</option>
                <option value="draft">{isBn ? 'ড্রাফট (Draft)' : 'Draft'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শেষ তারিখ (Deadline)' : 'Deadline / End Date'}
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>{isBn ? 'ফিচার্ড ক্যাম্পেইন' : 'Featured on Homepage'}</span>
              </label>
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
                ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Campaign')
                : (isBn ? 'ক্যাম্পেইন প্রকাশ করুন' : 'Publish Campaign')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
