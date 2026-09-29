'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useLocale } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  X,
  Printer,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Building,
  CreditCard,
  QrCode,
  GraduationCap,
} from 'lucide-react';

interface DonationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: any;
}

export function DonationReceiptModal({
  isOpen,
  onClose,
  donation,
}: DonationReceiptModalProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {isBn ? 'অফিসিয়াল অনুদান মানি রসিদ' : 'Official Donation Receipt'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl text-xs gap-1.5 h-8 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট' : 'Print Receipt'}</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 print:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          {/* Top Logo & Title */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md mb-2">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isBn ? 'কেএইচএস অ্যালামনাই অ্যাসোসিয়েশন' : 'KHS Alumni Association'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? 'ট্রেজারি ও এনডাউমেন্ট ফান্ড রসিদ ভাউচার' : 'Official Treasury & Endowment Fund Receipt'}
            </p>
          </div>

          {/* Receipt Number & Date */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">
                {isBn ? 'রসিদ নম্বর' : 'Receipt No'}
              </span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                #{donation.receiptNumber || 'REC-000000'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">
                {isBn ? 'তারিখ' : 'Date'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(donation.paidAt || donation.createdAt, locale)}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-slate-800/50 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {isBn ? 'অনুদানের পরিমাণ' : 'Total Amount Donated'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(donation.amount, locale)}
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'পরিশোধ সম্পন্ন ও তহবিলভুক্ত' : 'Paid & Credited to Campaign'}</span>
            </span>
          </div>

          {/* Donor & Campaign Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{isBn ? 'দাতার নাম:' : 'Donor Name:'}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {donation.isAnonymous ? `${donation.donorName} (Anonymous)` : donation.donorName}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{isBn ? 'ইমেইল ঠিকানা:' : 'Email Address:'}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{donation.donorEmail}</span>
            </div>

            {donation.donorPhone && (
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{isBn ? 'ফোন নম্বর:' : 'Phone:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{donation.donorPhone}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{isBn ? 'তহবিল / ক্যাম্পেইন:' : 'Campaign Fund:'}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-right max-w-[260px]">
                {donation.campaign}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{isBn ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
              <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
                {donation.method}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{isBn ? 'ট্রানজেকশন আইডি:' : 'Transaction ID:'}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{donation.transactionId}</span>
            </div>
          </div>

          {/* Official Verification Seal */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'ডিজিটাল সত্যায়িত রসিদ' : 'Verified Treasury Voucher'}</span>
            </div>
            <span>{isBn ? 'সচিবালয় ট্রেজারি ডেস্ক' : 'Secretariat Treasury'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
