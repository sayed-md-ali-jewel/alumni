'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileImagePreviewModal } from './ProfileImagePreviewModal';
import { Maximize2, ZoomIn, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileAvatarWithPreviewProps {
  src?: string | null;
  name?: string;
  fallback?: string;
  batch?: string | number | null;
  group?: string | null;
  bloodGroup?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  isVerified?: boolean;
  committeePostName?: string | null;
  location?: string | null;
  locale?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  avatarClassName?: string;
  showZoomBadge?: boolean;
}

export function ProfileAvatarWithPreview({
  src,
  name = 'Alumni Member',
  fallback,
  batch,
  group,
  bloodGroup,
  jobTitle,
  company,
  isVerified,
  committeePostName,
  location,
  locale = 'en',
  size = 'xl',
  className = '',
  avatarClassName = '',
  showZoomBadge = true,
}: ProfileAvatarWithPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isBn = locale === 'bn';

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          'relative group cursor-pointer inline-block rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 select-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]',
          className
        )}
        title={isBn ? 'প্রোফাইল ছবি বড় করে দেখতে ক্লিক করুন' : 'Click to preview profile image'}
        aria-label={isBn ? `${name}-এর প্রোফাইল ছবি বড় করে দেখুন` : `Preview profile image of ${name}`}
      >
        <Avatar
          src={src || undefined}
          fallback={name || fallback || 'AL'}
          size={size}
          className={cn(
            'transition-all duration-200 group-hover:brightness-95',
            avatarClassName
          )}
        />

        {/* Hover Overlay with Eye / Zoom icon */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[1px] pointer-events-none">
          <Eye className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md text-white mb-0.5" />
          <span className="text-[10px] sm:text-xs font-bold tracking-tight drop-shadow-md">
            {isBn ? 'প্রিভিউ' : 'Preview'}
          </span>
        </div>

        {/* Zoom badge at bottom-right */}
        {showZoomBadge && (
          <div
            className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center ring-2 ring-white dark:ring-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-200 scale-90 sm:scale-100 pointer-events-none"
            title={isBn ? 'ছবি দেখুন' : 'View photo'}
          >
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        )}
      </div>

      {/* Profile Image Preview Modal */}
      <ProfileImagePreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageUrl={src}
        name={name}
        batch={batch}
        group={group}
        locale={locale}
        bloodGroup={bloodGroup}
        jobTitle={jobTitle}
        company={company}
        isVerified={isVerified}
        committeePostName={committeePostName}
        location={location}
      />
    </>
  );
}
