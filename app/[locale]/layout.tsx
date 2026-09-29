import React from 'react';
import type { Metadata, Viewport } from 'next';
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
import { PwaRegister } from '@/components/pwa/PwaRegister';
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Alumni Association | ঐতিহ্য ও প্রাক্তনদের সংযোগ',
  description:
    'Official Alumni Association platform. Connecting alumni globally, organizing reunions, funding student scholarships, and driving career growth.',
  keywords: ['alumni', 'university alumni', 'bangladesh alumni', 'scholarships', 'reunion'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Alumni App',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0f172a',
    'msapplication-TileImage': '/icons/icon-192x192.png',
  },
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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/20">
        <PwaRegister />
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

