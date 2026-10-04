'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  UploadCloud,
  Camera,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Building2,
  Receipt,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
  HelpCircle,
} from 'lucide-react';
import { ALUMNI_GROUPS, BLOOD_GROUPS } from '@/lib/types';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const isBn = locale === 'bn';

  // Step State: 1 = Personal & Profile Information, 2 = Payment Information
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    image: '',
    name: '',
    email: '',
    phone: '',
    batchYear: '2020',
    group: 'Science',
    bloodGroup: 'O+',
    presentAddress: '',
    permanentAddress: '',
    sameAsPresent: false,
    password: '',
    confirmPassword: '',

    // Step 2 (Payment)
    amount: '500',
    paymentType: 'bkash' as 'bkash' | 'nagad' | 'cash',
    transactionId: '',
    givenTo: '',
    paymentDateTime: new Date().toISOString().slice(0, 16),
    receiptNumber: '',
  });

  const [siteSettings, setSiteSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch site payment settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/site');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        }
      } catch (e) {
        console.error('Failed to load site payment settings:', e);
      }
    }
    loadSettings();
  }, []);

  const groupLabelBn: Record<string, string> = {
    Science: 'বিজ্ঞান',
    Commerce: 'ব্যবসায় শিক্ষা',
    Humanities: 'মানবিক',
  };

  const parsedErrorList = React.useMemo(() => {
    return error ? parseErrorMessages(error) : [];
  }, [error]);

  // Handle Profile Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError(
        isBn ? 'সঠিক ছবি ফাইল নির্বাচন করুন (JPG, PNG, WEBP)' : 'Please select a valid image file (JPG, PNG, WEBP).'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError(
        isBn ? 'ছবির আকার ৫ মেগাবাইটের কম হতে হবে' : 'File size exceeds the 5MB limit.'
      );
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      console.error('Profile image upload failed:', err);
      setImageUploadError(err.message || 'Error uploading image');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle "Same as Present Address" checkbox
  const handleSameAddressToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsPresent: checked,
      permanentAddress: checked ? prev.presentAddress : prev.permanentAddress,
    }));
  };

  const handlePresentAddressChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      presentAddress: val,
      permanentAddress: prev.sameAsPresent ? val : prev.permanentAddress,
    }));
  };

  // Validate Step 1 and proceed to Step 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.image || !formData.image.trim()) {
      const msg = isBn ? 'প্রোফাইল ছবি আপলোড করা আবশ্যক' : 'Profile photo is required';
      setError(msg);
      setImageUploadError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.name.trim()) {
      const msg = isBn ? 'পূর্ণ নাম প্রদান করা আবশ্যক' : 'Full name is required';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      const msg = isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন' : 'Please provide a valid email address';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.phone.trim()) {
      const msg = isBn ? 'মোবাইল নম্বর প্রদান করা আবশ্যক' : 'Contact number is required';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.batchYear) {
      const msg = isBn ? 'পাসের সন / ব্যাচ নির্বাচন করুন' : 'Graduation batch is required';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.presentAddress.trim()) {
      const msg = isBn ? 'বর্তমান ঠিকানা প্রদান করা আবশ্যক' : 'Present address is required';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (!formData.permanentAddress.trim()) {
      const msg = isBn ? 'স্থায়ী ঠিকানা প্রদান করা আবশ্যক' : 'Permanent address is required';
      setError(msg);
      showErrorToast(msg, isBn ? 'তথ্য অসম্পূর্ণ' : 'Validation Error');
      return;
    }

    if (formData.password.length < 6) {
      const lenMsg = isBn
        ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
        : 'Password must be at least 6 characters';
      setError(lenMsg);
      showErrorToast(lenMsg, isBn ? 'পাসওয়ার্ডে ত্রুটি' : 'Password Error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const mismatchMsg = isBn ? 'উভয় পাসওয়ার্ড মিলছে না' : 'Passwords do not match';
      setError(mismatchMsg);
      showErrorToast(mismatchMsg, isBn ? 'পাসওয়ার্ডে ত্রুটি' : 'Password Error');
      return;
    }

    // Advance to Step 2
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit full registration on Step 2
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      const msg = isBn ? 'সঠিক পেমেন্টের পরিমাণ লিখুন' : 'Please provide a valid payment amount';
      setError(msg);
      showErrorToast(msg, isBn ? 'পেমেন্টে ত্রুটি' : 'Payment Error');
      return;
    }

    if (formData.paymentType === 'bkash' || formData.paymentType === 'nagad') {
      if (!formData.transactionId.trim()) {
        const msg = isBn
          ? `${formData.paymentType.toUpperCase()} Transaction ID (TrxID) প্রদান করা আবশ্যক`
          : `${formData.paymentType.toUpperCase()} Transaction ID is required`;
        setError(msg);
        showErrorToast(msg, isBn ? 'পেমেন্টে ত্রুটি' : 'Payment Error');
        return;
      }
    } else if (formData.paymentType === 'cash') {
      if (!formData.givenTo.trim()) {
        const msg = isBn
          ? 'যাঁকে নগদ টাকা জমা দিয়েছেন তাঁর নাম (Given To) লিখুন'
          : 'Recipient / Given To is required for cash payment';
        setError(msg);
        showErrorToast(msg, isBn ? 'পেমেন্টে ত্রুটি' : 'Payment Error');
        return;
      }
      if (!formData.receiptNumber.trim()) {
        const msg = isBn
          ? 'নগদ জমার মানি রসিদ নম্বর (Receipt No.) লিখুন'
          : 'Receipt No. is required for cash payment';
        setError(msg);
        showErrorToast(msg, isBn ? 'পেমেন্টে ত্রুটি' : 'Payment Error');
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        batchYear: parseInt(formData.batchYear, 10),
        group: formData.group,
        bloodGroup: formData.bloodGroup,
        image: formData.image || undefined,
        presentAddress: formData.presentAddress.trim(),
        permanentAddress: formData.permanentAddress.trim(),
        payment: {
          amount: numAmount,
          paymentType: formData.paymentType,
          transactionId: formData.transactionId.trim() || undefined,
          givenTo: formData.givenTo.trim() || undefined,
          paymentDateTime: formData.paymentDateTime || undefined,
          receiptNumber: formData.receiptNumber.trim() || undefined,
        },
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.errors || data.error || 'Registration failed';
        throw new Error(typeof errorContent === 'object' ? JSON.stringify(errorContent) : errorContent);
      }

      setSuccess(true);
      showSuccessToast(
        isBn ? 'নিবন্ধন সফল হয়েছে! লগইন করা হচ্ছে...' : 'Registration successful! Logging in...',
        isBn ? 'অভিনন্দন!' : 'Success!'
      );

      // Automatically sign in
      setTimeout(async () => {
        await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
        router.push('/profile');
      }, 1200);
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || 'Something went wrong';
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'নিবন্ধনে সমস্যা দেখা দিয়েছে' : 'Registration Error'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-xl space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center space-y-2 p-5 sm:p-6 pb-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('registerTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('registerSubtitle')}</CardDescription>
          </CardHeader>

          {/* 2-Step Progress Indicator */}
          <div className="px-5 sm:px-6 pt-1 pb-3">
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-750">
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 1
                      ? 'bg-primary text-white'
                      : currentStep === 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {currentStep === 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                </div>
                <span className="truncate">
                  {isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                </span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              {/* Step 2 Pill */}
              <button
                type="button"
                onClick={() => {
                  // Allow going to Step 2 if Step 1 is valid
                  if (formData.name && formData.email && formData.password) {
                    setCurrentStep(2);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 2 ? 'bg-primary text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  2
                </div>
                <span className="truncate">
                  {isBn ? 'পেমেন্ট তথ্য' : 'Payment Information'}
                </span>
              </button>
            </div>
          </div>

          <CardContent className="space-y-4 pt-2">
            {/* Error List Banner */}
            {parsedErrorList.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm border border-rose-200 dark:border-rose-900/60 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-rose-900 dark:text-rose-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{isBn ? 'অনুগ্রহ করে সংশোধন করুন:' : 'Please correct the following:'}</span>
                </div>
                {parsedErrorList.length === 1 ? (
                  <p className="text-xs ml-6 font-medium leading-relaxed">{parsedErrorList[0]}</p>
                ) : (
                  <ul className="space-y-1 ml-6 list-disc list-outside text-xs font-medium">
                    {parsedErrorList.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>
                  {isBn
                    ? 'নিবন্ধন সফল হয়েছে! লগইন করা হচ্ছে...'
                    : 'Registration successful! Logging in...'}
                </span>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 1: PERSONAL & PROFILE INFORMATION                    */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Profile Photo Upload Area */}
                <div
                  className={`p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border transition-colors flex flex-col sm:flex-row items-center gap-4 ${
                    imageUploadError
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className="relative group cursor-pointer shrink-0 rounded-full"
                    title={isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to upload/change photo'}
                  >
                    <Avatar
                      src={formData.image || undefined}
                      fallback={formData.name || 'AL'}
                      size="xl"
                      className={`w-20 h-20 sm:w-22 sm:h-22 shadow-md transition-all group-hover:brightness-90 ${
                        imageUploadError
                          ? 'ring-2 ring-rose-500'
                          : 'ring-2 ring-primary/30'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold backdrop-blur-[1px]">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>{formData.image ? (isBn ? 'পরিবর্তন' : 'Change') : (isBn ? 'ছবি দিন' : 'Add')}</span>
                    </div>

                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-medium backdrop-blur-xs">
                        <Loader2 className="w-5 h-5 animate-spin mb-1 text-primary" />
                        <span>...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1">
                        <span>{isBn ? 'প্রোফাইল ছবি' : 'Profile Photo'}</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn
                          ? 'পাসপোর্ট সাইজ বা স্পষ্ট প্রোফাইল ছবি আপলোড করুন (বাধ্যতামূলক, সর্বোচ্চ ৫ MB)'
                          : 'Upload a clear profile photo (Required, JPG/PNG up to 5MB)'}
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploadingImage}
                    />

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="gap-1.5 rounded-xl text-xs h-8 font-semibold"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{formData.image ? (isBn ? 'নতুন ছবি আপলোড' : 'Upload New') : (isBn ? 'ছবি আপলোড করুন' : 'Upload Photo')}</span>
                      </Button>

                      {formData.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          disabled={isUploadingImage}
                          className="gap-1 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs h-8"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isBn ? 'মুছুন' : 'Remove'}</span>
                        </Button>
                      )}
                    </div>

                    {imageUploadError && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {imageUploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('fullName')} *
                  </label>
                  <Input
                    required
                    placeholder={isBn ? 'উদা: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                {/* 3. Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('email')} *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="name@alumni.ac.bd"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {common('contact')} (মোবাইল) *
                    </label>
                    <Input
                      required
                      placeholder="+88017..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* 4. Batch Year, Group, Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Batch Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('batchYear')} *
                    </label>
                    <Input
                      type="number"
                      min="1950"
                      max="2035"
                      required
                      value={formData.batchYear}
                      onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Group */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'গ্রুপ / শাখা *' : 'Group *'}
                    </label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    >
                      {ALUMNI_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {isBn ? groupLabelBn[g] || g : g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                    </label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Present Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{isBn ? 'বর্তমান ঠিকানা (Present Address) *' : 'Present Address *'}</span>
                  </label>
                  <Input
                    required
                    placeholder={isBn ? 'বাড়ি নং, রোড, থানা/উপজেলা, জেলা' : 'House, Road, Area, City, District'}
                    value={formData.presentAddress}
                    onChange={(e) => handlePresentAddressChange(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* 6. Permanent Address with "Same as Present" toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isBn ? 'স্থায়ী ঠিকানা (Permanent Address) *' : 'Permanent Address *'}</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.sameAsPresent}
                        onChange={(e) => handleSameAddressToggle(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{isBn ? 'বর্তমান ঠিকানার অনুরূপ' : 'Same as Present Address'}</span>
                    </label>
                  </div>

                  <Input
                    required
                    placeholder={isBn ? 'গ্রাম/বাড়ি, ডাকঘর, উপজেলা, জেলা' : 'Village/House, Post Office, District'}
                    value={formData.permanentAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permanentAddress: e.target.value,
                        sameAsPresent: false,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                {/* 7. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('password')} *
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="rounded-xl pl-9 pr-10"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('confirmPassword')} *
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="rounded-xl pl-9 pr-10"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 1 Submit Action: Next to Payment */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-3 rounded-2xl font-bold py-6 shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <span>{isBn ? 'পরবর্তী: পেমেন্ট তথ্য' : 'Next: Payment'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            )}

            {/* ========================================================= */}
            {/* STEP 2: PAYMENT INFORMATION                               */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-4 animate-in fade-in duration-200">
                {/* Amount Field */}
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-primary" />
                      <span>{isBn ? 'নিবন্ধন ফি / অনুদানের পরিমাণ *' : 'Registration Amount *'}</span>
                    </label>
                    <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      BDT (৳)
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-500">৳</span>
                    <Input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="500"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="rounded-xl pl-9 text-lg font-black text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn
                      ? 'অ্যালামনাই অ্যাসোসিয়েশন আজীবন সদস্যপদ ও রেজিস্ট্রেশন ফি।'
                      : 'Alumni Association membership registration fee.'}
                  </p>
                </div>

                {/* Payment Type Selection (bKash, Nagad, Cash) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন *' : 'Payment Type *'}
                  </label>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentType: 'bkash' })}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        formData.paymentType === 'bkash'
                          ? 'border-[#E2136E] bg-[#E2136E]/10 ring-2 ring-[#E2136E]/40 text-[#E2136E] shadow-sm font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-semibold'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E2136E]/15 text-[#E2136E] flex items-center justify-center font-black text-xs">
                        ৳
                      </div>
                      <span className="text-xs">bKash</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentType: 'nagad' })}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        formData.paymentType === 'nagad'
                          ? 'border-[#F7941D] bg-[#F7941D]/10 ring-2 ring-[#F7941D]/40 text-[#F7941D] shadow-sm font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-semibold'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F7941D]/15 text-[#F7941D] flex items-center justify-center font-black text-xs">
                        ৳
                      </div>
                      <span className="text-xs">Nagad</span>
                    </button>

                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentType: 'cash' })}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        formData.paymentType === 'cash'
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-semibold'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs">Cash</span>
                    </button>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {formData.paymentType === 'bkash' && (
                    <>
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>bKash Account Number:</span>
                        <span className="font-mono text-sm text-[#E2136E]">
                          {siteSettings.bkashNumber || '01712345678'} ({siteSettings.bkashType || 'Personal'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
                        {isBn
                          ? siteSettings.bkashInstructions_bn || 'বিকাশে সেন্ড মানি করে প্রাপ্ত Transaction ID (TrxID) নিচে ইনপুট দিন।'
                          : siteSettings.bkashInstructions_en || 'Send money to the bKash number above and enter the Transaction ID below.'}
                      </p>
                    </>
                  )}

                  {formData.paymentType === 'nagad' && (
                    <>
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>Nagad Account Number:</span>
                        <span className="font-mono text-sm text-[#F7941D]">
                          {siteSettings.nagadNumber || '01812345678'} ({siteSettings.nagadType || 'Personal'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
                        {isBn
                          ? siteSettings.nagadInstructions_bn || 'নগদে টাকা পাঠিয়ে প্রাপ্ত Transaction ID নিচে প্রদান করুন।'
                          : siteSettings.nagadInstructions_en || 'Send money to the Nagad number above and enter the Transaction ID below.'}
                      </p>
                    </>
                  )}

                  {formData.paymentType === 'cash' && (
                    <>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{isBn ? 'সরাসরি অফিস জমা (Cash Collection)' : 'Direct Cash Collection'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isBn
                          ? siteSettings.cashInstructions_bn || 'অ্যালামনাই অফিসে নগদ টাকা জমা দিয়ে সংগ্রহ করা মানি রসিদের নম্বর ও দায়িত্বপ্রাপ্ত কর্মকর্তার নাম নিচে লিখুন।'
                          : siteSettings.cashInstructions_en || 'Deposit cash at the alumni secretariat office and enter recipient name, date, and receipt number.'}
                      </p>
                    </>
                  )}
                </div>

                {/* Dynamic Fields for bKash / Nagad */}
                {(formData.paymentType === 'bkash' || formData.paymentType === 'nagad') && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Transaction ID (TrxID) *</span>
                      <span className="text-[10px] text-slate-400 font-normal">e.g. 8N7A6B5C4D</span>
                    </label>
                    <Input
                      required
                      placeholder={isBn ? 'প্রাপ্ত ট্রানজেকশন আইডি লিখুন' : 'Enter Transaction ID'}
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value.toUpperCase() })}
                      className="rounded-xl font-mono tracking-wider uppercase font-bold"
                    />
                  </div>
                )}

                {/* Dynamic Fields for Cash */}
                {formData.paymentType === 'cash' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* Given To / Recipient */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isBn ? 'যাঁকে নগদ জমা দিয়েছেন (Given To / Recipient) *' : 'Given To / Recipient *'}</span>
                      </label>
                      <Input
                        required
                        placeholder={isBn ? 'উদা: মো: রফিক (অফিস সহকারী) / ট্রেজারার' : 'e.g. Office Secretary / Treasurer'}
                        value={formData.givenTo}
                        onChange={(e) => setFormData({ ...formData, givenTo: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Date & Time */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{isBn ? 'জমার তারিখ ও সময় (Date & Time) *' : 'Date & Time *'}</span>
                        </label>
                        <Input
                          type="datetime-local"
                          required
                          value={formData.paymentDateTime}
                          onChange={(e) => setFormData({ ...formData, paymentDateTime: e.target.value })}
                          className="rounded-xl text-xs"
                        />
                      </div>

                      {/* Receipt No. */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isBn ? 'রশিদ নম্বর (Receipt No.) *' : 'Receipt No. *'}</span>
                        </label>
                        <Input
                          required
                          placeholder={isBn ? 'উদা: RCP-2026-0042' : 'e.g. RCP-2026-0042'}
                          value={formData.receiptNumber}
                          onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                          className="rounded-xl font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons at bottom of Step 2: Back and Complete Registration */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setError('');
                      setCurrentStep(1);
                    }}
                    disabled={isLoading}
                    className="rounded-2xl font-bold py-6 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isBn ? 'পেছনে ফিরুন' : 'Back'}</span>
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-2xl font-bold py-6 shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                    isLoading={isLoading}
                  >
                    <span>{t('signUpBtn')}</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 py-4">
            <span>{t('alreadyAccount')}</span>{' '}
            <Link href="/login" className="ml-1 text-primary font-bold hover:underline">
              {isBn ? 'লগইন করুন' : 'Sign In'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
