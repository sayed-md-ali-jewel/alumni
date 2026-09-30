'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ShieldBan,
  ShieldCheck,
  UserX,
  Search,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { formatDate } from '@/lib/utils';

interface BlockedUsersListProps {
  onUnblockSuccess?: () => void;
}

export function BlockedUsersList({ onUnblockSuccess }: BlockedUsersListProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showConfirm, showSuccessToast, showErrorToast } = useSweetAlert();

  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch('/api/user-blocks');
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [session]);

  const handleUnblock = (targetUserId: string, targetName: string) => {
    showConfirm({
      title: isBn ? `${targetName}-কে আনব্লক করবেন?` : `Unblock ${targetName}?`,
      text: isBn
        ? `আনব্লক করার পর ${targetName} আপনাকে রক্তের অনুরোধ, অনুদান বার্তা বা শুভেচ্ছা পাঠাতে পারবেন।`
        : `After unblocking, ${targetName} will be able to send you blood requests, donation messages, and inquiries again.`,
      confirmButtonText: isBn ? 'হ্যাঁ, আনব্লক করুন' : 'Yes, Unblock',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          setUnblockingId(targetUserId);
          const res = await fetch(`/api/user-blocks?targetUserId=${targetUserId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to unblock user');

          setBlockedUsers((prev) =>
            prev.filter((item) => {
              const uId = item.user?._id?.toString() || item.user?.toString();
              return uId !== targetUserId;
            })
          );

          showSuccessToast(
            isBn ? `${targetName}-কে সফলভাবে আনব্লক করা হয়েছে।` : `${targetName} has been unblocked.`,
            isBn ? 'আনব্লক সম্পন্ন' : 'User Unblocked'
          );
          onUnblockSuccess?.();
        } catch (err: any) {
          showErrorToast(err.message || 'Error unblocking user');
        } finally {
          setUnblockingId(null);
        }
      },
    });
  };

  const filtered = blockedUsers.filter((item) => {
    const user = item.user || {};
    const name = user.name || '';
    const email = user.email || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldBan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isBn ? 'ব্লক করা ব্যবহারকারীর তালিকা' : 'Blocked Users Management'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                {blockedUsers.length}
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isBn
                ? 'ব্লক করা ব্যবহারকারীরা আপনাকে কোনো রক্তের অনুরোধ বা বার্তা পাঠাতে পারবে না।'
                : 'Blocked members cannot initiate any blood, donation, greeting, or message requests to you.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {blockedUsers.length > 0 && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? 'নাম বা ইমেইল খুঁজুন...' : 'Filter blocked users...'}
                className="pl-8 h-8 text-xs rounded-xl"
              />
            </div>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={fetchBlockedUsers}
            disabled={loading}
            className="rounded-xl h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300"
            title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
          <p className="text-xs text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading blocked users...'}</p>
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="py-12 px-4 rounded-3xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {isBn ? 'আপনার কোনো ব্লক করা ব্যবহারকারী নেই' : 'No Blocked Users'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {isBn
                ? 'আপনি কাউকে ব্লক করলে তাদের প্রোফাইল ও আনব্লক করার সুবিধা এখানে দেখা যাবে।'
                : 'Any users you choose to block will appear here for easy management and unblocking.'}
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <p>{isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching blocked users found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((item) => {
            const user = item.user || {};
            const profile = item.profile || {};
            const targetId = user._id?.toString() || user?.toString();
            const isUnblocking = unblockingId === targetId;

            return (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={user.image}
                    fallback={user.name || 'U'}
                    size="md"
                    className="w-11 h-11 ring-2 ring-rose-200 dark:ring-rose-900/60 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name || 'Alumni Member'}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                      {profile.batchYear && (
                        <span className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                          <GraduationCap className="w-3 h-3 text-primary" />
                          <span>Batch {profile.batchYear}</span>
                        </span>
                      )}
                      {user.bloodGroup && (
                        <span className="font-bold text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60">
                          {user.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                    <Calendar className="w-3 h-3" />
                    <span>{isBn ? 'ব্লক করা হয়েছে: ' : 'Blocked on: '}</span>
                    <span>{formatDate(item.createdAt, locale)}</span>
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnblock(targetId, user.name || 'User')}
                    disabled={isUnblocking}
                    className="rounded-xl h-7 px-3 text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40 gap-1.5"
                  >
                    {isUnblocking ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{isBn ? 'আনব্লক করুন' : 'Unblock'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
