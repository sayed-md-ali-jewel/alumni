'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Linkedin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Droplet,
  Heart,
  HeartHandshake,
  Lock,
  Sparkles,
  Share2,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  FileText,
  Phone,
  Mail,
  Sliders,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  ALUMNI_GROUPS,
  BLOOD_GROUPS,
  DONATION_STATUSES,
  CONTACT_PREFERENCES,
} from '@/lib/types';
import { RecordDonationModal } from '@/components/blood-donation/RecordDonationModal';
import { DonationHistoryList } from '@/components/blood-donation/DonationHistoryList';
import { DonorReceivedRequests } from '@/components/blood-donation/DonorReceivedRequests';
import { getDonorDynamicStatus, formatDate, parseErrorMessages } from '@/lib/utils';
import {
  FacebookIcon,
  LinkedInIcon,
  InstagramIcon,
  WhatsAppIcon,
  formatWhatsAppUrl,
} from '@/components/shared/SocialIcons';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const { showToast, showAlert, showErrorToast, showSuccessToast } = useSweetAlert();

  const isBn = locale === 'bn';

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Listen to tab in query params (e.g. /profile?tab=blood or /profile?tab=social)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'blood' || tab === 'donor') {
      setCurrentStep(4);
    } else if (tab === 'social' || tab === 'privacy') {
      setCurrentStep(3);
    } else if (tab === 'academic' || tab === 'career') {
      setCurrentStep(2);
    } else if (tab === 'personal') {
      setCurrentStep(1);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batchYear: 2020,
    group: 'Science',
    bloodGroup: 'O+',
    company: '',
    jobTitle: '',
    location: 'Dhaka, Bangladesh',
    bio: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    skills: '',
    image: '',
    visibility: 'public',
    contactPrivacy: {
      email: 'public',
      phone: 'public',
      whatsapp: 'public',
      facebook: 'public',
      linkedin: 'public',
      instagram: 'public',
    },
    // Blood Donation System
    isBloodDonor: false,
    donationStatus: 'Available',
    lastDonationDate: '',
    nextEligibleDate: '',
    donorLocation: 'Chattogram, Bangladesh',
    contactPreference: 'Both',
    donorNotes: '',
    bloodDonationConsent: false,
    allowAlumniContact: true,
  });

  const [isVerified, setIsVerified] = useState(false);
  const [role, setRole] = useState('alumni');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsVerified(data.user.isVerified);
          setRole(data.user.role);
        }
        if (data.profile) {
          setFormData({
            name: data.user?.name || '',
            email: data.user?.email || '',
            phone: data.user?.phone || data.profile?.phone || '',
            batchYear: data.profile.batchYear || 2020,
            group: data.profile.group || 'Science',
            bloodGroup: data.profile.bloodGroup || data.user?.bloodGroup || 'O+',
            company: data.profile.company || '',
            jobTitle: data.profile.jobTitle || '',
            location: data.profile.location || 'Chattogram, Bangladesh',
            bio: data.profile.bio || '',
            linkedin: data.profile.linkedin || '',
            facebook: data.profile.facebook || '',
            instagram: data.profile.instagram || '',
            whatsapp: data.profile.whatsapp || '',
            skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : '',
            image: data.user?.image || '',
            visibility: data.profile.visibility || 'public',
            contactPrivacy: {
              email: data.profile.contactPrivacy?.email || 'public',
              phone: data.profile.contactPrivacy?.phone || 'public',
              whatsapp: data.profile.contactPrivacy?.whatsapp || 'public',
              facebook: data.profile.contactPrivacy?.facebook || 'public',
              linkedin: data.profile.contactPrivacy?.linkedin || 'public',
              instagram: data.profile.contactPrivacy?.instagram || 'public',
            },
            // Blood donation
            isBloodDonor: data.profile.isBloodDonor || false,
            donationStatus: data.profile.donationStatus || 'Available',
            lastDonationDate: data.profile.lastDonationDate
              ? new Date(data.profile.lastDonationDate).toISOString().split('T')[0]
              : '',
            nextEligibleDate: data.profile.nextEligibleDate
              ? new Date(data.profile.nextEligibleDate).toISOString().split('T')[0]
              : '',
            donorLocation: data.profile.donorLocation || data.profile.location || 'Chattogram, Bangladesh',
            contactPreference: data.profile.contactPreference || 'Both',
            donorNotes: data.profile.donorNotes || '',
            bloodDonationConsent: data.profile.bloodDonationConsent || false,
            allowAlumniContact: data.profile.allowAlumniContact !== false,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleLastDonationDateChange = (val: string) => {
    if (!val) {
      setFormData((prev) => ({
        ...prev,
        lastDonationDate: '',
        nextEligibleDate: '',
      }));
      return;
    }

    const parts = val.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      dateObj.setMonth(dateObj.getMonth() + 3);
      const nextY = dateObj.getFullYear();
      const nextM = String(dateObj.getMonth() + 1).padStart(2, '0');
      const nextD = String(dateObj.getDate()).padStart(2, '0');
      const nextEligible = `${nextY}-${nextM}-${nextD}`;

      setFormData((prev) => ({
        ...prev,
        lastDonationDate: val,
        nextEligibleDate: nextEligible,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        lastDonationDate: val,
      }));
    }
  };

  const normalizeSocialUrl = (val?: string) => {
    if (!val || val.trim() === '') return '';
    const trimmed = val.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const validateStep = (stepNumber: number): boolean => {
    setError('');
    if (stepNumber === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        const msg = isBn ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)' : 'Please enter your full name (at least 2 characters)';
        setError(msg);
        showErrorToast(msg, isBn ? 'তথ্য যাচাইকরণ' : 'Validation Error');
        return false;
      }
    }
    if (stepNumber === 2) {
      if (!formData.batchYear || formData.batchYear < 1950 || formData.batchYear > 2035) {
        const msg = isBn ? 'সঠিক পাসের সন লিখুন (১৯৫০ - ২০৩৫)' : 'Please enter a valid graduation year (1950 - 2035)';
        setError(msg);
        showErrorToast(msg, isBn ? 'তথ্য যাচাইকরণ' : 'Validation Error');
        return false;
      }
      if (!formData.group) {
        const msg = isBn ? 'অনুগ্রহ করে আপনার গ্রুপ নির্বাচন করুন' : 'Please select your alumni group';
        setError(msg);
        showErrorToast(msg, isBn ? 'তথ্য যাচাইকরণ' : 'Validation Error');
        return false;
      }
    }
    if (stepNumber === 4) {
      if (formData.isBloodDonor && !formData.bloodDonationConsent) {
        const msg = isBn
          ? 'রক্তদাতা হিসেবে সক্রিয় হতে অনুগ্রহ করে সম্মতির শর্তাবলীতে টিক দিন।'
          : 'Please accept the blood donation consent terms to be listed as an active donor.';
        setError(msg);
        showErrorToast(msg, isBn ? 'সম্মতি আবশ্যক' : 'Consent Required');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === currentStep) return;
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) return;
    }
    setError('');
    setCurrentStep(stepId);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validate all required steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(currentStep)) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const payload = {
        ...formData,
        linkedin: normalizeSocialUrl(formData.linkedin),
        facebook: normalizeSocialUrl(formData.facebook),
        instagram: normalizeSocialUrl(formData.instagram),
        whatsapp: formData.whatsapp?.trim() || '',
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.errors || data.error || 'Failed to update profile';
        throw new Error(typeof errorContent === 'object' ? JSON.stringify(errorContent) : errorContent);
      }

      setSaveSuccess(true);
      if (data.profile?.contactPrivacy) {
        setFormData((prev) => ({
          ...prev,
          contactPrivacy: {
            email: data.profile.contactPrivacy.email || 'public',
            phone: data.profile.contactPrivacy.phone || 'public',
            whatsapp: data.profile.contactPrivacy.whatsapp || 'public',
            facebook: data.profile.contactPrivacy.facebook || 'public',
            linkedin: data.profile.contactPrivacy.linkedin || 'public',
            instagram: data.profile.contactPrivacy.instagram || 'public',
          },
        }));
      }

      await update({
        name: formData.name,
        image: formData.image,
        group: formData.group,
        bloodGroup: formData.bloodGroup,
        isBloodDonor: formData.isBloodDonor,
      });

      showSuccessToast(
        isBn
          ? 'আপনার প্রোফাইল, রক্তের গ্রুপ ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে।'
          : 'Your profile, blood donation settings, and preferences were saved.',
        isBn ? 'সংরক্ষিত হয়েছে' : 'Profile Saved'
      );

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || 'Error updating profile';
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'প্রোফাইল আপডেটে ত্রুটি' : 'Profile Update Error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const stepsConfig = [
    {
      id: 1,
      title: isBn ? 'ব্যক্তিগত ও ছবি' : 'Personal & Photo',
      subtitle: isBn ? 'ছবি ও যোগাযোগের তথ্য' : 'Name, photo & contact',
      icon: User,
    },
    {
      id: 2,
      title: isBn ? 'একাডেমিক ও পেশা' : 'Academic & Career',
      subtitle: isBn ? 'ব্যাচ, গ্রুপ, রক্তের গ্রুপ ও চাকরি' : 'Batch, group & career',
      icon: GraduationCap,
    },
    {
      id: 3,
      title: isBn ? 'সোশ্যাল ও গোপনীয়তা' : 'Social & Privacy',
      subtitle: isBn ? 'সোশ্যাল লিংক ও প্রোফাইল সেটিংস' : 'Social links & visibility',
      icon: Share2,
    },
    {
      id: 4,
      title: isBn ? 'রক্তদান ড্যাশবোর্ড' : 'Blood Donor Hub',
      subtitle: isBn ? 'স্বেচ্ছাসেবা স্ট্যাটাস ও হিস্ট্রি' : 'Donor status & history log',
      icon: Droplet,
    },
  ];

  if (status === 'loading' || (loading && status === 'authenticated')) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">{common('loading')}</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBn ? 'প্রোফাইল দেখতে সাইন ইন করুন' : 'Sign In Required'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isBn
            ? 'আপনার প্রোফাইল দেখতে বা সম্পাদনা করতে অনুগ্রহ করে লগইন করুন।'
            : 'Please sign in to view or update your alumni profile.'}
        </p>
        <Link href="/login?callbackUrl=/profile" className="inline-block pt-2">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold px-6 h-10 shadow-md">
            {isBn ? 'লগইন করুন' : 'Sign In'}
          </Button>
        </Link>
      </div>
    );
  }

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-5xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sliders className="w-4 h-4" />
            <span>{isBn ? 'প্রোফাইল ও সংযোগ নিয়ন্ত্রণ কেন্দ্র' : 'Profile & Connections Hub'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('editProfile')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {formData.bloodGroup && (
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-sm">
              <Droplet className="w-3.5 h-3.5 fill-current text-rose-200" />
              <span>{formData.bloodGroup}</span>
            </span>
          )}
          {isVerified ? (
            <Badge variant="success" className="px-3 py-1 gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('statusVerified')}</span>
            </Badge>
          ) : (
            <Badge variant="warning" className="px-3 py-1 gap-1 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t('statusPending')}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1.5 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? `ধাপ ${currentStep} / ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}</span>
          </span>
          <span>{isBn ? `সম্পূর্ণ হয়েছে: ${progressPercentage}%` : `Progress: ${progressPercentage}%`}</span>
        </div>

        {/* Linear Progress Indicator */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {stepsConfig.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl text-left transition-all duration-200 border min-h-[76px] sm:min-h-[84px] cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary-500 text-primary shadow-md ring-2 ring-primary/25 scale-[1.01]'
                    : isCompleted
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-700'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-750 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 text-xs sm:text-sm font-black transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                      : isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : step.id}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className={`text-xs sm:text-sm font-bold leading-tight ${
                    isActive
                      ? 'text-primary dark:text-primary-400'
                      : isCompleted
                      ? 'text-emerald-900 dark:text-emerald-300'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-[11px] sm:text-xs leading-tight ${
                    isActive
                      ? 'text-primary/80 dark:text-primary-300/80'
                      : isCompleted
                      ? 'text-emerald-700/80 dark:text-emerald-400/80'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
        {/* Step Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              {isBn ? `ধাপ ०${currentStep}` : `Step 0${currentStep}`}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {stepsConfig[currentStep - 1]?.title}
            </h2>
            <p className="text-xs text-slate-300">
              {stepsConfig[currentStep - 1]?.subtitle}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/10 shadow-inner">
            {React.createElement(stepsConfig[currentStep - 1]?.icon, { className: 'w-6 h-6' })}
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t('profileUpdated')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ================= STEP 1: PERSONAL & PHOTO ================= */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Avatar & Photo Upload */}
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  fallbackName={formData.name || 'AL'}
                  label={t('profileImage')}
                  helperText={
                    isBn
                      ? 'সরাসরি ছবি আপলোড করুন (JPG, PNG, WEBP) অথবা ড্র্যাগ করে আনুন। সর্বোচ্চ ৫ মেগাবাইট।'
                      : 'Upload your photo directly (JPG, PNG, WEBP up to 5MB) or drag & drop.'
                  }
                  batch={formData.batchYear}
                  group={formData.group}
                  bloodGroup={formData.bloodGroup}
                  jobTitle={formData.jobTitle}
                  company={formData.company}
                  locale={locale}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('fullName')} *
                    </label>
                    <Input
                      required
                      placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'e.g. Tanvir Ahmed'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('email')}
                    </label>
                    <Input
                      disabled
                      value={formData.email}
                      className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('phone')}
                    </label>
                    <Input
                      placeholder="+88017..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('location')}
                    </label>
                    <Input
                      placeholder="Dhaka, Bangladesh / Singapore"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('bio')}
                  </label>
                  <Textarea
                    rows={3}
                    placeholder={isBn ? 'আপনার সংক্ষিপ্ত পরিচয় ও আগ্রহ সম্পর্কে লিখুন...' : 'Share a brief overview of your journey, interests and achievements...'}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 2: ACADEMIC & CAREER ================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Batch Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'পাসের সন (ব্যাচ) *' : 'Graduation Batch *'}
                    </label>
                    <Input
                      type="number"
                      min="1950"
                      max="2035"
                      required
                      value={formData.batchYear}
                      onChange={(e) =>
                        setFormData({ ...formData, batchYear: parseInt(e.target.value, 10) })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  {/* Group (Science, Commerce, Humanities) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'গ্রুপ / শাখা *' : 'Alumni Group *'}
                    </label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {ALUMNI_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
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
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('jobTitle')}
                    </label>
                    <Input
                      placeholder="Senior Software Engineer / Doctor / Banker"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('company')}
                    </label>
                    <Input
                      placeholder="Company / Hospital / University"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('skills')}
                  </label>
                  <Input
                    placeholder={t('skillsPlaceholder')}
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'কমা (,) দিয়ে একাধিক দক্ষতা আলাদা করুন।' : 'Separate multiple skills with commas.'}
                  </p>
                </div>
              </div>
            )}

            {/* ================= STEP 3: SOCIAL MEDIA & PRIVACY ================= */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {isBn ? 'প্রোফাইল প্রাইভেসি ও প্ল্যাটফর্ম দৃশ্যমানতা' : 'Profile Privacy & Platform Visibility'}
                    </p>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                      {isBn
                        ? 'আপনার প্রতিটি সোশ্যাল মিডিয়া ও যোগাযোগের মাধ্যমের জন্য আলাদাভাবে পাবলিক বা প্রাইভেট নিয়ন্ত্রণ করুন। প্রাইভেট চিহ্নিত মাধ্যমগুলো অন্য কোনো ব্যবহারকারী দেখতে পাবেন না।'
                        : 'Configure privacy individually for each platform. Platforms marked as Private will be completely hidden from third parties and visitors on your public profile.'}
                    </p>
                  </div>
                </div>

                {/* Direct Contact Visibility (Email & Phone) */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700/60 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{t('directContactHeading')}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('directContactSubtitle')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address Privacy */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t('email')}
                          </span>
                        </div>

                        <select
                          value={formData.contactPrivacy.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                email: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.email === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {formData.email || (isBn ? 'কোনো ইমেইল নেই' : 'No email address')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.email === 'public'
                          ? (isBn ? '✓ ইমেইল পাবলিক প্রোফাইল কার্ডে প্রদর্শিত হবে।' : '✓ Displayed on public profile contact card.')
                          : (isBn ? '✕ দর্শনার্থীদের কাছ থেকে ইমেইল লুকানো থাকবে।' : '✕ Hidden from third parties on contact card.')}
                      </p>
                    </div>

                    {/* Phone Number Privacy */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t('phone')}
                          </span>
                        </div>

                        <select
                          value={formData.contactPrivacy.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                phone: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.phone === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <Input
                        type="tel"
                        placeholder="+8801711000001 / 01711000001"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.phone === 'public'
                          ? (isBn ? '✓ মোবাইল নম্বর প্রোফাইল কার্ডে প্রদর্শিত হবে।' : '✓ Displayed on public profile contact card.')
                          : (isBn ? '✕ দর্শনার্থীদের কাছ থেকে মোবাইল নম্বর লুকানো থাকবে।' : '✕ Hidden from third parties on contact card.')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social & Messaging Platforms with Individual Visibility Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-primary" />
                      <span>{t('contactPrivacyHeading')}</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Facebook Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                            <FacebookIcon size={14} />
                          </span>
                          <span>{t('facebook')}</span>
                        </label>

                        <select
                          value={formData.contactPrivacy.facebook}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                facebook: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.facebook === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <Input
                        type="url"
                        placeholder="https://facebook.com/username"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.facebook === 'public'
                          ? (isBn ? '✓ প্রোফাইল কার্ড ও ডিরেক্টরিতে ফেসবুক লিঙ্ক দৃশ্যমান থাকবে।' : '✓ Visible on profile card and directory.')
                          : (isBn ? '✕ দর্শনার্থীদের কাছ থেকে ফেসবুক লিঙ্ক সম্পূর্ণ লুকানো থাকবে।' : '✕ Hidden from third parties and directory visitors.')}
                      </p>
                    </div>

                    {/* LinkedIn Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center shrink-0">
                            <LinkedInIcon size={14} />
                          </span>
                          <span>{t('linkedin')}</span>
                        </label>

                        <select
                          value={formData.contactPrivacy.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                linkedin: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.linkedin === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.linkedin === 'public'
                          ? (isBn ? '✓ প্রোফাইল কার্ড ও ডিরেক্টরিতে লিঙ্কডইন লিঙ্ক দৃশ্যমান থাকবে।' : '✓ Visible on profile card and directory.')
                          : (isBn ? '✕ লিঙ্কডইন প্রোফাইল অন্য সবার কাছে লুকানো থাকবে।' : '✕ Hidden from third parties and directory visitors.')}
                      </p>
                    </div>

                    {/* Instagram Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center shrink-0">
                            <InstagramIcon size={14} />
                          </span>
                          <span>{t('instagram')}</span>
                        </label>

                        <select
                          value={formData.contactPrivacy.instagram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                instagram: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.instagram === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <Input
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.instagram === 'public'
                          ? (isBn ? '✓ ইনস্টাগ্রাম লিঙ্ক পাবলিক প্রোফাইলে দেখা যাবে।' : '✓ Visible on profile card and directory.')
                          : (isBn ? '✕ ইনস্টাগ্রাম লিঙ্ক পাবলিক প্রোফাইলে লুকানো থাকবে।' : '✕ Hidden from third parties on contact card.')}
                      </p>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                            <WhatsAppIcon size={14} />
                          </span>
                          <span>{t('whatsapp')}</span>
                        </label>

                        <select
                          value={formData.contactPrivacy.whatsapp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPrivacy: {
                                ...formData.contactPrivacy,
                                whatsapp: e.target.value as 'public' | 'private',
                              },
                            })
                          }
                          className={`h-7 px-2 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors ${
                            formData.contactPrivacy.whatsapp === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="public">🌐 {t('publicVisible')}</option>
                          <option value="private">🔒 {t('privateHidden')}</option>
                        </select>
                      </div>

                      <Input
                        type="tel"
                        placeholder="+8801711000001 / 01711000001"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="rounded-xl text-xs bg-white dark:bg-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        {formData.contactPrivacy.whatsapp === 'public'
                          ? (isBn
                              ? '✓ নম্বর ও "Chat on WhatsApp" বাটন ডিরেক্টরি প্রোফাইল কার্ডে দৃশ্যমান থাকবে।'
                              : '✓ Number and "Chat on WhatsApp" button visible on profile card.')
                          : (isBn
                              ? '✕ WhatsApp নম্বর ও চ্যাট বাটন অন্য দর্শনার্থীদের কাছে লুকানো থাকবে।'
                              : '✕ WhatsApp number and direct chat button hidden from visitors.')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Directory Visibility Settings */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span>{t('privacy')}</span>
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="public">{t('privacyPublic')}</option>
                    <option value="alumni_only">{t('privacyAlumniOnly')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* ================= STEP 4: BLOOD DONATION DASHBOARD ================= */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50/70 via-red-50/40 to-amber-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3 border-b border-rose-200/60 dark:border-rose-900/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
                        <Droplet className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{isBn ? 'আমার রক্তদান ড্যাশবোর্ড' : 'My Blood Donation Dashboard'}</span>
                          {formData.bloodGroup && (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-black">
                              {formData.bloodGroup}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isBn
                            ? 'সহপাঠী ও প্রাক্তনদের আপদকালীন রক্তের প্রয়োজনে অংশ নিন'
                            : 'Manage donation availability, calculate rest intervals, and view history'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isBloodDonor}
                          onChange={(e) =>
                            setFormData({ ...formData, isBloodDonor: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        <span className="ml-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formData.isBloodDonor
                            ? (isBn ? 'রক্তদাতা হিসেবে সক্রিয়' : 'Active Donor')
                            : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {formData.isBloodDonor && (() => {
                    const dynamicStatus = getDonorDynamicStatus(formData);
                    return (
                      <div className="space-y-6 animate-in fade-in">
                        {/* Status Highlights & Dynamic Availability Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Dynamic Status Card */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {isBn ? 'বর্তমান স্ট্যাটাস' : 'Availability Status'}
                            </span>
                            <div className="flex items-center gap-1.5 font-black text-sm">
                              {dynamicStatus.status === 'Available' && (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    {isBn ? '🟢 উপলব্ধ' : '🟢 Available'}
                                  </span>
                                </>
                              )}
                              {dynamicStatus.status === 'Recently Donated' && (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {isBn ? '🟡 সম্প্রতি দানকৃত' : '🟡 Recently Donated'}
                                  </span>
                                </>
                              )}
                              {dynamicStatus.status === 'Temporarily Unavailable' && (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {isBn ? '🟡 সাময়িক অনুপলব্ধ' : '🟡 Temporarily Unavailable'}
                                  </span>
                                </>
                              )}
                              {dynamicStatus.status === 'Not Available' && (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {isBn ? '⚪ অনুপলব্ধ' : '⚪ Not Available'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Location */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {isBn ? 'অবস্থান' : 'Location'}
                            </span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {formData.donorLocation || formData.location || 'Chattogram, Bangladesh'}
                            </p>
                          </div>

                          {/* Last Donation */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {isBn ? 'সর্বশেষ রক্তদান' : 'Last Donation'}
                            </span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {formData.lastDonationDate
                                ? formatDate(formData.lastDonationDate, locale)
                                : (isBn ? 'লগ করা হয়নি' : 'None logged')}
                            </p>
                          </div>

                          {/* Next Eligible */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {isBn ? 'পরবর্তী উপযুক্ত তারিখ' : 'Next Eligible'}
                            </span>
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                              {formData.nextEligibleDate
                                ? formatDate(formData.nextEligibleDate, locale)
                                : (isBn ? 'এখনই উপযুক্ত' : 'Eligible Now')}
                            </p>
                          </div>
                        </div>

                        {/* Recently Donated Resting Message */}
                        {dynamicStatus.status === 'Recently Donated' && (
                          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                              <p className="font-bold text-amber-900 dark:text-amber-200">
                                {isBn ? '🟡 সম্প্রতি রক্তদান করেছেন — বিশ্রামের সময়কাল চলছে' : '🟡 Recently Donated — Resting Period Active'}
                              </p>
                              <p className="text-amber-800/90 dark:text-amber-300/90">
                                {isBn
                                  ? `পরবর্তী রক্তদানের সম্ভাব্য তারিখ: ${formatDate(formData.nextEligibleDate, locale)}। নির্ধারিত তারিখ শেষ হলে আপনি স্বয়ংক্রিয়ভাবে আবারও রক্তদাতাদের তালিকায় সক্রিয় হয়ে যাবেন।`
                                  : `Next eligible donation date: ${formatDate(formData.nextEligibleDate, locale)}. You will automatically become available again once this waiting period ends.`}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Quick Action: Log New Blood Donation */}
                        <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              {isBn ? '🩸 আপনি কি সম্প্রতি রক্তদান করেছেন?' : '🩸 Did you donate blood recently?'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {isBn
                                ? 'আপনার জীবন বাঁচানোর রেকর্ড সংরক্ষণ করুন এবং পরবর্তী উপযুক্ত তারিখ নির্ধারণ করুন।'
                                : 'Log your donation date to update your rest schedule and maintain donation records.'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setShowRecordModal(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-rose-600/20"
                          >
                            <Droplet className="w-3.5 h-3.5 fill-current" />
                            <span>{isBn ? 'আমি রক্ত দিয়েছি' : "I've Donated Blood"}</span>
                          </Button>
                        </div>

                        {/* Received Blood Requests & Donor Response Actions */}
                        <div className="pt-2">
                          <DonorReceivedRequests />
                        </div>

                        {/* Verified Donation History Log Component */}
                        <div className="pt-2">
                          <DonationHistoryList refreshTrigger={refreshHistoryTrigger} />
                        </div>

                        {/* Edit Detailed Donor Settings */}
                        <div className="pt-4 border-t border-rose-200/60 dark:border-rose-900/40 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {isBn ? 'রক্তদাতা প্রোফাইল সেটিংস ও বিবরণ' : 'Donor Profile & Availability Settings'}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Donation Status */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {isBn ? 'বর্তমান রক্তদান স্থিতি *' : 'Donation Status *'}
                              </label>
                              <select
                                value={formData.donationStatus}
                                onChange={(e) =>
                                  setFormData({ ...formData, donationStatus: e.target.value })
                                }
                                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                              >
                                {DONATION_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Donor Location */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {isBn ? 'রক্তদানের সম্ভাব্য শহর / জেলা *' : 'Donation City/Location *'}
                              </label>
                              <Input
                                placeholder="Chattogram, Bangladesh"
                                value={formData.donorLocation}
                                onChange={(e) =>
                                  setFormData({ ...formData, donorLocation: e.target.value })
                                }
                                className="rounded-xl text-xs"
                              />
                            </div>

                            {/* Contact Preference */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {isBn ? 'যোগাযোগের মাধ্যম *' : 'Contact Preference *'}
                              </label>
                              <select
                                value={formData.contactPreference}
                                onChange={(e) =>
                                  setFormData({ ...formData, contactPreference: e.target.value })
                                }
                                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                              >
                                {CONTACT_PREFERENCES.map((cp) => (
                                  <option key={cp} value={cp}>
                                    {cp}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {isBn ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Donation Date'}
                              </label>
                              <Input
                                type="date"
                                value={formData.lastDonationDate}
                                onChange={(e) => handleLastDonationDateChange(e.target.value)}
                                className="rounded-xl text-xs"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {isBn ? 'পরবর্তী রক্তদানের সম্ভাব্য তারিখ (+৩ মাস)' : 'Next Eligible Date (+3 Months)'}
                                </label>
                                {formData.nextEligibleDate && (
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                                    {isBn ? '✨ স্বয়ংক্রিয়ভাবে গণনাকৃত' : '✨ Auto-calculated'}
                                  </span>
                                )}
                              </div>
                              <Input
                                type="date"
                                value={formData.nextEligibleDate}
                                onChange={(e) =>
                                  setFormData({ ...formData, nextEligibleDate: e.target.value })
                                }
                                className="rounded-xl text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {isBn ? 'রক্তদাতা সম্পর্কিত নোট (ঐচ্ছিক)' : 'Optional Donor Notes'}
                            </label>
                            <Input
                              placeholder={isBn ? 'যেমন: শুধুমাত্র ছুটির দিনে রক্তদানে প্রস্তুত...' : 'e.g. Available on weekends / near medical college...'}
                              value={formData.donorNotes}
                              onChange={(e) => setFormData({ ...formData, donorNotes: e.target.value })}
                              className="rounded-xl text-xs"
                            />
                          </div>

                          {/* Explicit Consent & Privacy Safeguards */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                              {isBn ? 'গোপনীয়তা ও সম্মতির শর্তাবলী' : 'Consent & Privacy Terms'}
                            </span>

                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                required={formData.isBloodDonor}
                                checked={formData.bloodDonationConsent}
                                onChange={(e) =>
                                  setFormData({ ...formData, bloodDonationConsent: e.target.checked })
                                }
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 mt-0.5"
                              />
                              <span>
                                {isBn
                                  ? 'আমি স্বেচ্ছায় রক্তদাতা ডিরেক্টরিতে আমার রক্তের গ্রুপ ও অবস্থান প্রদর্শন করতে সম্মত।'
                                  : 'I agree to be listed as a blood donor in the verified school alumni directory.'}
                              </span>
                            </label>

                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={formData.allowAlumniContact}
                                onChange={(e) =>
                                  setFormData({ ...formData, allowAlumniContact: e.target.checked })
                                }
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 mt-0.5"
                              />
                              <span>
                                {isBn
                                  ? 'যাচাইকৃত প্রাক্তন সদস্যরা রক্তের প্রয়োজনে আমার সাথে প্ল্যাটফর্মের মাধ্যমে যোগাযোগ করতে পারবেন।'
                                  : 'I allow verified alumni members to contact me regarding urgent blood donation requests.'}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Step Wizard Navigation Buttons for Steps 1-4 */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="rounded-xl text-xs font-bold gap-1.5 px-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isBn ? 'পূর্ববর্তী ধাপ' : 'Previous Step'}</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant={currentStep === 4 ? 'default' : 'outline'}
                  onClick={() => handleSubmit()}
                  isLoading={isSaving}
                  className={`rounded-xl text-xs font-bold gap-1.5 ${
                    currentStep === 4
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('saveChanges')}</span>
                </Button>

                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20 px-5"
                  >
                    <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Record Donation Modal */}
      {showRecordModal && (
        <RecordDonationModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          defaultData={{
            bloodGroup: formData.bloodGroup,
            location: formData.donorLocation || formData.location,
          }}
          onSuccess={() => {
            fetchProfile();
            setRefreshHistoryTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
