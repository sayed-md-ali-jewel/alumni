'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { GraduationCap, AlertCircle, CheckCircle2, Droplet, XCircle } from 'lucide-react';
import { ALUMNI_GROUPS, BLOOD_GROUPS } from '@/lib/types';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    batchYear: '2020',
    group: 'Science',
    bloodGroup: 'O+',
    isBloodDonor: false,
    phone: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const groupLabelBn: Record<string, string> = {
    Science: 'বিজ্ঞান',
    Commerce: 'ব্যবসায় শিক্ষা',
    Humanities: 'মানবিক',
  };

  const parsedErrorList = React.useMemo(() => {
    return error ? parseErrorMessages(error) : [];
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const mismatchMsg = locale === 'bn' ? 'উভয় পাসওয়ার্ড মিলছে না' : 'Passwords do not match';
      setError(mismatchMsg);
      showErrorToast(mismatchMsg, locale === 'bn' ? 'পাসওয়ার্ডে ত্রুটি' : 'Password Error');
      return;
    }

    if (formData.password.length < 6) {
      const lenMsg = locale === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters';
      setError(lenMsg);
      showErrorToast(lenMsg, locale === 'bn' ? 'পাসওয়ার্ডে ত্রুটি' : 'Password Error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.errors || data.error || 'Registration failed';
        throw new Error(typeof errorContent === 'object' ? JSON.stringify(errorContent) : errorContent);
      }

      setSuccess(true);
      showSuccessToast(
        locale === 'bn' ? 'নিবন্ধন সফল হয়েছে! লগইন করা হচ্ছে...' : 'Registration successful! Logging in...',
        locale === 'bn' ? 'অভিনন্দন!' : 'Success!'
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
        locale === 'bn' ? 'নিবন্ধনে সমস্যা দেখা দিয়েছে' : 'Registration Error'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-lg space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl">
          <CardHeader className="text-center space-y-2 p-5 sm:p-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('registerTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('registerSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {parsedErrorList.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm border border-rose-200 dark:border-rose-900/60 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-rose-900 dark:text-rose-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{locale === 'bn' ? 'অনুগ্রহ করে সংশোধন করুন:' : 'Please correct the following:'}</span>
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

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>
                  {locale === 'bn'
                    ? 'নিবন্ধন সফল হয়েছে! লগইন করা হচ্ছে...'
                    : 'Registration successful! Logging in...'}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('fullName')} *
                </label>
                <Input
                  required
                  placeholder={locale === 'bn' ? 'উদা: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

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
                    {common('contact')} (মোবাইল)
                  </label>
                  <Input
                    placeholder="+88017..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

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

                {/* Group (Science, Commerce, Humanities) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {locale === 'bn' ? 'গ্রুপ / শাখা *' : 'Group *'}
                  </label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  >
                    {ALUMNI_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {locale === 'bn' ? groupLabelBn[g] || g : g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {locale === 'bn' ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
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

              {/* Optional Blood Donor Checkbox */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="donor-check"
                  checked={formData.isBloodDonor}
                  onChange={(e) => setFormData({ ...formData, isBloodDonor: e.target.checked })}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="donor-check" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-600 fill-current" />
                  <span>{locale === 'bn' ? 'আমি স্বেচ্ছাসেবী রক্তদাতা হিসেবেও যুক্ত হতে চাই' : 'I want to be listed as a voluntary blood donor'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('password')} *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('confirmPassword')} *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full mt-2 rounded-2xl font-bold py-6 shadow-md shadow-primary/20" isLoading={isLoading}>
                {t('signUpBtn')}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>{t('alreadyAccount')}</span>{' '}
            <Link href="/login" className="ml-1 text-primary font-bold hover:underline">
              {locale === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
