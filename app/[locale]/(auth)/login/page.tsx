'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { GraduationCap, Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { parseErrorMessages } from '@/lib/utils';

export default function LoginPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        const errorList = parseErrorMessages(res.error);
        const formatted = errorList.join('. ') || (locale === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়' : 'Invalid email or password');
        setError(formatted);
        showErrorToast(
          errorList.length > 0 ? errorList : formatted,
          locale === 'bn' ? 'লগইন ব্যর্থ হয়েছে' : 'Login Failed'
        );
        setIsLoading(false);
      } else {
        showSuccessToast(
          locale === 'bn' ? 'লগইন সফল হয়েছে! স্বাগতম।' : 'Login successful! Welcome back.',
          locale === 'bn' ? 'সফল হয়েছে' : 'Success'
        );
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      const errorList = parseErrorMessages(err?.message || err);
      const formatted = errorList.join('. ') || 'Login failed';
      setError(formatted);
      showErrorToast(
        errorList.length > 0 ? errorList : formatted,
        locale === 'bn' ? 'লগইন ব্যর্থ হয়েছে' : 'Login Failed'
      );
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="text-center space-y-3 p-5 sm:p-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('loginTitle')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('loginSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('email')}
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    placeholder="name@alumni.ac.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                {t('signInBtn')}
              </Button>
            </form>

            {/* Demo Credential Pills */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                {locale === 'bn' ? 'দ্রুত পরীক্ষার জন্য ডেমো অ্যাকাউন্ট' : 'Quick Demo Logins'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@alumni.ac.bd', 'Admin@123456')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="font-bold block text-primary">Admin Demo</span>
                  <span className="text-[10px] text-slate-500 truncate block">admin@alumni.ac.bd</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('sakib@alumni.ac.bd', 'Alumni@123456')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="font-bold block text-emerald-600">Alumni Demo</span>
                  <span className="text-[10px] text-slate-500 truncate block">sakib@alumni.ac.bd</span>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>{t('noAccount')}</span>{' '}
            <Link href="/register" className="ml-1 text-primary font-bold hover:underline">
              {locale === 'bn' ? 'নিবন্ধন করুন' : 'Register'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
