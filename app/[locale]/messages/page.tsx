'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WhatsAppChatView } from '@/components/requests/WhatsAppChatView';
import { MessageSquare, ArrowLeft, ShieldBan, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const { settings } = useSiteSettings();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isBn = locale === 'bn';

  const contactId = searchParams.get('user') || searchParams.get('contact') || undefined;

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">
          {isBn ? 'চ্যাট লোড হচ্ছে...' : 'Loading messages...'}
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBn ? 'বার্তা দেখতে সাইন ইন করুন' : 'Sign In to Access Chat'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isBn
            ? 'সহপাঠী ও প্রাক্তন সদস্যদের সাথে নিরাপদ ও ব্যক্তিগত বার্তা আদান-প্রদান করতে আপনার একাউন্টে লগইন করুন।'
            : 'Please log in to your account to send and receive private messages with fellow alumni.'}
        </p>
        <Link href="/login" className="inline-block pt-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold px-6 h-10 shadow-md">
            {isBn ? 'লগইন করুন' : 'Sign In'}
          </Button>
        </Link>
      </div>
    );
  }

  // Priority 1: Global Chat Disabled
  if (settings.isChatEnabled === false) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isBn ? 'চ্যাট সুবিধা সাময়িকভাবে বন্ধ আছে' : 'Chat is Temporarily Disabled'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isBn
            ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর কর্তৃক প্ল্যাটফর্মে চ্যাট ও বার্তা সুবিধা সাময়িকভাবে বন্ধ রাখা হয়েছে।'
            : 'Chat functionality is currently disabled across the entire system by administrator.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/directory">
            <Button variant="outline" className="rounded-2xl text-xs font-bold px-5 h-10">
              {isBn ? 'ডিরেক্টরি দেখুন' : 'View Directory'}
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold px-5 h-10 shadow-md">
              {isBn ? 'হোমে ফিরে যান' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Priority 2: Individual Alumni Chat Disabled
  const currentUser = session.user as any;
  if (currentUser?.isChatEnabled === false) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldBan className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isBn ? 'চ্যাট সুবিধা উপলব্ধ নয়' : 'Chat Access Restricted'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isBn
            ? 'আপনার অ্যাকাউন্টের জন্য চ্যাট সুবিধা বর্তমানে বন্ধ রয়েছে।'
            : 'Chat is currently unavailable for your account.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/profile">
            <Button variant="outline" className="rounded-2xl text-xs font-bold px-5 h-10">
              {isBn ? 'আমার প্রোফাইল' : 'My Profile'}
            </Button>
          </Link>
          <Link href="/directory">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold px-5 h-10 shadow-md">
              {isBn ? 'ডিরেক্টরি দেখুন' : 'Explore Directory'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-4 h-4" />
            <span>{isBn ? 'ব্যক্তিগত যোগাযোগ' : 'Direct Messages & Chat'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isBn ? 'ইনবক্স ও লাইভ চ্যাট' : 'Private Messages'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/directory">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs h-8 text-slate-600 dark:text-slate-300 gap-1.5"
            >
              <span>{isBn ? 'ডিরেক্টরি' : 'Alumni Directory'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main WhatsApp-Style Chat UI */}
      <WhatsAppChatView initialContactId={contactId} />
    </div>
  );
}
