'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WhatsAppChatView } from '@/components/requests/WhatsAppChatView';
import { MessageSquare, ArrowLeft, ShieldBan, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MessagesPage() {
  const { data: session, status } = useSession();
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
