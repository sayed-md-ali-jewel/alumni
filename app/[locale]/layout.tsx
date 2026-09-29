import React from 'react';
import type { Metadata } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { SweetAlertProvider } from '@/components/ui/SweetAlert';
import { SiteSettingsProvider } from '@/components/providers/SiteSettingsProvider';
import { PageTransitionProvider } from '@/components/providers/PageTransitionProvider';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import '@/app/globals.css';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alumni Association | ঐতিহ্য ও প্রাক্তনদের সংযোগ',
  description:
    'Official Alumni Association platform. Connecting alumni globally, organizing reunions, funding student scholarships, and driving career growth.',
  keywords: ['alumni', 'university alumni', 'bangladesh alumni', 'scholarships', 'reunion'],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${hindSiliguri.variable} ${inter.variable} ${
        locale === 'bn' ? 'font-bengali' : 'font-sans'
      }`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/20">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <NextIntlClientProvider messages={messages} locale={locale}>
              <SweetAlertProvider>
                <SiteSettingsProvider>
                  <PageTransitionProvider>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </PageTransitionProvider>
                </SiteSettingsProvider>
              </SweetAlertProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
