'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Droplet,
  HeartHandshake,
  AlertOctagon,
  Calendar,
  Building2,
  Phone,
  User,
  Info,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BLOOD_GROUPS, BLOOD_REQUEST_URGENCIES } from '@/lib/types';
import {
  CHATTOGRAM_HOSPITALS,
  DEFAULT_HOSPITAL_NAME,
  getHospitalDetails,
} from '@/lib/hospitals';

export default function CreateBloodRequestPage() {
  const router = useRouter();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { data: session, status } = useSession();
  const { showToast } = useSweetAlert();

  const [loading, setLoading] = useState(false);
  const [isForSelf, setIsForSelf] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isCustomHospital, setIsCustomHospital] = useState(false);

  // Initial default hospital
  const defaultHospital = getHospitalDetails(DEFAULT_HOSPITAL_NAME) || {
    name: DEFAULT_HOSPITAL_NAME,
    address: '57 K.B. Fazlul Kader Road, Panchlaish, Chattogram 4203',
    location: 'Panchlaish, Chattogram',
  };

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    requiredUnits: 1,
    hospitalName: defaultHospital.name,
    hospitalAddress: defaultHospital.address,
    hospitalLocation: defaultHospital.location,
    requiredDate: new Date().toISOString().split('T')[0],
    urgency: 'Urgent',
    contactName: session?.user?.name || '',
    contactPhone: (session?.user as any)?.phone || '',
    additionalInformation: '',
  });

  // Handle hospital select or preset selection
  const handleSelectHospital = (hospitalName: string) => {
    if (hospitalName === '__custom__') {
      setIsCustomHospital(true);
      setFormData((prev) => ({
        ...prev,
        hospitalName: '',
        hospitalAddress: '',
      }));
      return;
    }

    setIsCustomHospital(false);
    const details = getHospitalDetails(hospitalName);
    if (details) {
      setFormData((prev) => ({
        ...prev,
        hospitalName: details.name,
        hospitalAddress: details.address,
        hospitalLocation: details.location,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        hospitalName,
      }));
    }
  };

  // Fetch logged in user's profile to auto-populate data
  React.useEffect(() => {
    async function loadUserProfile() {
      if (session?.user) {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (data.profile) {
            setUserProfile(data);
            setFormData((prev) => ({
              ...prev,
              bloodGroup: data.profile.bloodGroup || (session.user as any)?.bloodGroup || prev.bloodGroup,
              contactName: session.user?.name || prev.contactName,
              contactPhone: data.profile.phone || (session.user as any)?.phone || prev.contactPhone,
            }));
          }
        } catch (e) {
          console.error('Failed to load profile for autofill:', e);
        }
      }
    }
    loadUserProfile();
  }, [session]);

  const handleToggleForSelf = (checked: boolean) => {
    setIsForSelf(checked);
    if (checked && session?.user) {
      setFormData((prev) => ({
        ...prev,
        patientName: session.user?.name || '',
        bloodGroup: userProfile?.profile?.bloodGroup || (session.user as any)?.bloodGroup || prev.bloodGroup,
        contactName: session.user?.name || prev.contactName,
        contactPhone: userProfile?.profile?.phone || (session.user as any)?.phone || prev.contactPhone,
      }));
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
            <Droplet className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isBn ? 'লগইন প্রয়োজন' : 'Authentication Required'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? 'রক্তের আবেদন পোস্ট করতে অনুগ্রহ করে আপনার স্কুল অ্যালামনাই অ্যাকাউন্টে লগইন করুন।'
              : 'Please sign in with your alumni account to post a verified blood request.'}
          </p>
          <Link href="/login" className="block">
            <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl">
              {isBn ? 'লগইন করুন' : 'Sign In Now'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.hospitalName ||
      !formData.hospitalLocation ||
      !formData.contactName ||
      !formData.contactPhone
    ) {
      showToast({
        title: isBn ? 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill all required fields',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create blood request');
      }

      showToast({
        title: isBn ? 'আবেদন প্রকাশিত!' : 'Request Published!',
        text: isBn
          ? 'রক্তের আবেদনটি সফলভাবে প্রকাশিত হয়েছে এবং নিকটস্থ দাতাদের অবগত করা হয়েছে!'
          : 'Blood request posted successfully and matching donors notified!',
        type: 'success',
      });

      router.push(`/blood-requests/${data.request._id}`);
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message || 'Error posting blood request',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* Back Link */}
        <Link
          href="/blood-requests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'রক্তের আবেদন তালিকায় ফিরে যান' : 'Back to Blood Requests'}</span>
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-700 text-white p-5 xs:p-8 rounded-3xl shadow-xl flex items-center justify-between gap-6 border border-rose-700/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
              {isBn ? 'জরুরী সহায়তা প্ল্যাটফর্ম' : 'Emergency Assistance'}
            </span>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-black mt-1">
              {isBn ? 'রক্তের নতুন আবেদন পোস্ট করুন' : 'Post a Blood Request'}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 mt-1 max-w-xl">
              {isBn
                ? 'আবেদনটি সাবমিট করার সাথে সাথেই সংগতিপূর্ণ রক্তের গ্রুপের নিবন্ধিত প্রাক্তন ছাত্র দাতাদের স্বয়ংক্রিয়ভাবে অবহিত করা হবে।'
                : 'Submitting this form will publish the request and dispatch alert notifications to matching opted-in alumni blood donors.'}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md items-center justify-center border border-white/20 shrink-0">
            <Droplet className="w-8 h-8 text-rose-200 fill-current" />
          </div>
        </div>

        {/* Request Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 xs:p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto-Populate "For Myself" Selector */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="forSelfCheckbox"
                  checked={isForSelf}
                  onChange={(e) => handleToggleForSelf(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="forSelfCheckbox" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer select-none">
                  {isBn ? 'এই রক্তের আবেদনটি আমার নিজের জন্য' : 'This blood request is for myself'}
                </label>
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hidden sm:inline">
                {isBn ? 'প্রোফাইল থেকে তথ্য স্বয়ংক্রিয় পূরণ' : 'Auto-fills profile data'}
              </span>
            </div>

            {/* Patient & Blood Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-rose-500" />
                <span>{isBn ? 'রোগী ও রক্তের তথ্য' : 'Patient & Blood Requirement'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'রোগীর নাম *' : 'Patient Name *'}
                  </label>
                  <Input
                    required
                    placeholder={isBn ? 'রোগীর পূর্ণ নাম' : 'Patient Full Name'}
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                  </label>
                  <select
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রয়োজনীয় রক্তের পরিমাণ (ব্যাগ / Unit) *' : 'Required Units (Bags) *'}
                  </label>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={20}
                    value={formData.requiredUnits}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredUnits: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'জরুরী অবস্থা / অগ্রাধিকার *' : 'Urgency Level *'}
                  </label>
                  <select
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    {BLOOD_REQUEST_URGENCIES.map((u) => (
                      <option key={u} value={u}>
                        {u === 'Emergency' ? `🚨 ${u}` : u === 'Urgent' ? `🔥 ${u}` : u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Hospital & Location */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-500" />
                  <span>{isBn ? 'হাসপাতাল ও সময়সূচি' : 'Hospital & Schedule'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (isCustomHospital) {
                      handleSelectHospital(DEFAULT_HOSPITAL_NAME);
                    } else {
                      setIsCustomHospital(true);
                      setFormData((prev) => ({ ...prev, hospitalName: '', hospitalAddress: '' }));
                    }
                  }}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {isCustomHospital
                      ? (isBn ? 'তালিকা থেকে বাছাই করুন' : '← Choose from hospital list')
                      : (isBn ? 'কাস্টম হাসপাতাল লিখুন' : '+ Enter custom hospital')}
                  </span>
                </button>
              </div>

              {/* Hospital Selection / Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'হাসপাতালের নাম *' : 'Hospital Name *'}
                </label>

                {isCustomHospital ? (
                  <div className="space-y-1.5">
                    <Input
                      required
                      placeholder={isBn ? 'হাসপাতালের নাম লিখুন...' : 'Type hospital name (e.g. Apollo / Square Hospital)'}
                      value={formData.hospitalName}
                      onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      className="text-sm font-medium"
                    />
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'কাস্টম হাসপাতালের ক্ষেত্রে নিচে ঠিকানা ও অবস্থান নির্দিষ্ট করুন।'
                        : 'Custom hospital mode enabled. Specify exact address and location below.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      value={formData.hospitalName}
                      onChange={(e) => handleSelectHospital(e.target.value)}
                    >
                      {CHATTOGRAM_HOSPITALS.map((h) => (
                        <option key={h.name} value={h.name}>
                          {h.name}
                        </option>
                      ))}
                      <option value="__custom__">
                        ✏️ {isBn ? 'অন্যান্য / কাস্টম হাসপাতাল...' : 'Other / Custom Hospital...'}
                      </option>
                    </select>

                    {/* Quick Hospital Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold">{isBn ? 'দ্রুত বাছাই:' : 'Popular:'}</span>
                      {[
                        'Chittagong Medical College & Hospital',
                        'Evercare Hospital Chattogram',
                        'Parkview Hospital Limited',
                        'National Hospital Chattogram',
                        'Imperial Hospital Limited',
                      ].map((name) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => handleSelectHospital(name)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg transition-all font-medium ${
                            formData.hospitalName === name
                              ? 'bg-rose-600 text-white shadow-xs font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          {name.replace(' Chattogram', '').replace(' Limited', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hospital Address (AI & Google Map Populated) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isBn ? 'হাসপাতালের ঠিকানা' : 'Hospital Address'}</span>
                  </label>
                  {!isCustomHospital && formData.hospitalAddress && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/50">
                      <Sparkles className="w-3 h-3" />
                      <span>{isBn ? 'AI ও ম্যাপ থেকে স্বয়ংক্রিয়' : 'AI & Map Verified'}</span>
                    </span>
                  )}
                </div>
                <Input
                  placeholder={
                    isBn
                      ? 'রাস্তার নম্বর, ওয়ার্ড, কেবিন বা এলাকার পূর্ণ ঠিকানা...'
                      : 'Street address, road number, ward/cabin or landmark...'
                  }
                  value={formData.hospitalAddress}
                  onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                  className="text-xs sm:text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'হাসপাতাল বাছাই করলে ঠিকানা স্বয়ংক্রিয়ভাবে পূরণ হবে। প্রয়োজন অনুযায়ী ওয়ার্ড/কেবিন নম্বর যোগ করতে পারেন।'
                    : 'Auto-populated when selecting a hospital. You can edit or add specific ward/cabin details.'}
                </p>
              </div>

              {/* Location / City and Required Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isBn ? 'হাসপাতালের স্থান / জেলা *' : 'Hospital Location / City *'}</span>
                    </label>
                    {!isCustomHospital && formData.hospitalLocation && (
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        {isBn ? 'স্বয়ংক্রিয়' : 'Auto-populated'}
                      </span>
                    )}
                  </div>
                  <Input
                    required
                    placeholder={isBn ? 'যেমন: পাঁচলাইশ, চট্টগ্রাম' : 'e.g. Panchlaish, Chattogram'}
                    value={formData.hospitalLocation}
                    onChange={(e) => setFormData({ ...formData, hospitalLocation: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isBn ? 'রক্তের প্রয়োজনীয়তার তারিখ *' : 'Required Date *'}</span>
                  </label>
                  <Input
                    required
                    type="date"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-500" />
                <span>{isBn ? 'যোগাযোগকারীর তথ্য' : 'Contact Person Info'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'যোগাযোগকারীর নাম *' : 'Contact Person Name *'}
                  </label>
                  <Input
                    required
                    placeholder={isBn ? 'আপনার নাম' : 'Contact Name'}
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'জরুরী মোবাইল নম্বর *' : 'Emergency Contact Phone *'}
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="+880 1700-000000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অতিরিক্ত তথ্য ও নির্দেশনা (ঐচ্ছিক)' : 'Additional Information (Optional)'}
                </label>
                <Textarea
                  rows={3}
                  placeholder={
                    isBn
                      ? 'অপারেশন বা চিকিৎসার বিবরণ, বিশেষ নির্দেশনা বা রক্তের প্লাটিলেটের প্রয়োজনীয়তা...'
                      : 'Provide diagnosis, surgery details, specific ward/cabin, or instructions...'
                  }
                  value={formData.additionalInformation}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInformation: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Privacy & Moderation Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'এই আবেদনটি শুধুমাত্র বিদ্যালয়ের অ্যালামনাই পরিবারের রক্তদান নেটওয়ার্কের জন্য তৈরি। অপব্যবহার রোধে তথ্য সংরক্ষণ করা হয়।'
                  : 'All blood requests are moderated within the school alumni community. Donors will reach out directly based on your contact details.'}
              </span>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Link href="/blood-requests">
                <Button type="button" variant="outline" className="rounded-2xl" disabled={loading}>
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl px-6 shadow-md shadow-rose-600/20"
              >
                {loading ? (
                  <span>{isBn ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing...'}</span>
                ) : (
                  <span>{isBn ? 'রক্তের আবেদন প্রকাশ করুন' : 'Submit Blood Request'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
