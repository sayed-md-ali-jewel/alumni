'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Search,
  Send,
  Image as ImageIcon,
  Mic,
  Square,
  Trash2,
  X,
  Play,
  Pause,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  User,
  ShieldBan,
  ExternalLink,
  ChevronDown,
  Paperclip,
  Smile,
  Lock,
  Volume2,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { WhatsAppAudioPlayer } from './WhatsAppAudioPlayer';
import { WhatsAppImageLightbox } from './WhatsAppImageLightbox';
import { WhatsAppNewChatModal } from './WhatsAppNewChatModal';
import { BlockUserButton } from './BlockUserButton';

function WhatsAppStatusCheck({
  read,
  status,
  isList = false,
  className = 'w-3.5 h-3.5',
}: {
  read?: boolean;
  status?: string;
  isList?: boolean;
  className?: string;
}) {
  const isRead = Boolean(read || status === 'Read' || status === 'Accepted');

  if (isRead) {
    return (
      <svg
        viewBox="0 0 16 11"
        className={`${className} ${
          isList ? 'text-sky-500 dark:text-sky-400' : 'text-[#53bdeb]'
        } shrink-0 fill-none stroke-current`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Read"
      >
        <path d="M1 5.8l3.5 3.5L11 1.8" />
        <path d="M5.5 5.8l3.5 3.5L15 1.8" />
      </svg>
    );
  }

  if (status === 'Delivered') {
    return (
      <svg
        viewBox="0 0 16 11"
        className={`${className} ${
          isList ? 'text-slate-400 dark:text-slate-500' : 'text-white/80 dark:text-white/85'
        } shrink-0 fill-none stroke-current`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Delivered"
      >
        <path d="M1 5.8l3.5 3.5L11 1.8" />
        <path d="M5.5 5.8l3.5 3.5L15 1.8" />
      </svg>
    );
  }

  // Sent (single check)
  return (
    <svg
      viewBox="0 0 12 11"
      className={`${className} ${
        isList ? 'text-slate-400 dark:text-slate-500' : 'text-white/80 dark:text-white/85'
      } shrink-0 fill-none stroke-current`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Sent"
    >
      <path d="M1.5 5.8l3.5 3.5L11 1.8" />
    </svg>
  );
}

interface WhatsAppChatViewProps {
  initialContactId?: string;
  onActiveConversationChange?: (contactId: string | null) => void;
  className?: string;
}

export function WhatsAppChatView({
  initialContactId,
  onActiveConversationChange,
  className = '',
}: WhatsAppChatViewProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showErrorToast, showSuccessToast } = useSweetAlert();

  const currentUserId = (session?.user as any)?.id?.toString();

  // Conversations List State
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [convSearch, setConvSearch] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [totalUnread, setTotalUnread] = useState<number>(0);

  // Presence & Online State Management
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  // Active Chat State
  const [activeContactId, setActiveContactId] = useState<string | null>(initialContactId || null);
  const [activeContact, setActiveContact] = useState<any | null>(null);
  const [isContactBlocked, setIsContactBlocked] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(Boolean(initialContactId));

  // Composer States
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Image Attachment States
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [isUploadingVoice, setIsUploadingVoice] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // UI Modals & Lightbox
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    caption?: string;
    senderName?: string;
    timestamp?: string;
  }>({
    isOpen: false,
    imageUrl: '',
  });

  // Scroll & Message State Management
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);
  const [unreadIncomingCount, setUnreadIncomingCount] = useState<number>(0);
  const initialScrollDoneRef = useRef<boolean>(false);
  const lastMessageCountRef = useRef<number>(0);
  const lastMessageIdRef = useRef<string>('');
  const isNearBottomRef = useRef<boolean>(true);

  // ----------------------------------------------------
  // 1. Fetch Conversations List
  // ----------------------------------------------------
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const params = new URLSearchParams({
        filter: filterTab,
        ...(convSearch.trim() ? { search: convSearch.trim() } : {}),
      });

      const res = await fetch(`/api/user-requests/conversations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const convList: any[] = data.conversations || [];
        setConversations(convList);
        setTotalUnread(data.totalUnread || 0);

        // Update real-time presence map from conversation list
        const updatedPresence: Record<string, boolean> = {};
        convList.forEach((c: any) => {
          if (c.contactId) {
            updatedPresence[c.contactId] = Boolean(c.isOnline ?? c.contact?.isOnline ?? false);
          }
        });
        setPresenceMap((prev) => ({ ...prev, ...updatedPresence }));

        // If activeContact is selected, update its local data
        if (activeContactId) {
          const matched = convList.find(
            (c: any) => c.contactId === activeContactId
          );
          if (matched) {
            setActiveContact(matched.contact);
            setIsContactBlocked(matched.isBlocked);
            if (matched.contactId) {
              setPresenceMap((prev) => ({
                ...prev,
                [matched.contactId]: Boolean(matched.isOnline ?? matched.contact?.isOnline ?? false),
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId, filterTab, convSearch, activeContactId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ----------------------------------------------------
  // 2. Fetch Messages for Active Conversation
  // ----------------------------------------------------
  const fetchMessages = useCallback(
    async (contactId: string, isInitial = false) => {
      if (!contactId || !currentUserId) return;
      try {
        if (isInitial) setLoadingMessages(true);

        const res = await fetch(`/api/user-requests?conversationWith=${contactId}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          const newMsgList: any[] = data.messages || [];

          if (data.contact) {
            setActiveContact(data.contact);
            const isOnline = Boolean(data.isOnline ?? data.contact?.isOnline ?? false);
            setPresenceMap((prev) => ({
              ...prev,
              [contactId]: isOnline,
            }));
          }
          setIsContactBlocked(Boolean(data.isBlocked));

          const prevCount = lastMessageCountRef.current;
          const prevLastId = lastMessageIdRef.current;
          const currentLastId =
            newMsgList.length > 0 ? newMsgList[newMsgList.length - 1]._id || '' : '';

          const hasNewMessages =
            newMsgList.length > prevCount ||
            (newMsgList.length > 0 && currentLastId !== prevLastId);

          setMessages(newMsgList);
          lastMessageCountRef.current = newMsgList.length;
          lastMessageIdRef.current = currentLastId;

          if (isInitial) {
            // Initial conversation open: scroll to latest message ONCE
            setTimeout(() => {
              if (!initialScrollDoneRef.current) {
                initialScrollDoneRef.current = true;
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
              }
            }, 60);
          } else if (hasNewMessages) {
            // Background update with truly new messages
            const container = messageContainerRef.current;
            const isNearBottom = container
              ? container.scrollHeight - container.scrollTop - container.clientHeight <= 120
              : true;

            if (isNearBottom) {
              // User is already at the bottom, keep them at bottom smoothly
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 60);
            } else {
              // User is reading previous messages: DO NOT force them down!
              const newCount = Math.max(1, newMsgList.length - prevCount);
              setUnreadIncomingCount((prev) => prev + newCount);
              setShowScrollBottom(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (isInitial) setLoadingMessages(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    if (activeContactId) {
      initialScrollDoneRef.current = false;
      lastMessageCountRef.current = 0;
      lastMessageIdRef.current = '';
      setUnreadIncomingCount(0);
      setShowScrollBottom(false);
      fetchMessages(activeContactId, true);
      setShowMobileChat(true);
      onActiveConversationChange?.(activeContactId);
    } else {
      setMessages([]);
      setActiveContact(null);
      initialScrollDoneRef.current = false;
      lastMessageCountRef.current = 0;
      lastMessageIdRef.current = '';
      setUnreadIncomingCount(0);
      setShowScrollBottom(false);
      onActiveConversationChange?.(null);
    }
  }, [activeContactId, fetchMessages, onActiveConversationChange]);

  // ----------------------------------------------------
  // 3. Real-time Background Polling & Presence Tracker
  // ----------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeContactId) {
        fetchMessages(activeContactId, false);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, activeContactId]);

  // Real-time presence polling for all active contacts in conversation list + open chat
  useEffect(() => {
    if (!currentUserId) return;

    let isSubscribed = true;
    const fetchRealTimePresence = async () => {
      const contactIds = Array.from(
        new Set(
          conversations
            .map((c) => c.contactId)
            .concat(activeContactId ? [activeContactId] : [])
            .filter(Boolean)
        )
      );

      if (contactIds.length === 0) return;

      try {
        const res = await fetch(`/api/presence?userIds=${contactIds.join(',')}`);
        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data?.presence) {
            const nextMap: Record<string, boolean> = {};
            for (const [id, info] of Object.entries(data.presence as Record<string, any>)) {
              nextMap[id] = Boolean(info?.isOnline);
            }
            setPresenceMap((prev) => ({ ...prev, ...nextMap }));
          }
        }
      } catch {
        // ignore
      }
    };

    fetchRealTimePresence();
    const presenceTimer = setInterval(fetchRealTimePresence, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(presenceTimer);
    };
  }, [currentUserId, conversations, activeContactId]);

  // ----------------------------------------------------
  // 4. Scroll Detection
  // ----------------------------------------------------
  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isScrolledUp = distanceFromBottom > 120;
    isNearBottomRef.current = !isScrolledUp;

    if (!isScrolledUp) {
      setShowScrollBottom(false);
      setUnreadIncomingCount(0);
    } else {
      setShowScrollBottom(true);
    }
  };

  const scrollToBottom = () => {
    isNearBottomRef.current = true;
    setShowScrollBottom(false);
    setUnreadIncomingCount(0);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // 5. Image Attachment Handling
  // ----------------------------------------------------
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast(
        isBn ? 'অনুগ্রহ করে ছবি ফাইল নির্বাচন করুন' : 'Please select an image file',
        isBn ? 'ভুল ফরম্যাট' : 'Invalid format'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast(
        isBn ? 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারে' : 'Image size cannot exceed 10MB',
        isBn ? 'ফাইলের আকার বড়' : 'File too large'
      );
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ----------------------------------------------------
  // 6. Voice Recording Handling
  // ----------------------------------------------------
  const startRecording = async () => {
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        showErrorToast(
          isBn
            ? 'আপনার ব্রাউজারে ভয়েস রেকর্ডিং সাপোর্ট করে না'
            : 'Voice recording is not supported in this browser'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      setIsRecording(true);
      setRecordDuration(0);
      setRecordedAudioBlob(null);
      setRecordedAudioUrl('');

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      showErrorToast(
        isBn
          ? 'মাইক্রোফোনের অনুমতি পাওয়া যায়নি'
          : 'Microphone permission denied or not available',
        isBn ? 'অনুমতি আবশ্যক' : 'Permission Required'
      );
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecording();
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl('');
    setRecordDuration(0);
  };

  // ----------------------------------------------------
  // 7. Upload Media Helper
  // ----------------------------------------------------
  const uploadFile = async (file: File | Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, filename);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload attachment');
    }

    const data = await res.json();
    return data.url;
  };

  // ----------------------------------------------------
  // 8. Send Message Handler
  // ----------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeContactId || isSending) return;

    // Auto-stop active recording if user hits send
    if (isRecording) {
      stopRecording();
    }

    const hasText = inputText.trim().length > 0;
    const hasImage = Boolean(selectedImageFile);
    const hasVoice = Boolean(recordedAudioBlob);

    if (!hasText && !hasImage && !hasVoice) return;

    try {
      setIsSending(true);

      let uploadedImageUrl = '';
      let uploadedVoiceUrl = '';

      // 1. Upload image if selected
      if (selectedImageFile) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadFile(
          selectedImageFile,
          selectedImageFile.name || `image_${Date.now()}.png`
        );
        setIsUploadingImage(false);
      }

      // 2. Upload voice note if recorded
      if (recordedAudioBlob) {
        setIsUploadingVoice(true);
        uploadedVoiceUrl = await uploadFile(
          recordedAudioBlob,
          `voice_${Date.now()}.${recordedAudioBlob.type.includes('mp4') ? 'mp4' : 'webm'}`
        );
        setIsUploadingVoice(false);
      }

      const contentType = uploadedVoiceUrl
        ? 'voice'
        : uploadedImageUrl && !hasText
        ? 'image'
        : 'text';

      const payload = {
        recipientId: activeContactId,
        message: inputText.trim(),
        imageUrl: uploadedImageUrl,
        voiceUrl: uploadedVoiceUrl,
        contentType,
      };

      const res = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to send message');
      }

      // Reset composer states
      setInputText('');
      clearSelectedImage();
      cancelRecording();

      // Immediately append message to conversation stream
      if (resData.request) {
        setMessages((prev) => {
          const updated = [...prev, resData.request];
          lastMessageCountRef.current = updated.length;
          lastMessageIdRef.current = resData.request._id || '';
          return updated;
        });
        setUnreadIncomingCount(0);
        setShowScrollBottom(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }

      // Refresh conversations list to update lastMessage
      fetchConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      showErrorToast(err.message || 'Failed to send message', isBn ? 'ত্রুটি' : 'Error');
    } finally {
      setIsSending(false);
      setIsUploadingImage(false);
      setIsUploadingVoice(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ----------------------------------------------------
  // 9. Formatting Helpers
  // ----------------------------------------------------
  const formatChatTime = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (isYesterday) {
      return isBn ? 'গতকাল' : 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTimestamp = (dateInput?: string | Date, fallbackTime?: string) => {
    if (fallbackTime && !dateInput) return fallbackTime;
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallbackTime || '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatRecordTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Group messages by calendar date for WhatsApp date separators
  const renderDateSeparator = (currMsg: any, prevMsg: any) => {
    const currDate = new Date(currMsg.createdAt || currMsg.date).toDateString();
    const prevDate = prevMsg ? new Date(prevMsg.createdAt || prevMsg.date).toDateString() : null;

    if (currDate === prevDate) return null;

    const now = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let label = currDate;
    if (currDate === now) label = isBn ? 'আজ' : 'Today';
    else if (currDate === yesterday) label = isBn ? 'গতকাল' : 'Yesterday';
    else {
      const d = new Date(currMsg.createdAt || currMsg.date);
      label = d.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    return (
      <div className="flex items-center justify-center my-3 select-none">
        <span className="px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-[11px] font-bold shadow-xs border border-slate-200/60 dark:border-slate-700/60 uppercase tracking-wider backdrop-blur-xs">
          {label}
        </span>
      </div>
    );
  };

  const activeContactUserId = (activeContact?._id || activeContactId)?.toString();
  const isActiveContactOnline = Boolean(
    activeContactUserId &&
    (presenceMap[activeContactUserId] ?? activeContact?.isOnline ?? false)
  );

  return (
    <div
      className={`w-full max-w-[4000px] mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex h-[620px] sm:h-[680px] md:h-[720px] lg:h-[760px] xl:h-[800px] max-h-[85vh] ${className}`}
    >
      {/* ==================================================== */}
      {/* LEFT PANEL: CONVERSATION LIST & SEARCH              */}
      {/* ==================================================== */}
      <div
        className={`w-full md:w-[320px] lg:w-[360px] xl:w-[380px] 2xl:w-[400px] shrink-0 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-all ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={session?.user?.image || undefined}
              fallback={session?.user?.name || 'AL'}
              size="sm"
              className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {isBn ? 'বার্তা ও চ্যাট' : 'Direct Messages'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalUnread > 0
                  ? isBn
                    ? `${totalUnread} টি নতুন বার্তা`
                    : `${totalUnread} unread`
                  : isBn
                  ? 'সব বার্তা পঠিত'
                  : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={fetchConversations}
              disabled={loadingConversations}
              className="w-8 h-8 rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingConversations ? 'animate-spin text-emerald-600' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm"
              title={isBn ? 'নতুন চ্যাট শুরু করুন' : 'New Chat'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder={isBn ? 'চ্যাট খুঁজুন...' : 'Search or start new chat...'}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900"
            />
            {convSearch && (
              <button
                type="button"
                onClick={() => setConvSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-2.5">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                filterTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'সকল' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors flex items-center gap-1 ${
                filterTab === 'unread'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{isBn ? 'অপঠিত' : 'Unread'}</span>
              {totalUnread > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversations List with Slim Scrollbar */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800/60 scrollbar-thin">
          {loadingConversations ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isBn ? 'চ্যাট তালিকা লোড হচ্ছে...' : 'Loading conversations...'}
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {filterTab === 'unread'
                    ? isBn
                      ? 'কোনো অপঠিত বার্তা নেই'
                      : 'No unread messages'
                    : isBn
                    ? 'এখনো কোনো বার্তা শুরু হয়নি'
                    : 'No conversations yet'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'সহপাঠী ও প্রাক্তন সদস্যদের সাথে চ্যাট শুরু করতে "+" বাটনে চাপুন।'
                    : 'Start a direct chat by clicking the "+" button above.'}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowNewChatModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 h-8 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন বার্তা পাঠান' : 'Start New Chat'}</span>
              </Button>
            </div>
          ) : (
            conversations.map((conv) => {
              const contact = conv.contact || {};
              const lastMsg = conv.lastMessage || {};
              const isActive = activeContactId === conv.contactId;
              const isLastMsgMine = lastMsg.senderId?.toString() === currentUserId;
              const isContactOnline = Boolean(
                presenceMap[conv.contactId] ?? conv.isOnline ?? contact.isOnline ?? false
              );

              return (
                <div
                  key={conv.contactId}
                  onClick={() => {
                    setActiveContactId(conv.contactId);
                    setActiveContact(contact);
                    setShowMobileChat(true);
                  }}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer transition-all border-l-4 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 border-emerald-500'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Contact Avatar with Online Dot */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={contact.image}
                      fallback={contact.name || 'AL'}
                      size="md"
                      className="w-11 h-11 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 object-cover"
                    />
                    {/* Active/online indicator dot */}
                    {isContactOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs animate-in fade-in zoom-in-75 duration-200" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isActive
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {contact.name || 'Alumni Member'}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatChatTime(lastMsg.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      {/* Last Message Snippet */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {isLastMsgMine && (
                          <span className="shrink-0 inline-flex items-center justify-center mr-0.5">
                            <WhatsAppStatusCheck
                              read={lastMsg.read}
                              status={lastMsg.status}
                              isList={true}
                              className="w-3.5 h-3"
                            />
                          </span>
                        )}

                        {lastMsg.contentType === 'voice' || lastMsg.voiceUrl ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Mic className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ভয়েস বার্তা' : 'Voice message'}</span>
                          </span>
                        ) : lastMsg.contentType === 'image' || lastMsg.imageUrl ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ছবি' : 'Photo'}</span>
                            {lastMsg.message && (
                              <span className="text-slate-500 truncate">: {lastMsg.message}</span>
                            )}
                          </span>
                        ) : (
                          <span className="truncate">{lastMsg.message || 'New message'}</span>
                        )}
                      </div>

                      {/* Unread Pill Badge */}
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* RIGHT PANEL: CHAT WINDOW & COMPOSER                 */}
      {/* ==================================================== */}
      <div
        className={`w-full md:flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 transition-all ${
          showMobileChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        {!activeContactId ? (
          // Empty State (WhatsApp Web Style Welcome View)
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900/60 border-b-4 border-emerald-500">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1.5">
              {isBn ? 'অ্যালামনাই ডিরেক্ট মেসেজিং' : 'Alumni Direct Chat'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
              {isBn
                ? 'সহপাঠী ও প্রাক্তন সদস্যদের সাথে তাৎক্ষণিকভাবে ব্যক্তিগত টেক্সট, ছবি ও অডিও ভয়েস বার্তা আদান-প্রদান করুন।'
                : 'Send and receive secure one-to-one text messages, photos, and voice notes with fellow alumni.'}
            </p>
            <Button
              onClick={() => setShowNewChatModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs gap-2 shadow-md shadow-emerald-600/20 px-5 h-10"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন বার্তা শুরু করুন' : 'Start New Conversation'}</span>
            </Button>

            <div className="mt-8 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isBn ? 'ব্যক্তিগত ও নিরাপদ যোগাযোগ' : 'Private & Secure 1-to-1 Messaging'}</span>
            </div>
          </div>
        ) : (
          // Active Chat View
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-white dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Arrow */}
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 -ml-1.5"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  <Avatar
                    src={activeContact?.image}
                    fallback={activeContact?.name || 'AL'}
                    size="md"
                    className="w-10 h-10 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 object-cover"
                  />
                  {isActiveContactOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs animate-in fade-in zoom-in-75 duration-200" />
                  )}
                </div>

                {/* Contact Name & Subtitle */}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{activeContact?.name || 'Alumni Member'}</span>
                  </h3>
                  <p className="text-[11px] truncate flex items-center gap-1.5">
                    {isActiveContactOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {isBn ? 'সক্রিয়' : 'Online / Active'}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">
                        {isBn ? 'অফলাইন' : 'Offline'}
                      </span>
                    )}
                    {activeContact?.profile?.batchYear ? (
                      <span className="text-slate-400 font-normal">
                        • Batch &apos;{String(activeContact.profile.batchYear).slice(-2)}
                      </span>
                    ) : activeContact?.batchYear ? (
                      <span className="text-slate-400 font-normal">
                        • Batch &apos;{String(activeContact.batchYear).slice(-2)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activeContact?._id && (
                  <>
                    <Link
                      href={`/directory/${activeContact._id}`}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                      title={isBn ? 'প্রোফাইল দেখুন' : 'View Profile'}
                    >
                      <User className="w-4 h-4" />
                    </Link>

                    <BlockUserButton
                      targetUserId={activeContact._id}
                      targetUserName={activeContact.name || 'User'}
                      size="sm"
                      variant="outline"
                      showText={false}
                      className="h-8 w-8 p-0 rounded-full border-slate-200 dark:border-slate-700"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Blocked Safety Notice */}
            {isContactBlocked && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 px-4 z-10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldBan className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">
                    {isBn
                      ? 'এই ব্যবহারকারীকে আপনি ব্লক করেছেন।'
                      : 'You have blocked this member.'}
                  </span>
                </div>
                {activeContact?._id && (
                  <BlockUserButton
                    targetUserId={activeContact._id}
                    targetUserName={activeContact.name || 'User'}
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] px-2.5 rounded-lg border-rose-300 dark:border-rose-800"
                  />
                )}
              </div>
            )}

            {/* Messages Scroll Area with WhatsApp Pattern Background */}
            <div
              ref={messageContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3.5 sm:p-4 md:p-6 space-y-2.5 chat-pattern-bg scrollbar-thin relative"
            >
              {loadingMessages ? (
                <div className="py-20 text-center space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-500">
                    {isBn ? 'বার্তা লোড হচ্ছে...' : 'Loading messages...'}
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-3 bg-white/75 dark:bg-slate-800/80 backdrop-blur-xs rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs mt-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {isBn ? 'কথোপকথন শুরু করুন' : 'Start the conversation'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn
                      ? `"${activeContact?.name || 'সদস্য'}"-কে একটি বার্তা, ছবি বা ভয়েস নোট পাঠান।`
                      : `Say hello to ${activeContact?.name || 'this member'} with a text, photo, or voice message.`}
                  </p>
                </div>
              ) : (
                messages.map((msgItem, index) => {
                  const isMine =
                    msgItem.senderId?._id?.toString() === currentUserId ||
                    msgItem.senderId?.toString() === currentUserId;
                  const prevMsg = index > 0 ? messages[index - 1] : null;

                  return (
                    <React.Fragment key={msgItem._id || index}>
                      {renderDateSeparator(msgItem, prevMsg)}

                      <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`relative group max-w-[88%] sm:max-w-[72%] md:max-w-[65%] rounded-2xl shadow-xs transition-shadow ${
                            isMine
                              ? 'bg-[#005c4b] dark:bg-[#005c4b] text-white rounded-tr-xs'
                              : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-tl-xs border border-slate-200/80 dark:border-[#202c33]'
                          } p-2.5 sm:p-3 space-y-1.5`}
                        >
                          {/* Image Message */}
                          {msgItem.imageUrl && (
                            <div
                              onClick={() =>
                                setLightboxData({
                                  isOpen: true,
                                  imageUrl: msgItem.imageUrl,
                                  caption: msgItem.message,
                                  senderName: isMine ? 'You' : activeContact?.name,
                                  timestamp: formatMessageTimestamp(
                                    msgItem.createdAt,
                                    msgItem.time
                                  ),
                                })
                              }
                              className="cursor-pointer overflow-hidden rounded-xl group/img relative"
                            >
                              <img
                                src={msgItem.imageUrl}
                                alt="Shared image"
                                className="max-h-72 w-full object-cover rounded-xl transition-transform group-hover/img:scale-[1.02] duration-200 select-none"
                              />
                            </div>
                          )}

                          {/* Voice Message */}
                          {msgItem.voiceUrl && (
                            <WhatsAppAudioPlayer
                              audioUrl={msgItem.voiceUrl}
                              isSender={isMine}
                            />
                          )}

                          {/* Text Message */}
                          {msgItem.message && (
                            <p
                              className={`text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words select-text ${
                                isMine
                                  ? 'text-white dark:text-[#e9edef]'
                                  : 'text-slate-900 dark:text-[#e9edef]'
                              }`}
                            >
                              {msgItem.message}
                            </p>
                          )}

                          {/* Message Metadata Footer */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] select-none pt-0.5 leading-none ${
                              isMine
                                ? 'text-white/80 dark:text-[#aebac1]'
                                : 'text-slate-500 dark:text-[#8696a0]'
                            }`}
                          >
                            <span className="leading-none whitespace-nowrap">
                              {formatMessageTimestamp(msgItem.createdAt, msgItem.time)}
                            </span>
                            {isMine && (
                              <span
                                className="inline-flex items-center justify-center shrink-0 ml-0.5 leading-none"
                                title={msgItem.read ? 'Read' : msgItem.status || 'Sent'}
                              >
                                <WhatsAppStatusCheck
                                  read={msgItem.read}
                                  status={msgItem.status}
                                  className="w-3.5 h-3"
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll to Bottom / New Messages Button */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                className={`absolute right-4 bottom-20 z-20 flex items-center gap-1.5 shadow-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  unreadIncomingCount > 0
                    ? 'px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 font-bold text-xs animate-bounce'
                    : 'w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 justify-center'
                }`}
                title={isBn ? 'সর্বশেষ বার্তায় যান' : 'Scroll to latest message'}
              >
                {unreadIncomingCount > 0 ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>
                      {isBn
                        ? `নতুন বার্তা (${unreadIncomingCount})`
                        : `New messages (${unreadIncomingCount})`}
                    </span>
                  </>
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}

            {/* ==================================================== */}
            {/* BOTTOM MESSAGE COMPOSER                             */}
            {/* ==================================================== */}
            <div className="bg-slate-100/95 dark:bg-slate-900/95 border-t border-slate-200/90 dark:border-slate-800 p-2.5 sm:p-3.5 shrink-0 backdrop-blur-md z-10">
              {/* Image Preview Strip if image is attached */}
              {imagePreviewUrl && (
                <div className="mb-2.5 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={imagePreviewUrl}
                      alt="Selected preview"
                      className="w-12 h-12 object-cover rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 select-none"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {selectedImageFile?.name || 'Attached Image'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {selectedImageFile
                          ? `${(selectedImageFile.size / 1024).toFixed(0)} KB`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Live Voice Recording Strip */}
              {isRecording ? (
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-emerald-500/50 shadow-inner animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {formatRecordTimer(recordDuration)}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {isBn ? 'রেকর্ড হচ্ছে...' : 'Recording voice note...'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors"
                      title={isBn ? 'বাতিল করুন' : 'Discard recording'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                      title={isBn ? 'রেকর্ডিং থামান ও শুনুন' : 'Stop & Preview'}
                    >
                      <Square className="w-3.5 h-3.5 fill-current text-rose-500" />
                      <span>{isBn ? 'প্রিভিউ' : 'Preview'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isSending || isUploadingVoice}
                      className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#029070] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                      title={isBn ? 'ভয়েস বার্তা পাঠান' : 'Send voice message'}
                    >
                      {isSending || isUploadingVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : recordedAudioUrl ? (
                // Recorded Audio Preview Before Sending
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-emerald-500/40 shadow-inner animate-in fade-in">
                  <div className="flex-1 min-w-0">
                    <WhatsAppAudioPlayer audioUrl={recordedAudioUrl} isSender={false} />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center transition-colors"
                      title={isBn ? 'মুছে ফেলুন' : 'Delete audio'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isSending || isUploadingVoice}
                      className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#029070] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                      title={isBn ? 'ভয়েস বার্তা পাঠান' : 'Send voice message'}
                    >
                      {isSending || isUploadingVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Standard Text & Attachments Composer
                <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2">
                  {/* Hidden Image File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    className="hidden"
                  />

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isContactBlocked || isSending}
                    className="w-10 h-10 rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0"
                    title={isBn ? 'ছবি সংযুক্ত করুন' : 'Attach photo'}
                  >
                    <Paperclip className="w-5 h-5 -rotate-45" />
                  </button>

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <textarea
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isContactBlocked || isSending}
                      placeholder={
                        isContactBlocked
                          ? isBn
                            ? 'ব্যবহারকারী ব্লক থাকায় বার্তা পাঠানো যাবে না'
                            : 'Cannot message a blocked contact'
                          : isBn
                          ? 'একটি বার্তা লিখুন...'
                          : 'Type a message...'
                      }
                      className="w-full resize-none py-2.5 px-4 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner max-h-32 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Voice / Send Action Button */}
                  {inputText.trim() || selectedImageFile ? (
                    <button
                      type="submit"
                      disabled={isContactBlocked || isSending || isUploadingImage}
                      className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029070] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
                      title={isBn ? 'বার্তা পাঠান' : 'Send message'}
                    >
                      {isSending || isUploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 translate-x-0.5" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isContactBlocked || isSending}
                      className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
                      title={isBn ? 'ভয়েস রেকর্ড করতে চাপুন' : 'Record voice note'}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODALS & LIGHTBOX                                    */}
      {/* ==================================================== */}
      <WhatsAppNewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectUser={(selectedUser) => {
          const uId = (selectedUser?._id || selectedUser?.id)?.toString();
          if (uId) {
            setActiveContactId(uId);
            setActiveContact(selectedUser);
            setShowMobileChat(true);
          }
        }}
      />

      <WhatsAppImageLightbox
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.imageUrl}
        caption={lightboxData.caption}
        senderName={lightboxData.senderName}
        timestamp={lightboxData.timestamp}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
