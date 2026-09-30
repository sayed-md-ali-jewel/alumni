import React from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Users, HeartHandshake, Sparkles } from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';
import { SiteSettings } from '@/lib/siteSettings';

interface HomeHeroCenteredProps {
  stats: {
    totalAlumni: number;
    batchesCount: number;
    totalDonors: number;
    availableDonors: number;
    totalRaised?: number;
  };
  settings: SiteSettings;
  isBn: boolean;
}

export function HomeHeroCentered({ stats, settings, isBn }: HomeHeroCenteredProps) {
  const heroBadge = isBn
    ? settings.heroBadge_bn || '🎓 বিশ্বব্যাপী প্রাক্তন শিক্ষার্থীদের সর্ববৃহৎ প্ল্যাটফর্ম'
    : settings.heroBadge_en || '🎓 The Premier Global Network for Our Alumni';

  const heroTitle = isBn
    ? settings.heroTitle_bn || 'শিকড়ের টানে, আগামীর পানে — আমাদের অ্যালামনাই পরিবার'
    : settings.heroTitle_en || 'Honoring Our Roots, Empowering the Future';

  const heroSubtitle = isBn
    ? settings.heroSubtitle_bn ||
      'আমাদের প্রিয় বিদ্যাপীঠের হাজারো কৃতি প্রাক্তনের সাথে যুক্ত হোন। পেশাগত নেটওয়ার্কিং, স্মৃতিময় পুনর্মিলনী এবং আগামী প্রজন্মের জন্য সেবামূলক উদ্যোগের সারথি হোন।'
    : settings.heroSubtitle_en ||
      'Connect with thousands of distinguished alumni across the globe. Unlock career networking, memorable reunions, and high-impact student endowment programs.';

  const heroPrimaryBtnText = isBn
    ? settings.heroPrimaryBtnText_bn || 'প্রাক্তনদের খুঁজুন'
    : settings.heroPrimaryBtnText_en || 'Explore Directory';

  const heroPrimaryBtnLink = settings.heroPrimaryBtnLink || '/directory';

  const heroSecondaryBtnText = isBn
    ? settings.heroSecondaryBtnText_bn || 'তহবিলে অনুদান দিন'
    : settings.heroSecondaryBtnText_en || 'Support Endowment';

  const heroSecondaryBtnLink = settings.heroSecondaryBtnLink || '/donate';

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-primary-50/40 via-background to-background dark:from-slate-900/40 dark:via-background dark:to-background">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-primary-400/20 via-amber-400/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Top Badge */}
          {heroBadge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/20 text-xs sm:text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{heroBadge}</span>
            </div>
          )}

          {/* Headline */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.15]">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-sm xs:text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {heroPrimaryBtnText && (
              <Link href={heroPrimaryBtnLink} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 font-bold rounded-xl px-7 text-sm sm:text-base"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{heroPrimaryBtnText}</span>
                </Button>
              </Link>
            )}
            {heroSecondaryBtnText && (
              <Link href={heroSecondaryBtnLink} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl px-7 bg-white dark:bg-slate-900 text-sm sm:text-base"
                >
                  <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                  <span>{heroSecondaryBtnText}</span>
                </Button>
              </Link>
            )}
          </div>

          {/* 4 Stat Cards in a row at bottom (Image 1 design) */}
          {settings.heroShowStats !== false && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-8 sm:pt-14 max-w-4xl mx-auto">
              {/* Registered Alumni */}
              <div className="p-3 xs:p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl font-black text-primary mb-1 tracking-tight">
                  {isBn ? `${toBengaliNumerals(stats.totalAlumni)}+` : `${stats.totalAlumni}+`}
                </div>
                <div className="text-[11px] xs:text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isBn ? 'নিবন্ধিত প্রাক্তন' : 'Registered Alumni'}
                </div>
              </div>

              {/* Graduating Batches */}
              <div className="p-3 xs:p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl font-black text-amber-500 mb-1 tracking-tight">
                  {isBn ? `${toBengaliNumerals(stats.batchesCount)}+` : `${stats.batchesCount}+`}
                </div>
                <div className="text-[11px] xs:text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isBn ? 'অধিভুক্ত ব্যাচ' : 'Graduating Batches'}
                </div>
              </div>

              {/* Blood Donors */}
              <div className="p-3 xs:p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl font-black text-rose-600 mb-1 tracking-tight">
                  {isBn ? `${toBengaliNumerals(stats.totalDonors)}+` : `${stats.totalDonors}+`}
                </div>
                <div className="text-[11px] xs:text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isBn ? 'স্বেচ্ছাসেবী রক্তদাতা' : 'Blood Donors'}
                </div>
              </div>

              {/* Ready Donors */}
              <div className="p-3 xs:p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl font-black text-emerald-600 mb-1 tracking-tight">
                  {isBn ? `${toBengaliNumerals(stats.availableDonors)}+` : `${stats.availableDonors}+`}
                </div>
                <div className="text-[11px] xs:text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isBn ? 'প্রস্তুত রক্তদাতা' : 'Ready Donors'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
