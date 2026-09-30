'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { MessageSquare } from 'lucide-react';
import { SendUserRequestModal } from './SendUserRequestModal';
import { BlockUserButton } from './BlockUserButton';
import { useSweetAlert } from '@/components/ui/SweetAlert';

interface DirectoryUserActionsProps {
  targetUser: any; // User or AlumniProfile
  variant?: 'detail' | 'card';
  className?: string;
}

export function DirectoryUserActions({
  targetUser,
  variant = 'detail',
  className = '',
}: DirectoryUserActionsProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showLoginPrompt } = useSweetAlert();

  const [showModal, setShowModal] = useState<boolean>(false);

  const currentUserId = (session?.user as any)?.id?.toString();
  const resolvedUser = targetUser?.userId || targetUser;
  const targetUserId = (resolvedUser?._id || resolvedUser?.id || targetUser?._id)?.toString();
  const isSelf = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

  if (isSelf) return null;

  const handleOpenModal = () => {
    if (!session) {
      showLoginPrompt(isBn ? 'বার্তা পাঠাতে অনুগ্রহ করে লগইন করুন' : 'Please sign in to send a message');
      return;
    }
    setShowModal(true);
  };

  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenModal}
          className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/5"
          title={isBn ? 'ব্যক্তিগত বার্তা পাঠান' : 'Send private message'}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{isBn ? 'বার্তা' : 'Message'}</span>
        </Button>

        {targetUserId && (
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

