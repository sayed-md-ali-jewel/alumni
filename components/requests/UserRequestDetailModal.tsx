'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Check,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  User,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Phone,
  Mail,
  Loader2,
  ShieldBan,
  Image as ImageIcon,
  Mic,
  Volume2,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BlockUserButton } from './BlockUserButton';
import { SendUserRequestModal } from './SendUserRequestModal';
import { formatDate } from '@/lib/utils';

interface UserRequestDetailModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess?: (updatedRequest?: any) => void;
  onDeleted?: (requestId: string) => void;
}

export function UserRequestDetailModal({
  request,
  isOpen,
  onClose,
  onUpdateSuccess,
  onDeleted,
}: UserRequestDetailModalProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showConfirm, showSuccessToast, showErrorToast } = useSweetAlert();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);

  if (!isOpen || !request) return null;

  const currentUserId = (session?.user as any)?.id?.toString();
  const senderId = request.senderId?._id?.toString() || request.senderId?.toString();
  const recipientId = request.recipientId?._id?.toString() || request.recipientId?.toString();

  const isRecipient = currentUserId === recipientId;
  const isSender = currentUserId === senderId;

  const sender = request.senderId || {};
  const recipient = request.recipientId || {};

  const statusBadgeConfig: Record<
    string,
    { label: string; labelBn: string; colorClass: string; icon: any }
  > = {
    Pending: {
      label: 'Pending',
      labelBn: 'অপেক্ষমান',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      icon: Clock,
    },
    Accepted: {
      label: 'Accepted',
      labelBn: 'গৃহীত',
      colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      icon: CheckCircle2,
    },
    Rejected: {
      label: 'Declined',
      labelBn: 'প্রত্যাখ্যাত',
      colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      icon: XCircle,
    },
    Read: {
      label: 'Read',
      labelBn: 'পঠিত',
      colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      icon: Check,
    },
  };

  const currentStatus = statusBadgeConfig[request.status] || statusBadgeConfig.Pending;
  const StatusIcon = currentStatus.icon;

  const handleDelete = () => {
    showConfirm({
      title: isBn ? 'বার্তা মুছে ফেলবেন?' : 'Delete message?',
      text: isBn ? 'এই বার্তাটি স্থায়ীভাবে মুছে যাবে।' : 'This message will be permanently deleted.',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, delete',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          setLoadingAction('delete');
          const res = await fetch(`/api/user-requests/${request._id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete message');

          showSuccessToast(
            isBn ? 'বার্তা মুছে ফেলা হয়েছে।' : 'Message deleted successfully.',
            isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted'
          );

          onDeleted?.(request._id);
          onUpdateSuccess?.();
          onClose();
        } catch (err: any) {
          showErrorToast(err.message || 'Error deleting message');
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  const otherUser = isSender ? recipient : sender;
  const otherUserId = isSender ? recipientId : senderId;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base leading-tight">
                    {isBn ? 'ব্যক্তিগত বার্তা' : 'Private Message'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${currentStatus.colorClass}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{isBn ? currentStatus.labelBn : currentStatus.label}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{request.date}</span>
                  <span>•</span>
                  <span>{request.time}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
            {/* Sender & Recipient Identity Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sender card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isBn ? 'প্রেরক' : 'Sender'}
                  </span>
                  {isSender && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                      {isBn ? 'আপনি' : 'You'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={sender.image}
                    fallback={sender.name || 'S'}
                    size="sm"
                    className="w-9 h-9 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sender.name || 'Alumni Member'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {sender.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isBn ? 'প্রাপক' : 'Recipient'}
                  </span>
                  {isRecipient && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                      {isBn ? 'আপনি' : 'You'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={recipient.image}
                    fallback={recipient.name || 'R'}
                    size="sm"
                    className="w-9 h-9 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {recipient.name || 'Alumni Member'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {recipient.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Subject if any */}
            {request.subject && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isBn ? 'বিষয়' : 'Subject'}
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {request.subject}
                </p>
              </div>
            )}

            {/* Text Message Content */}
            {request.message && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {isBn ? 'বার্তা' : 'Message Content'}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                  {request.message}
                </p>
              </div>
            )}

            {/* Attached Image Content */}
            {request.imageUrl && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-primary">
                    <ImageIcon className="w-4 h-4" />
                    <span>{isBn ? 'সংযুক্ত ছবি' : 'Attached Image'}</span>
                  </span>
                  <a
                    href={request.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{isBn ? 'মূল ছবি দেখুন' : 'View Full Image'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center max-h-72">
                  <img
                    src={request.imageUrl}
                    alt="Attached file"
                    className="max-h-72 w-full object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Attached Voice Message Content */}
            {request.voiceUrl && (
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 space-y-2.5">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 text-purple-600" />
                  <span>{isBn ? 'ভয়েস বার্তা' : 'Voice Message'}</span>
                </span>
                <audio controls src={request.voiceUrl} className="w-full h-10 rounded-xl" />
              </div>
            )}

            {/* Previous Response Note if any */}
            {request.responseMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  {isBn ? 'উত্তর / মন্তব্য' : 'Response Note'}
                </p>
                <p className="text-xs text-emerald-900 dark:text-emerald-100 italic">
                  "{request.responseMessage}"
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              {/* Block / Unblock User Action */}
              {otherUserId && (
                <BlockUserButton
                  targetUserId={otherUserId}
                  targetUserName={otherUser.name || 'User'}
                  initialIsBlocked={request.isOtherUserBlocked}
                  size="sm"
                  variant="outline"
                />
              )}

              {/* Delete button if sender */}
              {isSender && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={Boolean(loadingAction)}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Reply Button to open message composer */}
              {isRecipient && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowReplyModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'উত্তর দিন' : 'Reply'}</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <SendUserRequestModal
          recipient={otherUser}
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          onSuccess={() => {
            onUpdateSuccess?.();
            onClose();
          }}
        />
      )}
    </>
  );
}
