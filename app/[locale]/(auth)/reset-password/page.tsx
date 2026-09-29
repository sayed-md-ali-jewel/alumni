'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setCheckingToken(false);
      setTokenValid(false);
      setError(
        isBn
          ? 'কোনো পাসওয়ার্ড রিসেট টোকেন পাওয়া যায়নি। দয়া করে লিঙ্কটি পুনরায় যাচাই করুন।'
          : 'No password reset token provided. Please request a new reset link.'
      );
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setMaskedEmail(data.email || '');
        } else {
          setTokenValid(false);
          setError(
            data.error ||
              (isBn
                ? 'পাসওয়ার্ড রিসেট লিঙ্কটি অবৈধ বা এর মেয়াদ শেষ হয়ে গেছে।'
                : 'This reset token is invalid or has expired.')
          );
        }
      } catch (e: any) {
        setTokenValid(false);
        setError(
          isBn
            ? 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে।'
            : 'Failed to verify password reset token.'
        );
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token, isBn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(
        isBn
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isBn ? 'উভয় পাসওয়ার্ড মিলছে না' : 'Passwords do not match'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      showSuccessToast(
        isBn
          ? 'আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!'
          : 'Your password has been successfully updated!',
        isBn ? 'সফল হয়েছে' : 'Success'
      );

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || (isBn ? 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে' : 'Failed to reset password');
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        isBn ? 'ব্যর্থ হয়েছে' : 'Reset Failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          {isBn ? 'রিসেট টোকেন যাচাই করা হচ্ছে...' : 'Verifying reset link...'}
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="p-8 space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? 'লিঙ্কটি মেয়াদোত্তীর্ণ বা অবৈধ' : 'Invalid or Expired Link'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {error ||
              (isBn
                ? 'পাসওয়ার্ড পরিবর্তনের লিঙ্কটির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন করে চেষ্টা করুন।'
                : 'This password reset link is no longer valid. Please request a new reset link.')}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link href="/forgot-password">
            <Button className="w-full rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {isBn ? 'নতুন রিসেট লিঙ্ক অনুরোধ করুন' : 'Request New Reset Link'}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full rounded-xl text-xs">
              {isBn ? 'লগইন পেজে যান' : 'Back to Sign In'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-8 space-y-5 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isBn ? 'পাসওয়ার্ড সফলভাবে সংরক্ষিত!' : 'Password Reset Complete!'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'আপনার অ্যাকাউন্ট সফলভাবে নতুন পাসওয়ার্ড দিয়ে আপডেট হয়েছে। আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...'
              : 'Your password has been securely updated. Redirecting you to the sign-in page...'}
          </p>
        </div>

        <Link href="/login" className="block pt-2">
          <Button className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {isBn ? 'এখনই লগইন করুন' : 'Sign In Now'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <CardContent className="space-y-4 pb-8">
      {maskedEmail && (
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
            {isBn ? 'অ্যাকাউন্ট' : 'Account'}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{maskedEmail}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('newPassword')}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 rounded-2xl"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('confirmNewPassword')}
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 rounded-2xl"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Notice */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBn ? 'নিরাপত্তা টিপস' : 'Security Requirements'}</span>
          </div>
          <p>{isBn ? 'কমপক্ষে ৬ বা ততোধিক অক্ষরের পাসওয়ার্ড ব্যবহার করুন।' : 'Must be at least 6 characters with a combination of letters and numbers.'}</p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-2xl py-6 shadow-md shadow-rose-600/20"
          isLoading={isLoading}
        >
          <KeyRound className="w-4 h-4 mr-2" />
          <span>{t('resetPasswordBtn')}</span>
        </Button>
      </form>

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
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          {/* Top Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500" />

          <CardHeader className="text-center space-y-3 pt-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {t('resetPasswordTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {t('resetPasswordSubtitle')}
            </CardDescription>
          </CardHeader>

          <Suspense
            fallback={
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
