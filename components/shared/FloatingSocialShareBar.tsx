'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Link2, Share2 } from 'lucide-react';
import {
  FacebookIcon,
  TwitterXIcon,
  WhatsAppIcon,
  LinkedInIcon,
} from '@/components/shared/SocialIcons';

interface FloatingSocialShareBarProps {
  title: string;
  description?: string;
  url?: string;
  locale?: string;
  className?: string;
}

export function FloatingSocialShareBar({
  title,
  description = '',
  url,
  locale = 'en',
  className = '',
}: FloatingSocialShareBarProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [isHiddenByFooter, setIsHiddenByFooter] = useState(false);
  const desktopBarRef = useRef<HTMLDivElement>(null);
  const isBn = locale === 'bn';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(url || window.location.href);
    }
  }, [url]);

  // Monitor footer proximity to prevent any overlap
  useEffect(() => {
    const handleScrollAndResize = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Mobile check: hide if footer is entering the viewport
      if (footerRect.top <= windowHeight - 20) {
        setIsNearFooter(true);
      } else {
        setIsNearFooter(false);
      }

      // Desktop check: if desktop bar bottom touches the footer top
      if (desktopBarRef.current) {
        const barRect = desktopBarRef.current.getBoundingClientRect();
        if (barRect.bottom >= footerRect.top - 16) {
          setIsHiddenByFooter(true);
        } else {
          setIsHiddenByFooter(false);
        }
      }
    };

    window.addEventListener('scroll', handleScrollAndResize, { passive: true });
    window.addEventListener('resize', handleScrollAndResize, { passive: true });
    handleScrollAndResize();

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      const targetUrl = currentUrl || window.location.href;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = targetUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareItems = [
    {
      id: 'facebook',
      name: 'Facebook',
      nameBn: 'ফেসবুক',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: FacebookIcon,
      color: 'text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30',
      ariaLabel: isBn ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      nameBn: 'এক্স (টুইটার)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
      icon: TwitterXIcon,
      color: 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600',
      ariaLabel: isBn ? 'এক্সে (টুইটার) শেয়ার করুন' : 'Share on X / Twitter',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      nameBn: 'হোয়াটসঅ্যাপ',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${title}\n${currentUrl}`
      )}`,
      icon: WhatsAppIcon,
      color: 'text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30',
      ariaLabel: isBn ? 'হোয়াটসঅ্যাপে শেয়ার করুন' : 'Share on WhatsApp',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      nameBn: 'লিঙ্কডইন',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: LinkedInIcon,
      color: 'text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30',
      ariaLabel: isBn ? 'লিঙ্কডইনে শেয়ার করুন' : 'Share on LinkedIn',
    },
  ];

  return (
    <>
      {/* DESKTOP (lg+): Sticky Vertical Rail bound to Content Section Boundary */}
      <div
        aria-hidden="true"
        className={`hidden lg:block absolute -left-14 xl:-left-20 top-0 bottom-0 pointer-events-none z-30 ${className}`}
      >
        <aside
          ref={desktopBarRef}
          aria-label={isBn ? 'সোশ্যাল মিডিয়া শেয়ারিং বার' : 'Social sharing bar'}
          className={`sticky top-28 pointer-events-auto flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-200 ${
            isHiddenByFooter ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100'
          }`}
        >
          <div className="p-1 text-slate-400 dark:text-slate-500 mb-0.5 select-none" title={isBn ? 'শেয়ার করুন' : 'Share'}>
            <Share2 className="w-4 h-4" />
          </div>

          <div className="w-5 h-px bg-slate-200 dark:bg-slate-800 mb-0.5" />

          {shareItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.ariaLabel}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border border-transparent transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-xs bg-slate-50 dark:bg-slate-800/60 ${item.color}`}
                >
                  <Icon size={18} />
                </a>

                {/* Tooltip on right */}
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50">
                  {isBn ? item.nameBn : item.name}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                </div>
              </div>
            );
          })}

          {/* Copy Link Button */}
          <div className="relative group pt-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={isBn ? 'লিংক কপি করুন' : 'Copy link'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-xs ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4 animate-in zoom-in-50 duration-150" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </button>

            {/* Tooltip */}
            <div
              className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap transition-all duration-150 z-50 ${
                copied
                  ? 'bg-emerald-600 text-white opacity-100 translate-x-0'
                  : 'bg-slate-900 dark:bg-slate-800 text-white opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0'
              }`}
            >
              {copied
                ? isBn
                  ? 'লিংক কপি হয়েছে!'
                  : 'Link copied!'
                : isBn
                ? 'লিংক কপি করুন'
                : 'Copy Link'}
              <div
                className={`absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent ${
                  copied
                    ? 'border-r-emerald-600'
                    : 'border-r-slate-900 dark:border-r-slate-800'
                }`}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE & TABLET (< lg): Sticky Horizontal Bottom Bar (Hides before footer) */}
      <aside
        aria-label={isBn ? 'সোশ্যাল মিডিয়া শেয়ারিং বার' : 'Social sharing bar'}
        className={`lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-[95vw] transition-all duration-300 ${
          isNearFooter
            ? 'translate-y-24 opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-1 flex items-center gap-1 shrink-0">
          <Share2 className="w-3 h-3 text-primary" />
          <span className="hidden xs:inline">{isBn ? 'শেয়ার' : 'Share'}</span>
        </span>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />

        <div className="flex items-center gap-2">
          {shareItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 bg-slate-100/90 dark:bg-slate-800 ${item.color}`}
              >
                <Icon size={16} />
              </a>
            );
          })}

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label={isBn ? 'লিংক কপি করুন' : 'Copy link'}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              copied
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                : 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-3.5 h-3.5" />}

            {/* Mobile Confirmation Badge */}
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap shadow-md animate-in zoom-in-75">
                {isBn ? 'কপি হয়েছে!' : 'Copied!'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
