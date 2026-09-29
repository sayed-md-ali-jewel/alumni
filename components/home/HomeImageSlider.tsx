'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Users, ArrowRight } from 'lucide-react';

interface SlideItem {
  _id?: string;
  image?: string;
  title_en?: string;
  title_bn?: string;
  description_en?: string;
  description_bn?: string;
  buttonText_en?: string;
  buttonText_bn?: string;
  buttonLink?: string;
}

interface HomeImageSliderProps {
  slides: SlideItem[];
  showTitle?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
  isBn?: boolean;
}

export function HomeImageSlider({
  slides,
  showTitle = true,
  showDescription = true,
  showButton = true,
  isBn = false,
}: HomeImageSliderProps) {
  // Filter slides that have images or fallback
  const validSlides = slides.filter((s) => s.image && s.image.trim() !== '');

  const displaySlides =
    validSlides.length > 0
      ? validSlides
      : [
          {
            title_en: 'Building Lifelong Bonds & Global Opportunities',
            title_bn: 'আজীবন সৌহার্দ্য ও বিশ্বমানের সুযোগের মেলবন্ধন',
            description_en:
              'Participate in annual reunions, mentorship programs, student emergency relief, and our dedicated voluntary blood donation circle.',
            description_bn:
              'বার্ষিক পুনর্মিলনী, জুনিয়র মেন্টরশিপ, শিক্ষার্থীদের জরুরি চিকিৎসা অনুদান এবং আমাদের জরুরি রক্তদান সার্কেলে অংশ নিন।',
            buttonText_en: 'Explore Directory',
            buttonText_bn: 'প্রাক্তনদের খুঁজুন',
            buttonLink: '/directory',
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85',
          },
          {
            title_en: 'Honoring Our Roots, Empowering the Future',
            title_bn: 'শিকড়ের টানে, আগামীর পানে — আমাদের অ্যালামনাই পরিবার',
            description_en:
              'Connect with thousands of distinguished alumni across the globe. Unlock career networking, memorable reunions, and student endowment programs.',
            description_bn:
              'আমাদের প্রিয় বিদ্যাপীঠের হাজারো কৃতি প্রাক্তনের সাথে যুক্ত হোন। পেশাগত নেটওয়ার্কিং ও পুনর্মিলনীর সারথি হোন।',
            buttonText_en: 'Support Endowment',
            buttonText_bn: 'তহবিলে অনুদান দিন',
            buttonLink: '/donate',
            image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=85',
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (displaySlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [displaySlides.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
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

  if (displaySlides.length === 0) return null;

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  // Check if any overlay element is active
  const hasOverlay = showTitle || showDescription || showButton;

  const currentTitle = isBn ? currentSlide.title_bn : currentSlide.title_en;
  const currentDescription = isBn ? currentSlide.description_bn : currentSlide.description_en;
  const currentButtonText = isBn
    ? currentSlide.buttonText_bn || 'প্রাক্তনদের খুঁজুন'
    : currentSlide.buttonText_en || 'Explore Directory';
  const currentButtonLink = currentSlide.buttonLink || '/directory';

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950 group h-[380px] sm:h-[460px] md:h-[540px] lg:h-[600px] xl:h-[660px] border-b border-slate-200/80 dark:border-slate-800/80 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-width Slide Background Images with smooth Ken Burns animation and optional blur */}
      {displaySlides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide._id || slide.image || idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt=""
              className={`w-full h-full object-cover object-center transform transition-all duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              } ${hasOverlay ? 'blur-[1.5px] brightness-[0.88]' : 'blur-0 brightness-100'}`}
            />
          </div>
        );
      })}

      {/* Overlay Scrim & Ambient Gradients */}
      {hasOverlay ? (
        // High legibility gradient scrim with subtle backdrop blur when text is enabled
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/85 via-black/55 to-black/25 dark:from-slate-950/90 dark:via-slate-950/60 dark:to-slate-950/30 backdrop-blur-[1px]" />
      ) : (
        // Minimal edge vignette when only clean images are displayed
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
      )}

      {/* Dynamic Slide Content Overlay (Title, Description, Button) */}
      {hasOverlay && (
        <div className="absolute inset-0 z-30 flex items-center">
          <div className="container mx-auto px-6 sm:px-10 lg:px-16">
            <div
              key={currentIndex}
              className="max-w-3xl space-y-4 sm:space-y-6 text-white animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
            >
              {/* Title */}
              {showTitle && currentTitle && (
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-5.5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
                  {currentTitle}
                </h2>
              )}

              {/* Description */}
              {showDescription && currentDescription && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200/90 max-w-2xl leading-relaxed drop-shadow-sm font-normal">
                  {currentDescription}
                </p>
              )}

              {/* Action Button */}
              {showButton && currentButtonText && (
                <div className="pt-2">
                  <Link href={currentButtonLink}>
                    <Button
                      size="lg"
                      className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-7 py-3 text-sm sm:text-base shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Users className="w-5 h-5" />
                      <span>{currentButtonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Navigation Arrows with Hover Glow & Glassmorphism */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide image"
            className="absolute left-4 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl hover:shadow-primary/30"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide image"
            className="absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl hover:shadow-primary/30"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Bottom Pagination Dots with Smooth Pill Expansion */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
            {displaySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide image ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-white shadow-md shadow-white/40'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
