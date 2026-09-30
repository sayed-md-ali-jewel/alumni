'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users,
  HeartHandshake,
  Droplet,
  GraduationCap,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface SlideItem {
  _id?: string;
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  description_en: string;
  description_bn: string;
  buttonText_en?: string;
  buttonText_bn?: string;
  buttonLink?: string;
  secondaryButtonText_en?: string;
  secondaryButtonText_bn?: string;
  secondaryButtonLink?: string;
  image?: string;
  badge_en?: string;
  badge_bn?: string;
}

interface HomeSliderProps {
  slides: SlideItem[];
  stats: {
    totalAlumni: number;
    batchesCount: number;
    totalDonors: number;
    availableDonors: number;
    totalRaised?: number;
  };
  isBn: boolean;
}

export function HomeSlider({ slides, stats, isBn }: HomeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeSlides = slides && slides.length > 0 ? slides : [];
  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  // Auto-play timer
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeSlides.length, isPaused]);

  if (!currentSlide) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const title = isBn ? currentSlide.title_bn : currentSlide.title_en;
  const description = isBn ? currentSlide.description_bn : currentSlide.description_en;
  const badge = isBn
    ? currentSlide.badge_bn || currentSlide.subtitle_bn
    : currentSlide.badge_en || currentSlide.subtitle_en;
  const primaryBtnText = isBn ? currentSlide.buttonText_bn : currentSlide.buttonText_en;
  const primaryBtnLink = currentSlide.buttonLink || '/directory';
  const secondaryBtnText = isBn ? currentSlide.secondaryButtonText_bn : currentSlide.secondaryButtonText_en;
  const secondaryBtnLink = currentSlide.secondaryButtonLink || '/donate';

  return (
    <section
      className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image / Cover Layer */}
      {currentSlide.image ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            key={currentSlide.image}
            src={currentSlide.image}
            alt=""
            className="w-full h-full object-cover object-center scale-100 animate-in fade-in zoom-in-95 duration-700"
          />
          {/* Directional contrast scrim so text & cards are crisp while cover photo shines through */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      ) : (
        /* Fallback decorative ambient lighting when slide has no cover image */
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-primary-500/20 via-amber-400/15 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-rose-500/10 via-primary-400/10 to-transparent blur-3xl rounded-full" />
        </div>
      )}

      <div className="container relative z-10 mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SECTION: Title, Description, Buttons */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-7 animate-in fade-in duration-500">
            {/* Top Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/20 text-xs sm:text-sm font-semibold shadow-sm max-w-full">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">{badge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.16]">
              {title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2">
              {primaryBtnText && (
                <Link href={primaryBtnLink} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-5 sm:px-6 text-sm sm:text-base"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{primaryBtnText}</span>
                  </Button>
                </Link>
              )}
              {secondaryBtnText && (
                <Link href={secondaryBtnLink} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-5 sm:px-6 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                  >
                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                    <span>{secondaryBtnText}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Slide Navigation Controls */}
            {activeSlides.length > 1 && (
              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous slide"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next slide"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Indicators / Dots */}
                <div className="flex items-center gap-1.5">
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex
                          ? 'w-6 sm:w-7 bg-primary'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide Counter */}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
                  {isBn
                    ? `${toBengaliNumerals(currentIndex + 1)} / ${toBengaliNumerals(activeSlides.length)}`
                    : `0${currentIndex + 1} / 0${activeSlides.length}`}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT SECTION: Dynamic Statistics Numbers & Labels */}
          <div className="lg:col-span-5 xl:col-span-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 xs:p-6 sm:p-7 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {isBn ? 'প্ল্যাটফর্মের মূল পরিসংখ্যান' : 'Live Association Metrics'}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {isBn ? 'সক্রিয়' : 'Live'}
                </span>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                
                {/* Total Alumni */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/70 to-transparent dark:from-primary-950/30 border border-primary-100/70 dark:border-primary-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'নিবন্ধিত প্রাক্তন' : 'Total Alumni'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? `${toBengaliNumerals(stats.totalAlumni)}+` : `${stats.totalAlumni}+`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn ? 'বিশ্বব্যাপী প্রাক্তন' : 'Global graduates'}
                  </p>
                </div>

                {/* Batches */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-transparent dark:from-amber-950/30 border border-amber-100/70 dark:border-amber-900/40 space-y-1">
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
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 to-transparent dark:from-rose-950/30 border border-rose-100/70 dark:border-rose-900/40 space-y-1">
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
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-transparent dark:from-emerald-950/30 border border-emerald-100/70 dark:border-emerald-900/40 space-y-1">
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

              {/* Quick Treasury / Impact summary */}
              {stats.totalRaised && stats.totalRaised > 0 && (
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
                      {isBn
                        ? `৳ ${toBengaliNumerals(stats.totalRaised.toLocaleString('en-IN'))}`
                        : `৳ ${stats.totalRaised.toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
