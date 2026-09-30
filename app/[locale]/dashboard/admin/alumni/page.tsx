'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Filter,
  Download,
  Check,
  X,
  RefreshCw,
  Droplet,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Lock,
  GraduationCap,
  Sparkles,
  Award,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { ALUMNI_GROUPS, BLOOD_GROUPS, DONATION_STATUSES } from '@/lib/types';

interface AlumniFormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'alumni' | 'admin';
  isVerified: boolean;
  image: string;
  batchYear: number | string;
  group: string;
  bloodGroup: string;
  jobTitle: string;
  company: string;
  location: string;
  bio: string;
  skills: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
  visibility: 'public' | 'alumni_only';
  isBloodDonor: boolean;
  donationStatus: string;
  committeePost: string;
  committeeRoleTitle: string;
}

const initialFormData: AlumniFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'alumni',
  isVerified: true,
  image: '',
  batchYear: new Date().getFullYear(),
  group: 'Science',
  bloodGroup: '',
  jobTitle: '',
  company: '',
  location: 'Dhaka, Bangladesh',
  bio: '',
  skills: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
  visibility: 'public',
  isBloodDonor: false,
  donationStatus: 'Available',
  committeePost: '',
  committeeRoleTitle: '',
};

export default function AdminAlumniPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const isBn = locale === 'bn';

  const [profiles, setProfiles] = useState<any[]>([]);
  const [committeePosts, setCommitteePosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [formData, setFormData] = useState<AlumniFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'academic' | 'professional' | 'blood' | 'social'>('account');

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alumni?limit=250&q=${search}`);
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitteePosts = async () => {
    try {
      const res = await fetch('/api/admin/committee/posts');
      if (res.ok) {
        const data = await res.json();
        setCommitteePosts(data.posts || []);
      } else {
        const fallbackRes = await fetch('/api/committee');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setCommitteePosts(fallbackData.sections || []);
        }
      }
    } catch (e) {
      console.error('Error fetching committee posts:', e);
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchCommitteePosts();
  }, []);

  const handleOpenCreateModal = async () => {
    setEditingProfile(null);
    await fetchCommitteePosts();
    const defaultPost = committeePosts.find((p) => p.isDefault);
    setFormData({
      ...initialFormData,
      batchYear: new Date().getFullYear(),
      committeePost: defaultPost ? defaultPost._id : '',
    });
    setActiveTab('account');
    setModalOpen(true);
  };

  const handleOpenEditModal = (profile: any) => {
    const u = profile.userId || {};
    setEditingProfile(profile);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || profile.phone || '',
      role: u.role || 'alumni',
      isVerified: u.isVerified !== false,
      image: u.image || '',
      batchYear: profile.batchYear || new Date().getFullYear(),
      group: profile.group || 'Science',
      bloodGroup: profile.bloodGroup || u.bloodGroup || '',
      jobTitle: profile.jobTitle || '',
      company: profile.company || '',
      location: profile.location || 'Dhaka, Bangladesh',
      bio: profile.bio || '',
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
      linkedin: profile.linkedin || '',
      facebook: profile.facebook || '',
      instagram: profile.instagram || '',
      whatsapp: profile.whatsapp || '',
      visibility: profile.visibility || 'public',
      isBloodDonor: Boolean(profile.isBloodDonor),
      donationStatus: profile.donationStatus || 'Available',
      committeePost: profile.committeePost?._id || profile.committeePost || '',
      committeeRoleTitle: profile.committeeRoleTitle || '',
    });
    setActiveTab('account');
    setModalOpen(true);
  };

  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showAlert({
        title: isBn ? 'নাম প্রদান করুন' : 'Name Required',
        text: isBn ? 'অনুগ্রহ করে সদস্যের পূর্ণ নাম লিখুন।' : 'Please enter the full name of the alumni member.',
        type: 'warning',
      });
      return;
    }

    if (!formData.email.trim()) {
      showAlert({
        title: isBn ? 'ইমেইল প্রদান করুন' : 'Email Required',
        text: isBn ? 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.',
        type: 'warning',
      });
      return;
    }

    if (!formData.batchYear) {
      showAlert({
        title: isBn ? 'ব্যাচ সন প্রদান করুন' : 'Batch Year Required',
        text: isBn ? 'অনুগ্রহ করে পাসের সন/ব্যাচ উল্লেখ করুন।' : 'Please specify the graduation batch year.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(editingProfile);
      const targetId = editingProfile?._id || editingProfile?.userId?._id;
      const url = isEdit ? `/api/admin/alumni/${targetId}` : '/api/admin/alumni';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save alumni');
      }

      if (isEdit) {
        setProfiles((prev) =>
          prev.map((p) => (p._id === targetId || p.userId?._id === targetId ? data.profile : p))
        );
        showAlert({
          title: isBn ? 'সফলভাবে হালনাগাদ হয়েছে!' : 'Updated Successfully!',
          text: isBn
            ? `${formData.name}-এর প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।`
            : `Profile details for ${formData.name} have been updated successfully.`,
          type: 'success',
        });
      } else {
        setProfiles((prev) => [data.profile, ...prev]);
        showAlert({
          title: isBn ? 'নতুন অ্যালামনাই যুক্ত হয়েছে!' : 'Alumni Added!',
          text: isBn
            ? `${formData.name}-কে সফলভাবে ডিরেক্টরিতে যুক্ত করা হয়েছে।`
            : `New member ${formData.name} has been added to the directory.`,
          type: 'success',
        });
      }

      setModalOpen(false);
    } catch (error: any) {
      console.error('Error saving alumni:', error);
      showAlert({
        title: isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Operation Failed',
        text: error.message || (isBn ? 'একটি ত্রুটি ঘটেছে।' : 'Failed to save alumni details.'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlumni = (profile: any) => {
    const u = profile.userId || {};
    const targetId = profile._id || u._id;

    showConfirm({
      title: isBn ? 'অ্যালামনাই রেকর্ড মুছে ফেলবেন?' : 'Delete Alumni Record?',
      text: isBn
        ? `আপনি কি নিশ্চিতভাবে ${u.name || 'এই সদস্য'}-এর প্রোফাইল ও অ্যাকাউন্ট মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।`
        : `Are you sure you want to permanently delete ${u.name || 'this alumni'} and their login account? This action cannot be undone.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete Permanently',
      confirmButtonVariant: 'destructive',
      onConfirm: async () => {
        setActionLoading(targetId);
        try {
          const res = await fetch(`/api/admin/alumni/${targetId}`, {
            method: 'DELETE',
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to delete alumni');
          }

          setProfiles((prev) => prev.filter((p) => p._id !== targetId && p.userId?._id !== targetId));
          showAlert({
            title: isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted',
            text: isBn ? 'অ্যালামনাই রেকর্ড সফলভাবে অপসারিত হয়েছে।' : 'Alumni record removed successfully.',
            type: 'success',
          });
        } catch (err: any) {
          console.error(err);
          showAlert({
            title: isBn ? 'মুছে ফেলা সম্ভব হয়নি' : 'Deletion Failed',
            text: err.message || 'Could not delete alumni record',
            type: 'error',
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean, userName: string) => {
    showConfirm({
      title: currentStatus
        ? (isBn ? 'যাচাই বাতিল করবেন?' : 'Revoke Verification?')
        : (isBn ? 'অ্যালামনাই অনুমোদন করবেন?' : 'Verify Alumni Member?'),
      text: currentStatus
        ? (isBn ? `${userName}-এর ভেরিফাইড ব্যাজ বাতিল করা হবে।` : `Revoke verified status for ${userName}.`)
        : (isBn ? `${userName}-কে ভেরিফাইড অ্যালামনাই হিসেবে ডিরেক্টরিতে সক্রিয় করা হবে।` : `Approve ${userName} as a verified member in the alumni directory.`),
      type: currentStatus ? 'warning' : 'question',
      confirmButtonText: currentStatus ? (isBn ? 'হ্যাঁ, বাতিল করুন' : 'Revoke') : (isBn ? 'অনুমোদন দিন' : 'Verify'),
      confirmButtonVariant: currentStatus ? 'destructive' : 'emerald',
      onConfirm: async () => {
        setActionLoading(userId);
        try {
          const res = await fetch('/api/admin/verify-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              isVerified: !currentStatus,
            }),
          });

          if (res.ok) {
            setProfiles((prev) =>
              prev.map((p) => {
                if (p.userId?._id === userId) {
                  return {
                    ...p,
                    userId: {
                      ...p.userId,
                      isVerified: !currentStatus,
                    },
                  };
                }
                return p;
              })
            );
            showAlert({
              title: currentStatus ? (isBn ? 'বাতিল করা হয়েছে' : 'Revoked') : (isBn ? 'যাচাই সম্পন্ন!' : 'Verified!'),
              text: currentStatus
                ? (isBn ? 'সদস্যের ভেরিফিকেশন বাতিল করা হয়েছে।' : 'Member verification revoked.')
                : (isBn ? 'সদস্য সফলভাবে যাচাইকৃত হয়েছে।' : 'Alumni verified successfully.'),
              type: currentStatus ? 'info' : 'success',
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const filteredProfiles = profiles.filter((p) => {
    if (statusFilter === 'verified' && !p.userId?.isVerified) return false;
    if (statusFilter === 'pending' && p.userId?.isVerified) return false;
    if (groupFilter !== 'all' && p.group !== groupFilter) return false;
    if (bloodFilter !== 'all' && (p.bloodGroup || p.userId?.bloodGroup) !== bloodFilter) return false;
    return true;
  });

  const totalCount = profiles.length;
  const verifiedCount = profiles.filter((p) => p.userId?.isVerified).length;
  const pendingCount = totalCount - verifiedCount;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Users className="w-4 h-4" />
            <span>{isBn ? 'ডিরেক্টরি ও মেম্বারশিপ গভর্নেন্স' : 'Directory Governance & Member Management'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'অ্যালামনাই ডিরেক্টরি ও ভেরিফিকেশন' : 'Alumni Directory & Verification'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'সুপার অ্যাডমিন হিসেবে সরাসরি নতুন অ্যালামনাই যুক্ত ও বিদ্যমান তথ্য সম্পাদনা করুন'
              : 'Directly add new alumni, edit complete profile records, and audit verified memberships'}
          </p>
        </div>

        {/* Action Buttons: Add Alumni & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleOpenCreateModal}
            className="gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-md shadow-primary/20 font-bold text-xs sm:text-sm px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন অ্যালামনাই যুক্ত করুন' : 'Add Alumni'}</span>
          </Button>

          {/* Quick Filter Pill Tabs */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{isBn ? 'সকল' : 'All'}</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {totalCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <span>{isBn ? 'যাচাইকৃত' : 'Verified'}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {verifiedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <span>{isBn ? 'অনুমোদন বাকি' : 'Pending'}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pendingCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name, email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchAlumni();
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
        >
          <option value="all">{isBn ? 'সকল গ্রুপ' : 'All Groups'}</option>
          {ALUMNI_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300"
        >
          <option value="all">{isBn ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg} Blood
            </option>
          ))}
        </select>

        <Button
          size="sm"
          onClick={fetchAlumni}
          className="text-xs px-3.5 py-2 font-semibold shadow-xs flex items-center justify-center gap-1.5 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ করুন' : 'Apply & Refresh'}</span>
        </Button>
      </div>

      {/* Alumni Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">{isBn ? 'অ্যালামনাই' : 'Alumni'}</th>
                <th className="p-4">{isBn ? 'গ্রুপ ও ব্যাচ' : 'Group & Batch'}</th>
                <th className="p-4">{isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}</th>
                <th className="p-4">{isBn ? 'প্রতিষ্ঠান ও পদবী' : 'Company & Role'}</th>
                <th className="p-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>{isBn ? 'লোড হচ্ছে...' : 'Loading alumni records...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="space-y-3">
                      <Users className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {isBn ? 'কোনো সদস্যের রেকর্ড পাওয়া যায়নি' : 'No alumni records matching the criteria'}
                      </p>
                      <Button size="sm" onClick={handleOpenCreateModal} className="rounded-xl gap-1.5">
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'প্রথম অ্যালামনাই যুক্ত করুন' : 'Add First Alumni'}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => {
                  const user = profile.userId;
                  const isVerified = user?.isVerified;
                  const blood = profile.bloodGroup || user?.bloodGroup;
                  const isBusy = actionLoading === (user?._id || profile._id);

                  return (
                    <tr
                      key={profile._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.image}
                            fallback={user?.name || 'AL'}
                            size="sm"
                            className="w-10 h-10 rounded-2xl ring-2 ring-primary/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {user?.name}
                              </p>
                              {user?.role === 'admin' && (
                                <span className="px-1.5 py-0.2 text-[10px] font-extrabold uppercase rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
                                  Admin
                                </span>
                              )}
                            </div>
                            {profile.committeePost && (
                              <div className="pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                                  <Award className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                  <span>
                                    {isBn
                                      ? profile.committeePost.name_bn || profile.committeePost.name_en
                                      : profile.committeePost.name_en || profile.committeePost.name_bn}
                                  </span>
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                            {user?.phone && (
                              <p className="text-[11px] text-slate-400 font-mono">{user?.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {profile.group || 'Science'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {isBn ? `ব্যাচ ${toBengaliNumerals(profile.batchYear)}` : `Batch ${profile.batchYear}`}
                        </p>
                      </td>

                      <td className="p-4">
                        {blood ? (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                            <Droplet className="w-3 h-3 fill-current text-rose-500" />
                            <span>{blood}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {profile.jobTitle || '—'}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">
                          {profile.company || '—'}
                        </p>
                      </td>

                      <td className="p-4">
                        {isVerified ? (
                          <Badge variant="success" className="text-[10px] gap-1 px-2.5 py-0.5 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{isBn ? 'যাচাইকৃত' : 'Verified'}</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] gap-1 px-2.5 py-0.5 font-semibold">
                            <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>{isBn ? 'অনুমোদন বাকি' : 'Pending'}</span>
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(profile)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-2xs"
                            title={isBn ? 'তথ্য সম্পাদনা করুন' : 'Edit Alumni Info'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                          </button>

                          {/* Verification Toggle */}
                          {isVerified ? (
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleToggleVerification(user?._id, isVerified, user?.name || 'Alumni')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80 transition-all disabled:opacity-50"
                              title="Revoke Verification"
                            >
                              <X className="w-3.5 h-3.5 text-rose-500" />
                              <span>{isBn ? 'বাতিল' : 'Revoke'}</span>
                            </button>
                          ) : (
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleToggleVerification(user?._id, isVerified, user?.name || 'Alumni')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                              title="Verify Alumni"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'অনুমোদন' : 'Verify'}</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteAlumni(profile)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title={isBn ? 'অ্যালামনাই মুছুন' : 'Delete Member'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View Profile Link */}
                          <Link
                            href={`/directory/${profile._id}`}
                            target="_blank"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title={isBn ? 'পাবলিক প্রোফাইল দেখুন' : 'View Public Profile'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* DIRECT ADD / EDIT ALUMNI MODAL (SUPER ADMIN DIRECT GOVERNANCE)            */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {editingProfile ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {editingProfile
                      ? isBn
                        ? `অ্যালামনাই সম্পাদনা: ${editingProfile.userId?.name || ''}`
                        : `Edit Alumni: ${editingProfile.userId?.name || ''}`
                      : isBn
                      ? 'নতুন অ্যালামনাই সদস্য যুক্ত করুন'
                      : 'Add New Alumni Member'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isBn
                      ? 'অ্যাকাউন্ট ও প্রোফাইলের সকল তথ্য সরাসরি পরিচালনা ও সংরক্ষণ করুন'
                      : 'Directly manage credentials, academic batch, and comprehensive profile details'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !saving && setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Category Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 overflow-x-auto scrollbar-none text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'account'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isBn ? '১. অ্যাকাউন্ট ও পরিচয়' : '1. Account & Identity'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'academic'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isBn ? '২. ব্যাচ ও গ্রুপ' : '2. Batch & Group'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('professional')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'professional'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isBn ? '৩. পেশা ও অবস্থান' : '3. Career & Bio'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blood')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'blood'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isBn ? '৪. রক্তদান ও স্বাস্থ্য' : '4. Blood Donation'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'social'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isBn ? '৫. সোশ্যাল ও যোগাযোগ' : '5. Social & Links'}
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAlumni} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: Account & Identity */}
              {activeTab === 'account' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Avatar Upload */}
                  <ImageUpload
                    label={isBn ? 'প্রোফাইল ছবি' : 'Profile Photo'}
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    fallbackName={formData.name || 'Alumni'}
                    shape="circle"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                      </label>
                      <Input
                        required
                        placeholder={isBn ? 'উদা: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="alumni@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>{editingProfile ? (isBn ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'New Password (Optional)') : (isBn ? 'পাসওয়ার্ড' : 'Password')}</span>
                        {!editingProfile && (
                          <span className="text-[11px] text-primary font-normal">
                            {isBn ? 'ডিফল্ট: Alumni@123456' : 'Default: Alumni@123456'}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={
                            editingProfile
                              ? (isBn ? 'অপরিবর্তিত রাখতে খালি রাখুন' : 'Leave empty to keep unchanged')
                              : 'Alumni@123456'
                          }
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="rounded-xl text-xs font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <Input
                        placeholder="017XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'পদবী (Designation)' : 'Designation'}
                      </label>
                      <select
                        value={formData.committeePost}
                        onChange={(e) => setFormData({ ...formData, committeePost: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                      >
                        <option value="">
                          {isBn ? '-- পদবী নির্বাচন করুন --' : '-- Select Designation --'}
                        </option>
                        {committeePosts.map((post) => (
                          <option key={post._id} value={post._id}>
                            {post.name_en} ({post.name_bn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isBn ? 'যাচাইকৃত স্ট্যাটাস (Verified)' : 'Verified Member Status'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isBn ? 'ডিরেক্টরিতে সবুজ যাচাইকৃত ব্যাজ প্রদর্শন' : 'Display green verified check in directory'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isVerified}
                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="w-5 h-5 rounded-lg text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Batch & Group */}
              {activeTab === 'academic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'পাসের সন / ব্যাচ (Batch Year) *' : 'Graduation Batch Year *'}
                      </label>
                      <Input
                        type="number"
                        required
                        min="1950"
                        max="2035"
                        placeholder="e.g. 2020"
                        value={formData.batchYear}
                        onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                        className="rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'শাখা / গ্রুপ (Academic Group) *' : 'Academic Group *'}
                      </label>
                      <select
                        required
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      >
                        {ALUMNI_GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Executive Committee Designation & Custom Role Title */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{isBn ? 'কমিটি পদবী ও বিশেষ দায়িত্ব' : 'Committee Designation & Custom Role'}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isBn
                          ? 'সদস্যের কমিটি পদবী ও নির্দিষ্ট দায়িত্বের শিরোনাম নির্ধারণ করুন'
                          : 'Configure official designation and specific portfolio role'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? 'পদবী (Designation)' : 'Designation'}
                        </label>
                        <select
                          value={formData.committeePost}
                          onChange={(e) => setFormData({ ...formData, committeePost: e.target.value })}
                          className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          <option value="">{isBn ? '-- পদবী নির্বাচন করুন --' : '-- Select Designation --'}</option>
                          {committeePosts.map((post) => (
                            <option key={post._id} value={post._id}>
                              {post.name_en} ({post.name_bn})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? 'কাস্টম কমিটি ভূমিকা / দায়িত্ব' : 'Custom Role Title'}
                        </label>
                        <Input
                          placeholder={isBn ? 'উদা: আইসিটি কো-অর্ডিনেটর' : 'e.g. Lead Coordinator / ICT'}
                          value={formData.committeeRoleTitle}
                          onChange={(e) => setFormData({ ...formData, committeeRoleTitle: e.target.value })}
                          className="rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Professional & Bio */}
              {activeTab === 'professional' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'বর্তমান পদবী / পেশা' : 'Current Job Title / Profession'}
                      </label>
                      <Input
                        placeholder={isBn ? 'উদা: সফটওয়্যার ইঞ্জিনিয়ার' : 'e.g. Senior Software Engineer'}
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'প্রতিষ্ঠান / সংস্থা' : 'Company / Organization'}
                      </label>
                      <Input
                        placeholder={isBn ? 'উদা: গুগল, ব্র্যাক ব্যাংক' : 'e.g. Google, BRAC Bank'}
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'অবস্থান / শহর' : 'Location / City'}
                      </label>
                      <Input
                        placeholder="Dhaka, Bangladesh"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'দক্ষতা (কমা দিয়ে আলাদা করুন)' : 'Skills (Comma separated)'}
                      </label>
                      <Input
                        placeholder="React, Management, Python..."
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isBn ? 'ব্যক্তিগত পরিচিতি / বায়ো' : 'Personal Biography / Bio'}
                    </label>
                    <Textarea
                      rows={3}
                      placeholder={isBn ? 'সংক্ষিপ্ত পরিচিতি ও স্কুলের স্মৃতি...' : 'Short bio, academic background, and memories...'}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isBn ? 'ডিরেক্টরি ভিজিবিলিটি' : 'Directory Visibility'}
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                      className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="public">{isBn ? 'পাবলিক (সকল ভিজিটর দেখতে পারবে)' : 'Public (Visible to everyone)'}</option>
                      <option value="alumni_only">{isBn ? 'শুধুমাত্র নিবন্ধিত সদস্যদের জন্য' : 'Alumni Only (Logged-in members only)'}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: Blood Donation */}
              {activeTab === 'blood' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      >
                        <option value="">{isBn ? 'অনির্দিষ্ট / জানা নেই' : 'Unspecified / Unknown'}</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg} Blood
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'রক্তদান স্থিতি (Donation Status)' : 'Donation Availability'}
                      </label>
                      <select
                        value={formData.donationStatus}
                        onChange={(e) => setFormData({ ...formData, donationStatus: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        {DONATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
                        <Droplet className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          {isBn ? 'জরুরি রক্তদাতা হিসেবে তালিকাভুক্ত' : 'Registered as Voluntary Blood Donor'}
                        </p>
                        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70">
                          {isBn ? 'জরুরি প্রয়োজনে ব্লাড ব্যাংকে এই সদস্যকে খোঁজা যাবে' : 'Include in emergency blood donor search network'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isBloodDonor}
                      onChange={(e) => setFormData({ ...formData, isBloodDonor: e.target.checked })}
                      className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: Social & Contact Links */}
              {activeTab === 'social' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'লিঙ্কডইন প্রোফাইল লিঙ্ক' : 'LinkedIn Profile URL'}
                      </label>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'ফেসবুক প্রোফাইল লিঙ্ক' : 'Facebook Profile URL'}
                      </label>
                      <Input
                        type="url"
                        placeholder="https://facebook.com/username"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'ইনস্টাগ্রাম লিঙ্ক' : 'Instagram Profile URL'}
                      </label>
                      <Input
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Contact Number'}
                      </label>
                      <Input
                        placeholder="88017XXXXXXXX"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Bottom Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="text-xs font-semibold rounded-xl"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>

                <div className="flex items-center gap-2">
                  {activeTab !== 'account' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tabs: ('account' | 'academic' | 'professional' | 'blood' | 'social')[] = [
                          'account',
                          'academic',
                          'professional',
                          'blood',
                          'social',
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                      }}
                      className="text-xs rounded-xl"
                    >
                      {isBn ? 'পূর্ববর্তী ট্যাব' : 'Previous'}
                    </Button>
                  )}

                  {activeTab !== 'social' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const tabs: ('account' | 'academic' | 'professional' | 'blood' | 'social')[] = [
                          'account',
                          'academic',
                          'professional',
                          'blood',
                          'social',
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                      }}
                      className="text-xs rounded-xl"
                    >
                      {isBn ? 'পরবর্তী ট্যাব' : 'Next Tab'}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={saving}
                    className="text-xs font-bold gap-1.5 rounded-xl bg-primary text-white shadow-md shadow-primary/20"
                  >
                    {saving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {saving
                        ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                        : editingProfile
                        ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')
                        : (isBn ? 'অ্যালামনাই যুক্ত করুন' : 'Create Member')}
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
