'use client';

import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';

export interface ReceiptData {
  receiptNumber: string;
  transactionId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  campaign: string;
  method: string;
  paidAt: string | Date;
}

interface PDFReceiptModalProps {
  receipt: ReceiptData;
  onClose?: () => void;
}

export function PDFReceiptModal({ receipt, onClose }: PDFReceiptModalProps) {
  const locale = useLocale();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action buttons (hidden during print) */}
      <div className="flex items-center justify-between no-print border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {locale === 'bn' ? 'অফিশিয়াল অনুদান রসিদ' : 'Official Donation Receipt'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-4 h-4" />
            <span>{locale === 'bn' ? 'প্রিন্ট / PDF সেভ' : 'Print / Save PDF'}</span>
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              {locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
          )}
        </div>
      </div>

      {/* Printable Receipt Layout */}
      <div
        id="printable-receipt"
        className="p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-lg max-w-2xl mx-auto space-y-6 print:border-none print:shadow-none print:p-4"
      >
        {/* Header with crest */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-2xl border-2 border-amber-400">
              🎓
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                ALUMNI ASSOCIATION WELFARE TRUST
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                University Central Secretariat • Reg No: ALM-BD-1998/TR
              </p>
              <p className="text-xs text-slate-500">Dhaka, Bangladesh • info@alumni.ac.bd</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              PAID & VERIFIED
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 tracking-wider text-sm uppercase">
            MONEY RECEIPT / ট্যাক্স একনলেজমেন্ট রসিদ
          </h3>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">RECEIPT NUMBER</p>
            <p className="font-mono font-bold text-slate-900">{receipt.receiptNumber}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-slate-500 font-medium">DATE ISSUED</p>
            <p className="font-medium text-slate-800">{formatDate(receipt.paidAt, 'en')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">TRANSACTION ID</p>
            <p className="font-mono text-slate-700 text-xs">{receipt.transactionId}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-slate-500 font-medium">PAYMENT METHOD</p>
            <p className="font-medium text-slate-800 uppercase text-xs">{receipt.method}</p>
          </div>
        </div>

        {/* Donor & Campaign details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-200">
            <span className="text-slate-600 font-medium">Received with thanks from:</span>
            <span className="font-bold text-slate-900">{receipt.donorName}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-200">
            <span className="text-slate-600 font-medium">Email / Contact:</span>
            <span className="text-slate-800 font-mono text-xs">{receipt.donorEmail} {receipt.donorPhone ? `(${receipt.donorPhone})` : ''}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Fund / Purpose:</span>
            <span className="font-semibold text-slate-900 text-right">{receipt.campaign}</span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase">Total Amount Received</span>
            <p className="text-xs text-amber-700 italic">Contributions to this fund are tax-exempted under Sec 44</p>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(receipt.amount, 'en')}
          </div>
        </div>

        {/* Footer verification & Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Electronically verified via SSLCommerz / Bank Gateway. No physical signature required.</span>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
            <p className="text-xs font-bold text-slate-700">General Secretary / Treasurer</p>
            <p className="text-[10px] text-slate-500">Alumni Association Board of Trustees</p>
          </div>
        </div>
      </div>
    </div>
  );
}
