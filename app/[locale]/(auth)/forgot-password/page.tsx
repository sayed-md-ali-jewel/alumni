'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, KeyRound, RefreshCw } from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }

      setIsSubmitted(true);
      if (data.debugResetUrl) {
        setDebugUrl(data.debugResetUrl);
      }

      showSuccessToast(
        isBn
          ? 'পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে!'
          : 'Password reset link has been dispatched to your email!',
        isBn ? 'সফল হয়েছে' : 'Email Sent'
      );
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || (isBn ? 'অনুরোধ প্রক্রিয়া করতে ব্যর্থ হয়েছে' : 'Failed to process request');
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'ব্যর্থ হয়েছে' : 'Request Failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          {/* Top Rose Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          <CardHeader className="text-center space-y-3 pt-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {t('forgotPasswordTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {t('forgotPasswordSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-8">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-900/60">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      placeholder="name@alumni.ac.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-2xl"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-2xl py-6 shadow-md shadow-rose-600/20"
                  isLoading={isLoading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{t('sendResetLink')}</span>
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center animate-in fade-in zoom-in-95">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2 text-left">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{isBn ? 'ইমেইল সফলভাবে পাঠানো হয়েছে' : 'Instructions Dispatched'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isBn
                      ? `আমরা ${email} ঠিকানায় পাসওয়ার্ড রিসেটের নির্দেশাবলী পাঠিয়েছি। অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করুন।`
                      : `We have sent password reset instructions to ${email}. Please check your inbox and click the reset link.`}
                  </p>
                </div>

                {debugUrl && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-left border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold block text-slate-700 dark:text-slate-300 mb-1">
                      🛠 Development Direct Link:
                    </span>
                    <a
                      href={debugUrl}
                      className="text-rose-600 dark:text-rose-400 font-medium hover:underline break-all"
                    >
                      {debugUrl}
                    </a>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitted(false)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অন্য ইমেইলে চেষ্টা করুন' : 'Try another email address'}</span>
                </Button>
              </div>
            )}

            <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToLogin')}</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
