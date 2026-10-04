'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Search, X, User, CheckCircle2, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';

interface WhatsAppNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
}

export function WhatsAppNewChatModal({
  isOpen,
  onClose,
  onSelectUser,
}: WhatsAppNewChatModalProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: '25',
          ...(search.trim() ? { search: search.trim() } : {}),
        });

        const res = await fetch(`/api/alumni?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.alumni || data.profiles || []);
        }
      } catch (err) {
        console.error('Error searching alumni for new chat:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#008069] dark:bg-[#005c4b] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isBn ? 'নতুন চ্যাট শুরু করুন' : 'New Chat'}
              </h3>
              <p className="text-xs text-emerald-100">
                {isBn ? 'বার্তা পাঠাতে সদস্য খুঁজুন' : 'Select an alumni to start chatting'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? 'নাম, ব্যাচ বা পদবী দিয়ে খুঁজুন...' : 'Search by name, batch, or company...'}
              className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              autoFocus
            />
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isBn ? 'সদস্য তালিকা লোড হচ্ছে...' : 'Loading alumni members...'}
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'কোনো সদস্য পাওয়া যায়নি' : 'No alumni found matching query'}
              </p>
            </div>
          ) : (
            users.map((item) => {
              const u = item.userId || item;
              const userId = (u._id || item._id)?.toString();
              const name = u.name || item.name || 'Alumni Member';
              const img = u.image || item.image;
              const batch = item.batchYear ? `Batch '${String(item.batchYear).slice(-2)}` : '';
              const group = item.group || '';
              const subtitle = [batch, group, item.jobTitle || item.company]
                .filter(Boolean)
                .join(' • ');
              const isTargetChatEnabled = u?.isChatEnabled !== false && item?.isChatEnabled !== false;

              return (
                <button
                  key={userId}
                  type="button"
                  disabled={!isTargetChatEnabled}
                  onClick={() => {
                    if (!isTargetChatEnabled) return;
                    onSelectUser(u);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors text-left group ${
                    !isTargetChatEnabled
                      ? 'opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/30'
                      : 'hover:bg-emerald-50/70 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={img}
                      fallback={name}
                      size="md"
                      className="w-10 h-10 rounded-full shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {name}
                        </span>
                        {u.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        {!isTargetChatEnabled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium">
                            {isBn ? 'চ্যাট নিষ্ক্রিয়' : 'Chat Disabled'}
                          </span>
                        )}
                      </div>
                      {subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
