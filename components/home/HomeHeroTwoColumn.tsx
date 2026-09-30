import React from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { formatCurrency, toBengaliNumerals } from '@/lib/utils';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import {
  Sparkles,
  Users,
  HeartHandshake,
  Droplet,
  GraduationCap,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface HomeHeroTwoColumnProps {
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

export function HomeHeroTwoColumn({ stats, settings, isBn }: HomeHeroTwoColumnProps) {
  const heroBadge = isBn
    ? settings.heroBadge_bn || DEFAULT_SITE_SETTINGS.heroBadge_bn
    : settings.heroBadge_en || DEFAULT_SITE_SETTINGS.heroBadge_en;

  const heroTitle = isBn
    ? settings.heroTitle_bn || DEFAULT_SITE_SETTINGS.heroTitle_bn
    : settings.heroTitle_en || DEFAULT_SITE_SETTINGS.heroTitle_en;

  const heroSubtitle = isBn
    ? settings.heroSubtitle_bn || DEFAULT_SITE_SETTINGS.heroSubtitle_bn
    : settings.heroSubtitle_en || DEFAULT_SITE_SETTINGS.heroSubtitle_en;

  const heroPrimaryBtnText = isBn
    ? settings.heroPrimaryBtnText_bn || DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_bn
    : settings.heroPrimaryBtnText_en || DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_en;

  const heroPrimaryBtnLink = settings.heroPrimaryBtnLink || '/directory';

  const heroSecondaryBtnText = isBn
    ? settings.heroSecondaryBtnText_bn || DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_bn
    : settings.heroSecondaryBtnText_en || DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_en;

  const heroSecondaryBtnLink = settings.heroSecondaryBtnLink || '/donate';

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/70 via-background to-background dark:from-slate-950 dark:via-background dark:to-background transition-colors">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-primary-500/15 via-amber-400/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-rose-500/10 via-primary-400/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SECTION: Dynamic Hero & Home Banner Data (from Admin Portal) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-7 animate-in fade-in duration-500">
            {/* Top Badge */}
            {heroBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/20 text-xs sm:text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">{heroBadge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.16]">
              {heroTitle}
            </h1>

            {/* Description / Subtitle */}
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              {heroPrimaryBtnText && (
                <Link href={heroPrimaryBtnLink} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6 font-bold text-sm sm:text-base"
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
                    className="w-full sm:w-auto gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-6 text-slate-800 dark:text-slate-200 font-bold bg-white dark:bg-slate-900 text-sm sm:text-base"
                  >
                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                    <span>{heroSecondaryBtnText}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Floating Metrics Card (Image 2 design) */}
          <div className="lg:col-span-5 xl:col-span-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 sm:p-7 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {isBn ? 'লাইভ প্ল্যাটফর্ম পরিসংখ্যান' : 'Live Association Metrics'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isBn ? 'সক্রিয়' : 'Live'}
                </span>
              </div>

              {/* Statistics 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                {/* Total Alumni */}
                <div className="p-3 xs:p-4 rounded-2xl bg-gradient-to-br from-primary-50/80 to-transparent dark:from-primary-950/30 border border-primary-100/70 dark:border-primary-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'নিবন্ধিত প্রাক্তন' : 'Total Alumni'}
                    </span>
                  </div>
                  <div className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? `${toBengaliNumerals(stats.totalAlumni)}+` : `${stats.totalAlumni}+`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'বিশ্বব্যাপী প্রাক্তন' : 'Global graduates'}
                  </p>
                </div>

                {/* Batches */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-transparent dark:from-amber-950/30 border border-amber-100/70 dark:border-amber-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'অধিভুক্ত ব্যাচ' : 'Batches'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? `${toBengaliNumerals(stats.batchesCount)}+` : `${stats.batchesCount}+`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'উত্তীর্ণ শিক্ষাবর্ষ' : 'Graduating classes'}
                  </p>
                </div>

                {/* Blood Donors */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-transparent dark:from-rose-950/30 border border-rose-100/70 dark:border-rose-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <Droplet className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'রক্তদাতা' : 'Blood Donors'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {isBn ? `${toBengaliNumerals(stats.totalDonors)}+` : `${stats.totalDonors}+`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'স্বেচ্ছাসেবী প্রস্তুত' : 'Voluntary donors'}
                  </p>
                </div>

                {/* Ready Donors */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-transparent dark:from-emerald-950/30 border border-emerald-100/70 dark:border-emerald-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'প্রস্তুত রক্তদাতা' : 'Ready Donors'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {isBn ? `${toBengaliNumerals(stats.availableDonors)}+` : `${stats.availableDonors}+`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'জরুরি প্রয়োজনে প্রস্তুত' : 'Available on-call'}
                  </p>
                </div>
              </div>

              {/* Endowment Raised Full-Width Card */}
              {stats.totalRaised && stats.totalRaised > 0 ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {isBn ? 'তহবিল সংগ্রহ ও অনুদান' : 'Endowment Raised'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'শিক্ষাবৃত্তি ও সাহায্য তহবিল' : 'Scholarships & relief'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(stats.totalRaised, isBn ? 'bn' : 'en')}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
