'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Briefcase, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';

export default function NewJobPage() {
  const t = useTranslations('jobs');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const { showAlert, showErrorToast, showSuccessToast } = useSweetAlert();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Dhaka (Hybrid)',
    type: 'full_time',
    salaryRange: 'Negotiable',
    description: '',
    requirements: '',
    applicationUrl: '',
    contactEmail: '',
    isReferral: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isBn = locale === 'bn';

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4 max-w-md">
        <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {isBn ? 'চাকরির বিজ্ঞপ্তি দিতে অনুগ্রহ করে লগইন করুন' : 'Please sign in to post a job'}
        </h2>
        <Link href="/login">
          <Button>{common('login')}</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.errors || data.error || 'Failed to post job';
        throw new Error(typeof errorContent === 'object' ? JSON.stringify(errorContent) : errorContent);
      }

      setSuccess(true);
      showSuccessToast(
        isBn ? 'আপনার চাকরির বিজ্ঞপ্তি সফলভাবে প্রকাশিত হয়েছে।' : 'Job circular posted successfully.',
        isBn ? 'বিজ্ঞপ্তি প্রকাশিত' : 'Job Published'
      );
      setTimeout(() => {
        router.push('/jobs');
      }, 1200);
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || 'Something went wrong';
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'বিজ্ঞপ্তি প্রকাশে ত্রুটি' : 'Job Submission Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'ক্যারিয়ার হবে ফিরে যান' : 'Back to Jobs'}</span>
      </Link>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('newJobTitle')}
          </CardTitle>
          <CardDescription>
            {isBn
              ? 'আপনার কোম্পানি বা নেটওয়ার্কের চাকরির সুযোগ ও রেফারেল শেয়ার করুন'
              : 'Share verified career openings and direct referral opportunities with fellow alumni'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{isBn ? 'বিজ্ঞপ্তি সফলভাবে প্রকাশিত হয়েছে!' : 'Job posted successfully!'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('title')} *
              </label>
              <Input
                required
                placeholder={isBn ? 'উদা: Senior Software Engineer' : 'e.g. Senior Software Engineer'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {common('company')} *
                </label>
                <Input
                  required
                  placeholder={isBn ? 'উদা: Brain Station 23 / bKash' : 'e.g. Google / Brain Station 23'}
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {common('location')} *
                </label>
                <Input
                  required
                  placeholder="Dhaka (Hybrid) / Singapore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('jobType')} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('salary')}
                </label>
                <Input
                  placeholder="৳1,20,000 – ৳1,80,000 / month"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isBn ? 'কাজের পূর্ণ বিবরণ' : 'Job Description'} *
              </label>
              <Textarea
                required
                rows={5}
                placeholder={isBn ? 'চাকরির দায়িত্ব এবং সুযোগ-সুবিধার বিবরণ লিখুন...' : 'Provide comprehensive job responsibilities and details...'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isBn ? 'প্রয়োজনীয় যোগ্যতাসমূহ (কমা দিয়ে আলাদা করুন)' : 'Requirements (comma separated)'}
              </label>
              <Input
                placeholder="3+ years experience, Next.js, Python, PostgreSQL"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'আবেদন লিংক (URL)' : 'Application URL'}
                </label>
                <Input
                  type="url"
                  placeholder="https://company.com/apply"
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'যোগাযোগের ইমেইল' : 'Contact Email'}
                </label>
                <Input
                  type="email"
                  placeholder="careers@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="isReferral"
                checked={formData.isReferral}
                onChange={(e) => setFormData({ ...formData, isReferral: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="isReferral" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                {isBn
                  ? 'আমি যোগ্য প্রার্থীদের অভ্যন্তরীণ রেফারেল দিতে প্রস্তুত (Internal Referral Offered)'
                  : 'I can provide internal referral for qualified alumni applicants'}
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              {isBn ? 'বিজ্ঞপ্তি প্রকাশ করুন' : 'Publish Job Opening'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
