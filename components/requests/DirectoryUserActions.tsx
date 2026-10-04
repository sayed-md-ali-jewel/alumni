'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { MessageSquare } from 'lucide-react';
import { SendUserRequestModal } from './SendUserRequestModal';
import { BlockUserButton } from './BlockUserButton';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

interface DirectoryUserActionsProps {
  targetUser: any; // User or AlumniProfile
  variant?: 'detail' | 'card';
  className?: string;
  showBlock?: boolean;
}

export function DirectoryUserActions({
  targetUser,
  variant = 'detail',
  className = '',
  showBlock = false,
}: DirectoryUserActionsProps) {
  const { data: session } = useSession();
  const { settings } = useSiteSettings();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showLoginPrompt, showErrorToast } = useSweetAlert();

  const [showModal, setShowModal] = useState<boolean>(false);

  const currentUserId = (session?.user as any)?.id?.toString();
  const currentUserChatEnabled = (session?.user as any)?.isChatEnabled !== false;
  const isGlobalChatEnabled = settings.isChatEnabled !== false;

  const resolvedUser = targetUser?.userId || targetUser;
  const targetUserId = (resolvedUser?._id || resolvedUser?.id || targetUser?._id)?.toString();
  const isTargetChatEnabled = resolvedUser?.isChatEnabled !== false && targetUser?.isChatEnabled !== false;
  const isChatAllowed = isGlobalChatEnabled && currentUserChatEnabled && isTargetChatEnabled;

  const isSelf = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

  if (isSelf) return null;

  const handleOpenModal = () => {
    if (!isGlobalChatEnabled) {
      showErrorToast(
        isBn ? 'চ্যাট সুবিধা সাময়িকভাবে বন্ধ আছে' : 'Chat is currently disabled globally',
        isBn ? 'বিজ্ঞপ্তি' : 'Notice'
      );
      return;
    }
    if (session && !currentUserChatEnabled) {
      showErrorToast(
        isBn ? 'আপনার অ্যাকাউন্টের জন্য চ্যাট সুবিধা বর্তমানে বন্ধ রয়েছে।' : 'Chat is currently unavailable for your account.',
        isBn ? 'অনুমতি নেই' : 'Restricted'
      );
      return;
    }
    if (!isTargetChatEnabled) {
      showErrorToast(
        isBn ? 'এই সদস্যের চ্যাট সুবিধা বন্ধ রয়েছে।' : 'Chat is currently unavailable for this user.',
        isBn ? 'বিজ্ঞপ্তি' : 'Notice'
      );
      return;
    }
    if (!session) {
      showLoginPrompt(isBn ? 'বার্তা পাঠাতে অনুগ্রহ করে লগইন করুন' : 'Please sign in to send a message');
      return;
    }
    setShowModal(true);
  };

  if (variant === 'card') {
    if (!isChatAllowed) {
      if (showBlock && targetUserId) {
        return (
          <div className={`flex items-center gap-1.5 ${className}`}>
            <BlockUserButton
              targetUserId={targetUserId}
              targetUserName={resolvedUser?.name || 'User'}
              size="sm"
              variant="badge"
              showText={false}
            />
          </div>
        );
      }
      return null;
    }

    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenModal}
          className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-colors shadow-none"
          title={isBn ? 'ব্যক্তিগত বার্তা পাঠান' : 'Send private message'}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isBn ? 'বার্তা' : 'Message'}</span>
        </Button>

        {showBlock && targetUserId && (
          <BlockUserButton
            targetUserId={targetUserId}
            targetUserName={resolvedUser?.name || 'User'}
            size="sm"
            variant="badge"
            showText={false}
          />
        )}

        <SendUserRequestModal
          recipient={targetUser}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    );
  }

  if (!isChatAllowed) {
    if (showBlock && targetUserId) {
      return (
        <div className={`space-y-2.5 ${className}`}>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isBn ? 'প্রাইভেসি ও নিয়ন্ত্রণ:' : 'Privacy Control:'}
            </span>
            <BlockUserButton
              targetUserId={targetUserId}
              targetUserName={resolvedUser?.name || 'User'}
              size="sm"
              variant="outline"
              className="h-8"
            />
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Primary Send Message Button */}
      <Button
        onClick={handleOpenModal}
        className="w-full gap-2 text-xs rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all h-10"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{isBn ? 'ব্যক্তিগত বার্তা পাঠান' : 'Send Private Message'}</span>
      </Button>

      {/* Block / Unblock Action Button */}
      {targetUserId && (
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isBn ? 'প্রাইভেসি ও নিয়ন্ত্রণ:' : 'Privacy Control:'}
          </span>
          <BlockUserButton
            targetUserId={targetUserId}
            targetUserName={resolvedUser?.name || 'User'}
            size="sm"
            variant="outline"
            className="h-8"
          />
        </div>
      )}

      {/* Modal instance */}
      <SendUserRequestModal
        recipient={targetUser}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

