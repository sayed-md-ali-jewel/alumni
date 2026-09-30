'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ShieldBan, ShieldCheck, UserX, UserCheck, Loader2 } from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

interface BlockUserButtonProps {
  targetUserId: string;
  targetUserName?: string;
  initialIsBlocked?: boolean;
  variant?: 'outline' | 'destructive' | 'ghost' | 'default' | 'badge';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  onStatusChange?: (isBlocked: boolean) => void;
  showText?: boolean;
}

export function BlockUserButton({
  targetUserId,
  targetUserName = 'this user',
  initialIsBlocked = false,
  variant,
  size = 'sm',
  className = '',
  onStatusChange,
  showText = true,
}: BlockUserButtonProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showConfirm, showSuccessToast, showErrorToast, showLoginPrompt } = useSweetAlert();

  const [isBlocked, setIsBlocked] = useState<boolean>(initialIsBlocked);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  const currentUserId = (session?.user as any)?.id?.toString();
  const isSelf = Boolean(currentUserId && targetUserId && currentUserId === targetUserId.toString());

  // Check initial block status if not explicitly passed
  useEffect(() => {
    if (initialIsBlocked !== undefined) {
      setIsBlocked(initialIsBlocked);
    }
  }, [initialIsBlocked]);

  useEffect(() => {
    if (!session || isSelf || !targetUserId) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        setChecking(true);
        const res = await fetch(`/api/user-blocks?targetUserId=${targetUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsBlocked(Boolean(data.isBlockedByViewer));
          }
        }
      } catch (err) {
        console.error('Failed to check block status:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [session, targetUserId, isSelf]);

  if (!session || isSelf) return null;

  const handleToggleBlock = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!session) {
      showLoginPrompt(isBn ? 'লগইন প্রয়োজন' : 'Please sign in');
      return;
    }

    if (isBlocked) {
      // Unblock confirmation
      showConfirm({
        title: isBn ? `${targetUserName}-কে আনব্লক করবেন?` : `Unblock ${targetUserName}?`,
        text: isBn
          ? `আনব্লক করার পর ${targetUserName} আপনাকে আবারও রক্তের অনুরোধ, বার্তা বা শুভেচ্ছা পাঠাতে পারবেন।`
          : `After unblocking, ${targetUserName} will be able to send you requests, blood inquiries, and messages again.`,
        confirmButtonText: isBn ? 'হ্যাঁ, আনব্লক করুন' : 'Yes, Unblock',
        cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
        type: 'warning',
        onConfirm: async () => {
          try {
            setLoading(true);
            const res = await fetch(`/api/user-blocks?targetUserId=${targetUserId}`, {
              method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to unblock user');

            setIsBlocked(false);
            onStatusChange?.(false);
            showSuccessToast(
              isBn ? `${targetUserName}-কে সফলভাবে আনব্লক করা হয়েছে।` : `${targetUserName} has been unblocked.`,
              isBn ? 'আনব্লক সম্পন্ন' : 'User Unblocked'
            );
          } catch (err: any) {
            showErrorToast(err.message || 'Error unblocking user');
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      // Block confirmation
      showConfirm({
        title: isBn ? `${targetUserName}-কে ব্লক করবেন?` : `Block ${targetUserName}?`,
        text: isBn
          ? `ব্লক করার পর এই ব্যবহারকারী আপনাকে কোনো রক্তের অনুরোধ, অনুদান বার্তা বা অন্য কোনো অনুরোধ পাঠাতে পারবেন না।`
          : `Once blocked, this user will not be able to send you any blood requests, donation messages, greetings, or other inquiries.`,
        confirmButtonText: isBn ? 'হ্যাঁ, ব্লক করুন' : 'Yes, Block User',
        cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
        type: 'warning',
        onConfirm: async () => {
          try {
            setLoading(true);
            const res = await fetch('/api/user-blocks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetUserId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to block user');

            setIsBlocked(true);
            onStatusChange?.(true);
            showSuccessToast(
              isBn ? `${targetUserName}-কে ব্লক করা হয়েছে।` : `${targetUserName} has been blocked.`,
              isBn ? 'ব্লক সম্পন্ন' : 'User Blocked'
            );
          } catch (err: any) {
            showErrorToast(err.message || 'Error blocking user');
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleToggleBlock}
        disabled={loading || checking}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          isBlocked
            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900/60'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
        } ${className}`}
        title={isBlocked ? (isBn ? 'ব্যবহারকারী আনব্লক করুন' : 'Unblock user') : (isBn ? 'ব্যবহারকারী ব্লক করুন' : 'Block user')}
      >
        {loading || checking ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isBlocked ? (
          <ShieldBan className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        ) : (
          <UserX className="w-3.5 h-3.5 text-slate-500" />
        )}
        {showText && (
          <span>
            {isBlocked ? (isBn ? 'আনব্লক করুন' : 'Unblock User') : (isBn ? 'ব্লক করুন' : 'Block User')}
          </span>
        )}
      </button>
    );
  }

  const defaultVariant = isBlocked ? 'outline' : variant || 'outline';

  return (
    <Button
      type="button"
      size={size}
      variant={defaultVariant}
      onClick={handleToggleBlock}
      disabled={loading || checking}
      className={`rounded-xl text-xs font-semibold gap-1.5 transition-all ${
        isBlocked
          ? 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40'
          : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      } ${className}`}
      title={isBlocked ? (isBn ? 'ব্যবহারকারী আনব্লক করুন' : 'Unblock user') : (isBn ? 'ব্যবহারকারী ব্লক করুন' : 'Block user')}
    >
      {loading || checking ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isBlocked ? (
        <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
      ) : (
        <UserX className="w-3.5 h-3.5" />
      )}
      {showText && (
        <span>
          {isBlocked ? (isBn ? 'আনব্লক করুন' : 'Unblock User') : (isBn ? 'ব্লক করুন' : 'Block User')}
        </span>
      )}
    </Button>
  );
}
