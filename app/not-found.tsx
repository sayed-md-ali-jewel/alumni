'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="bn">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg">
            <GraduationCap className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">৪০৪ / 404</h1>
            <h2 className="text-xl font-bold">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
            <p className="text-sm text-slate-500">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
          <Link href="/bn">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>মূল পাতায় ফিরে যান / Back to Home</span>
            </Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
