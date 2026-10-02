'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Droplet,
  Award,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { toBengaliNumerals } from '@/lib/utils';

export interface ProfileImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  name: string;
  batch?: string | number | null;
  group?: string | null;
  locale?: string;
  bloodGroup?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  isVerified?: boolean;
  committeePostName?: string | null;
  location?: string | null;
}

const groupLabelBn: Record<string, string> = {
  Science: 'বিজ্ঞান',
  Commerce: 'ব্যবসায় শিক্ষা',
  Humanities: 'মানবিক',
};

export function ProfileImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  name,
  batch,
  group,
  locale = 'en',
  bloodGroup,
  jobTitle,
  company,
  isVerified,
  committeePostName,
  location,
}: ProfileImagePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);

  const isBn = locale === 'bn';

  // Handle keyboard events (Escape to close) and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setZoomLevel(1);
      setImageError(false);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // Compute initials for fallback
  const initials = (name || 'AL')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Format batch
  const batchFormatted = batch
    ? isBn
      ? `ব্যাচ ${toBengaliNumerals(batch)}`
      : `Batch ${batch}`
    : isBn
    ? 'ব্যাচ তথ্য নেই'
    : 'N/A';

  // Format group
  const groupFormatted = group
    ? isBn
      ? groupLabelBn[group] || group
      : group
    : isBn
    ? 'গ্রুপ তথ্য নেই'
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-preview-name"
    >
      <div
        className="relative w-full max-w-lg sm:max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 z-10 shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? 'প্রোফাইল ছবি প্রিভিউ' : 'Profile Image Preview'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {imageUrl && !imageError && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={isBn ? 'ছোট করুন' : 'Zoom Out'}
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={isBn ? 'রিসেট' : 'Reset Zoom'}
                  aria-label="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={isBn ? 'বড় করুন' : 'Zoom In'}
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={isBn ? 'ডাউনলোড / মূল ছবি' : 'Download / Open Full Photo'}
                  aria-label="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer ml-1"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* [ Large Profile Image Stage ] */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[260px] sm:min-h-[320px] max-h-[50vh] sm:max-h-[54vh] select-none">
          {imageUrl && !imageError ? (
            <div
              className="transition-transform duration-150 ease-out flex items-center justify-center w-full h-full"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imageUrl}
                alt={name || 'Profile preview image'}
                className="max-h-[46vh] sm:max-h-[50vh] max-w-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-primary-900 via-primary-700 to-amber-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-black ring-4 ring-white/20 shadow-2xl">
                {initials}
              </div>
              <p className="mt-3 text-xs text-slate-400 font-medium">
                {isBn ? 'কোনো প্রোফাইল ছবি পাওয়া যায়নি' : 'No profile photo available'}
              </p>
            </div>
          )}
        </div>

        {/* [ User Basic Profile Information ] */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          {/* User Name (Visually Prominent) & Badges */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2
                id="profile-preview-name"
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
              >
                {name}
              </h2>

              <div className="flex items-center gap-1.5 flex-wrap">
                {isVerified && (
                  <Badge variant="success" className="px-2.5 py-0.5 gap-1 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'যাচাইকৃত' : 'Verified'}</span>
                  </Badge>
                )}

                {bloodGroup && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] shadow-xs">
                    <Droplet className="w-3 h-3 fill-current text-rose-100" />
                    <span>{bloodGroup}</span>
                  </div>
                )}

                {committeePostName && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50 text-[11px] font-bold">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span>{committeePostName}</span>
                  </div>
                )}
              </div>
            </div>

            {(jobTitle || company) && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {jobTitle || (isBn ? 'প্রাক্তন শিক্ষার্থী' : 'Alumnus')}
                {company && <span className="text-primary font-bold"> @ {company}</span>}
              </p>
            )}

            {location && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Batch & Group Secondary Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Batch */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {isBn ? 'পাসের সন / ব্যাচ' : 'Graduation Batch'}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {batchFormatted}
                </p>
              </div>
            </div>

            {/* Group */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {isBn ? 'গ্রুপ / শাখা' : 'Group'}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {groupFormatted}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
