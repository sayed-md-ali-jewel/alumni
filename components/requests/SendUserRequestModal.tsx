'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import {
  X,
  Send,
  MessageSquare,
  Search,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Mic,
  Square,
  Trash2,
  Paperclip,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

interface SendUserRequestModalProps {
  recipient?: any; // User or AlumniProfile object
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (messageItem?: any) => void;
}

export function SendUserRequestModal({
  recipient: initialRecipient,
  isOpen,
  onClose,
  onSuccess,
}: SendUserRequestModalProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showSuccessToast, showErrorToast, showLoginPrompt } = useSweetAlert();

  const [selectedRecipient, setSelectedRecipient] = useState<any>(initialRecipient || null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Media Attachment States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string>('');
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedRecipient(initialRecipient || null);
      setMessage('');
      setImageFile(null);
      setImagePreview('');
      setImageUrl('');
      setVoiceBlob(null);
      setVoiceUrl('');
      setIsRecording(false);
      setRecordingDuration(0);
      setErrorMessage('');
      setRecipientSearch('');
      setSearchResults([]);
    } else {
      stopRecordingCleanup();
    }
  }, [isOpen, initialRecipient]);

  // Handle user search if no recipient is selected
  useEffect(() => {
    if (!recipientSearch.trim() || selectedRecipient) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`/api/alumni?q=${encodeURIComponent(recipientSearch)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.profiles || []);
        }
      } catch (err) {
        console.error('Error searching alumni:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recipientSearch, selectedRecipient]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isOpen) return null;

  const currentUserId = (session?.user as any)?.id?.toString();
  const recipientUser = selectedRecipient?.userId || selectedRecipient;
  const recipientUserId = (selectedRecipient?.userId?._id || selectedRecipient?.userId || selectedRecipient?._id)?.toString();
  const isSelf = Boolean(currentUserId && recipientUserId && currentUserId === recipientUserId);

  // Handle image file selection and upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(isBn ? 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারে।' : 'Image size cannot exceed 10MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage('');
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setImageUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading image');
      setImageFile(null);
      setImagePreview('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Voice Recording
  const startRecording = async () => {
    try {
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(audioBlob);
        const localVoiceUrl = URL.createObjectURL(audioBlob);
        setVoiceUrl(localVoiceUrl);
        stream.getTracks().forEach((track) => track.stop());

        // Auto upload voice recording
        await uploadVoiceBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        isBn
          ? 'মাইক্রোফোন অ্যাক্সেস করতে ব্যর্থ হয়েছে। ব্রাউজার পারমিশন চেক করুন।'
          : 'Failed to access microphone. Please check browser permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecordingCleanup();
    setIsRecording(false);
    setVoiceBlob(null);
    setVoiceUrl('');
    setRecordingDuration(0);
  };

  const uploadVoiceBlob = async (blob: Blob) => {
    setIsUploadingVoice(true);
    try {
      const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload voice message');

      setVoiceUrl(data.url);
    } catch (err: any) {
      console.error('Error uploading voice:', err);
      setErrorMessage(err.message || 'Error saving voice recording');
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const removeVoice = () => {
    setVoiceBlob(null);
    setVoiceUrl('');
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!session) {
      showLoginPrompt(isBn ? 'বার্তা পাঠাতে লগইন করুন' : 'Please sign in to send a message');
      return;
    }

    if (!selectedRecipient) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে একজন প্রাপক নির্বাচন করুন।' : 'Please select a recipient.');
      return;
    }

    if (isSelf) {
      setErrorMessage(isBn ? 'আপনি নিজেকে বার্তা পাঠাতে পারবেন না।' : 'You cannot send a message to yourself.');
      return;
    }

    const hasText = Boolean(message && message.trim().length > 0);
    const hasImg = Boolean(imageUrl && imageUrl.trim().length > 0);
    const hasAudio = Boolean(voiceUrl && voiceUrl.trim().length > 0);

    if (!hasText && !hasImg && !hasAudio) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে বার্তা লিখুন, একটি ছবি যুক্ত করুন অথবা ভয়েস রেকর্ড করুন।'
          : 'Please enter text, attach an image, or record a voice message.'
      );
      return;
    }

    if (isUploadingImage || isUploadingVoice) {
      setErrorMessage(isBn ? 'মিডিয়া ফাইল আপলোড হচ্ছে, অপেক্ষা করুন...' : 'Media uploading in progress, please wait...');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const targetUserId =
        selectedRecipient?.userId?._id ||
        selectedRecipient?.userId ||
        selectedRecipient?._id ||
        selectedRecipient?.id;

      const contentType = hasAudio ? 'voice' : hasImg && !hasText ? 'image' : 'text';

      const payload = {
        recipientId: targetUserId.toString(),
        message: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        voiceUrl: voiceUrl.trim() || undefined,
        contentType,
      };

      const res = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      showSuccessToast(
        isBn ? 'বার্তা সফলভাবে পাঠানো হয়েছে।' : 'Message sent successfully.',
        isBn ? 'বার্তা প্রেরিত' : 'Message Sent'
      );

      onSuccess?.(data.request);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send message');
      showErrorToast(err.message || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const hasContent = Boolean(message.trim() || imageUrl || voiceUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {isBn ? 'ব্যক্তিগত বার্তা পাঠান' : 'Send Private Message'}
              </h3>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {isBn ? 'টেক্সট, ছবি বা ভয়েস বার্তার মাধ্যমে যোগাযোগ করুন' : 'Chat via text, image, or voice note'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {/* Recipient Display / Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{isBn ? 'প্রাপক সদস্য *' : 'Recipient *'}</span>
              {selectedRecipient && !initialRecipient && (
                <button
                  type="button"
                  onClick={() => setSelectedRecipient(null)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  {isBn ? 'প্রাপক পরিবর্তন করুন' : 'Change recipient'}
                </button>
              )}
            </label>

            {selectedRecipient ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <Avatar
                  src={recipientUser?.image}
                  fallback={recipientUser?.name || 'AL'}
                  size="md"
                  className="w-11 h-11 ring-2 ring-primary/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {recipientUser?.name || 'Alumni Member'}
                    </p>
                    {recipientUser?.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {recipientUser?.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder={isBn ? 'সদস্যের নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search recipient by name or email...'}
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="pl-9 rounded-xl text-xs"
                  />
                  {searchLoading && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-primary" />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-1 bg-white dark:bg-slate-800 shadow-md divide-y divide-slate-100 dark:divide-slate-700/50 max-h-48 overflow-y-auto">
                    {searchResults.map((prof) => (
                      <button
                        key={prof._id}
                        type="button"
                        onClick={() => {
                          setSelectedRecipient(prof);
                          setRecipientSearch('');
                        }}
                        className="w-full p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Avatar
                          src={prof.userId?.image}
                          fallback={prof.userId?.name || 'AL'}
                          size="sm"
                          className="w-8 h-8 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {prof.userId?.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {prof.userId?.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Message Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isBn ? 'বার্তা লিখুন' : 'Message'}
            </label>
            <Textarea
              rows={4}
              placeholder={isBn ? 'আপনার বার্তা এখানে লিখুন...' : 'Type your message here...'}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrorMessage('');
              }}
              className="rounded-2xl text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Attached Image Preview */}
          {imagePreview && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-primary">
                  <ImageIcon className="w-4 h-4" />
                  <span>{isBn ? 'সংযুক্ত ছবি' : 'Attached Image'}</span>
                </span>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  className="max-h-48 w-full object-contain rounded-xl"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'ছবি আপলোড হচ্ছে...' : 'Uploading image...'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Recording / Playback Preview */}
          {isRecording ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  {isBn ? 'ভয়েস রেকর্ড হচ্ছে...' : 'Recording voice note...'}
                </span>
                <span className="font-mono text-xs font-bold text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-md bg-white/80 dark:bg-rose-900/50">
                  {formatDuration(recordingDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-xl text-xs font-bold gap-1.5 h-8 px-3"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isBn ? 'রেকর্ড শেষ করুন' : 'Stop'}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={cancelRecording}
                  className="rounded-xl text-xs h-8 px-2.5"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
              </div>
            </div>
          ) : voiceUrl ? (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Volume2 className="w-4 h-4" />
                  <span>{isBn ? 'ভয়েস বার্তা রেকর্ডকৃত' : 'Voice Message Attached'}</span>
                </span>
                <button
                  type="button"
                  onClick={removeVoice}
                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove voice note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <audio controls src={voiceUrl} className="w-full h-10 rounded-xl" />
              </div>

              {isUploadingVoice && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{isBn ? 'ভয়েস ফাইল সংরক্ষিত হচ্ছে...' : 'Saving voice message...'}</span>
                </p>
              )}
            </div>
          ) : null}

          {/* Quick Attachment Buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage || Boolean(imagePreview)}
              className="rounded-xl text-xs gap-1.5 font-semibold text-slate-700 dark:text-slate-300 h-9"
            >
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              <span>{isBn ? 'ছবি যুক্ত করুন' : 'Add Image'}</span>
            </Button>

            {!isRecording && !voiceUrl && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startRecording}
                className="rounded-xl text-xs gap-1.5 font-semibold text-slate-700 dark:text-slate-300 h-9"
              >
                <Mic className="w-3.5 h-3.5 text-rose-500" />
                <span>{isBn ? 'ভয়েস রেকর্ড করুন' : 'Record Voice'}</span>
              </Button>
            )}
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-xs flex items-start gap-2 border border-destructive/20 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl text-xs"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedRecipient || !hasContent || isUploadingImage || isUploadingVoice}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/20 px-5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isBn ? 'বার্তা পাঠান' : 'Send Message'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
