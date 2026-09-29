'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Award,
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  Crown,
  UserCheck,
  UserX,
  X,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Sliders,
  Filter,
} from 'lucide-react';

export default function AdminCommitteePage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');

  // Posts State
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [savingPost, setSavingPost] = useState(false);

  const [postForm, setPostForm] = useState({
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    sortOrder: 0,
    isActive: true,
    isDefault: false,
  });

  // Members State
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedPostFilter, setSelectedPostFilter] = useState('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [batchesList, setBatchesList] = useState<number[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningMember, setAssigningMember] = useState<any | null>(null);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Fetch Posts
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/admin/committee/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch Members
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const params = new URLSearchParams({
        q: memberSearch,
        postId: selectedPostFilter,
        batchYear: selectedBatchFilter,
        limit: '100',
      });
      const res = await fetch(`/api/admin/committee/members?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        if (data.batches) {
          setBatchesList(data.batches || []);
        }
      }
    } catch (e) {
      console.error('Error fetching members:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [activeTab, selectedPostFilter, selectedBatchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  // Post Actions
  const handleOpenCreatePostModal = () => {
    setEditingPost(null);
    setPostForm({
      name_en: '',
      name_bn: '',
      description_en: '',
      description_bn: '',
      sortOrder: posts.length + 1,
      isActive: true,
      isDefault: false,
    });
    setPostModalOpen(true);
  };

  const handleOpenEditPostModal = (post: any) => {
    setEditingPost(post);
    setPostForm({
      name_en: post.name_en || '',
      name_bn: post.name_bn || '',
      description_en: post.description_en || '',
      description_bn: post.description_bn || '',
      sortOrder: post.sortOrder || 0,
      isActive: post.isActive !== false,
      isDefault: post.isDefault === true,
    });
    setPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.name_en.trim() || !postForm.name_bn.trim()) {
      showAlert({
        title: isBn ? 'তথ্য দিন' : 'Missing Information',
        text: isBn ? 'ইংরেজি ও বাংলা পদবীর নাম আবশ্যক।' : 'Post name in both English and Bengali is required.',
        type: 'warning',
      });
      return;
    }

    setSavingPost(true);
    try {
      const url = editingPost
        ? `/api/admin/committee/posts/${editingPost._id}`
        : '/api/admin/committee/posts';
      const method = editingPost ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          editingPost
            ? (isBn ? 'পদবী সফলভাবে আপডেট হয়েছে' : 'Post updated successfully')
            : (isBn ? 'নতুন পদবী সফলভাবে তৈরি হয়েছে' : 'New post created successfully'),
          'success'
        );
        setPostModalOpen(false);
        fetchPosts();
      } else {
        showAlert({
          title: 'Error',
          text: data.error || 'Failed to save post',
          type: 'error',
        });
      }
    } catch (e: any) {
      console.error(e);
      showAlert({
        title: 'Error',
        text: e.message || 'Network error',
        type: 'error',
      });
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = (post: any) => {
    if (post.isDefault) {
      showAlert({
        title: isBn ? 'ডিফল্ট পদবী মুছতে পারবেন না' : 'Cannot Delete Default Post',
        text: isBn
          ? 'সদস্য পদবীটি ডিফল্ট হিসেবে সংরক্ষিত। প্রথমে অন্য কোনো পদবীকে ডিফল্ট হিসেবে নির্ধারণ করুন।'
          : 'This is the default member post. Set another post as default before deleting.',
        type: 'warning',
      });
      return;
    }

    showConfirm({
      title: isBn ? 'আপনি কি নিশ্চিত?' : 'Delete Committee Post?',
      text: isBn
        ? `"${post.name_bn}" পদবী মুছে ফেললে এই পদবীর সমস্ত সদস্য স্বয়ংক্রিয়ভাবে ডিফল্ট (সদস্য) পদবীতে স্থানান্তরিত হবেন।`
        : `Deleting "${post.name_en}" will safely reassign all its current members back to the default Member post.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/committee/posts/${post._id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast(isBn ? 'পদবী মুছে ফেলা হয়েছে' : 'Post deleted successfully', 'success');
            fetchPosts();
          } else {
            showToast('Failed to delete post', 'error');
          }
        } catch (e) {
          console.error(e);
          showToast('Network error', 'error');
        }
      },
    });
  };

  // Member Assignment Actions
  const handleOpenAssignModal = (member: any) => {
    setAssigningMember(member);
    setSelectedPostId(member.committeePost?._id || member.committeePost || '');
    setCustomRoleTitle(member.committeeRoleTitle || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningMember) return;

    setSavingAssignment(true);
    try {
      const res = await fetch('/api/admin/committee/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: assigningMember._id,
          postId: selectedPostId || null,
          roleTitle: customRoleTitle,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          isBn ? 'কমিটি পদবী বরাদ্দ আপডেট হয়েছে' : 'Committee assignment updated successfully',
          'success'
        );
        setAssignModalOpen(false);
        fetchMembers();
        fetchPosts();
      } else {
        showAlert({ title: 'Error', text: data.error || 'Failed to update assignment', type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      showAlert({ title: 'Error', text: e.message || 'Network error', type: 'error' });
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleResetMemberPost = (member: any) => {
    showConfirm({
      title: isBn ? 'পদবী রিসেট করবেন?' : 'Reset Post?',
      text: isBn
        ? `"${member.userId?.name}" এর বিশেষ পদবী বাতিল করে ডিফল্ট (সদস্য) করা হবে।`
        : `Reset "${member.userId?.name}" to the default Member designation?`,
      type: 'question',
      confirmButtonText: isBn ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/committee/members?profileId=${member._id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            showToast(isBn ? 'পদবী রিসেট হয়েছে' : 'Post reset to default member', 'success');
            fetchMembers();
            fetchPosts();
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>{isBn ? 'কার্যনির্বাহী পরিষদ ও কমিটি' : 'Executive Committee Governance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isBn ? 'কমিটি ও পদবী ব্যবস্থাপনা' : 'Committee & Designations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isBn
              ? 'কমিটির পদবীসমূহ (যেমন: সভাপতি, সহ সভাপতি, সাধারণ সম্পাদক, সদস্য) তৈরি ও পরিচালনা করুন এবং নির্দিষ্ট প্রাক্তনদের পদবীতে যুক্ত করুন।'
              : 'Create dynamic committee designations (President, VP, Secretary, Members, etc.) and manage alumni leadership assignments.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              fetchPosts();
              if (activeTab === 'members') fetchMembers();
            }}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>

          {activeTab === 'posts' ? (
            <Button
              onClick={handleOpenCreatePostModal}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন পদবী তৈরি করুন' : 'Create Designation'}</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isBn ? '১. কমিটি পদবীসমূহ (Designations)' : '1. Committee Designations'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {posts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isBn ? '২. সদস্য ও পদবী বরাদ্দ (Member Assignments)' : '2. Member Assignments'}</span>
        </button>
      </div>

      {/* TAB 1: POSTS & DESIGNATIONS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isBn ? 'বিদ্যমান কমিটি পদবী তালিকা' : 'Active Committee Posts'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'ক্রম অনুসারে পদবীগুলো কমিটি পেজে প্রদর্শিত হবে।'
                : 'Posts appear in the order defined by their sort position.'}
            </p>
          </div>

          {loadingPosts ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>Loading designations...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <Award className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isBn ? 'কোনো পদবী পাওয়া যায়নি' : 'No Designations Found'}
              </h4>
              <Button onClick={handleOpenCreatePostModal} size="sm" className="text-xs gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'পদবী যোগ করুন' : 'Add Designation'}</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card
                  key={post._id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/20">
                          #{post.sortOrder}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {post.name_bn} ({post.name_en})
                            </h4>
                            {post.isDefault && (
                              <Badge className="bg-emerald-600 text-white text-[10px]">
                                {isBn ? 'ডিফল্ট সদস্য পদবী' : 'Default Post'}
                              </Badge>
                            )}
                          </div>
                          {post.description_bn && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {post.description_bn}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          onClick={() => handleOpenEditPostModal(post)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-xl"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-primary" />
                        </Button>
                        {!post.isDefault && (
                          <Button
                            onClick={() => handleDeletePost(post)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {isBn
                            ? `বরাদ্দকৃত সদস্য: ${toBengaliNumerals(post.memberCount || 0)} জন`
                            : `Assigned Members: ${post.memberCount || 0}`}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          post.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                        }`}
                      >
                        {post.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBER ASSIGNMENTS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder={isBn ? 'নাম বা ইমেইল দিয়ে সদস্য খুঁজুন...' : 'Search alumni by name or email...'}
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9 pr-3 text-xs rounded-xl h-9"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedPostFilter}
                onChange={(e) => setSelectedPostFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="all">{isBn ? 'সকল পদবী' : 'All Posts'}</option>
                {posts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {isBn ? p.name_bn : p.name_en}
                  </option>
                ))}
              </select>

              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="all">{isBn ? 'সকল ব্যাচ' : 'All Batches'}</option>
                {batchesList.map((b) => (
                  <option key={b} value={b}>
                    {isBn ? `ব্যাচ ${toBengaliNumerals(b)}` : `Batch '${b}`}
                  </option>
                ))}
              </select>

              <Button onClick={fetchMembers} size="sm" variant="outline" className="h-9 text-xs gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>{isBn ? 'ফিল্টার' : 'Filter'}</span>
              </Button>
            </div>
          </div>

          {/* Members Table */}
          {loadingMembers ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>Loading alumni records...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                {isBn ? 'কোনো অ্যালামনাই সদস্য পাওয়া যায়নি।' : 'No alumni members found matching criteria.'}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{isBn ? 'সদস্য / নাম' : 'Alumni Member'}</th>
                      <th className="px-4 py-3.5">{isBn ? 'ব্যাচ ও বিভাগ' : 'Batch / Group'}</th>
                      <th className="px-4 py-3.5">{isBn ? 'বর্তমান কমিটি পদবী' : 'Assigned Post'}</th>
                      <th className="px-4 py-3.5">{isBn ? 'কাস্টম দায়িত্ব' : 'Role Title'}</th>
                      <th className="px-5 py-3.5 text-right">{isBn ? 'পদবী বরাদ্দ' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member) => {
                      const u = member.userId || ({} as any);
                      const currentPost = member.committeePost;
                      const postName = currentPost
                        ? isBn
                          ? currentPost.name_bn
                          : currentPost.name_en
                        : isBn
                        ? 'সদস্য (ডিফল্ট)'
                        : 'Member (Default)';

                      return (
                        <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={u.image}
                                alt={u.name}
                                fallback={u.name || 'Alumni'}
                                size="sm"
                                className="w-9 h-9 rounded-xl"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name || 'Unnamed Member'}</span>
                                  {u.isVerified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {member.batchYear ? `Batch '${member.batchYear}` : '—'}
                            </div>
                            <div className="text-[11px] text-slate-400">{member.group || '—'}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                currentPost?.sortOrder <= 3
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <Award className="w-3 h-3" />
                              <span>{postName}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-slate-500">
                            {member.committeeRoleTitle || '—'}
                          </td>

                          <td className="px-5 py-3.5 text-right space-x-2">
                            <Button
                              onClick={() => handleOpenAssignModal(member)}
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs rounded-lg gap-1"
                            >
                              <Award className="w-3 h-3 text-primary" />
                              <span>{isBn ? 'পদবী পরিবর্তন' : 'Change Post'}</span>
                            </Button>

                            {currentPost && !currentPost.isDefault && (
                              <Button
                                onClick={() => handleResetMemberPost(member)}
                                size="sm"
                                variant="ghost"
                                title="Reset to member"
                                className="h-7 text-xs rounded-lg text-slate-400 hover:text-rose-500"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPost
                    ? (isBn ? 'কমিটি পদবী সম্পাদনা' : 'Edit Committee Designation')
                    : (isBn ? 'নতুন কমিটি পদবী তৈরি' : 'Create Committee Designation')}
                </h3>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  পদবীর নাম (বাংলা) *
                </label>
                <Input
                  required
                  placeholder="যেমন: সভাপতি / সহ সভাপতি / সাধারণ সম্পাদক"
                  value={postForm.name_bn}
                  onChange={(e) => setPostForm({ ...postForm, name_bn: e.target.value })}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Designation Name (English) *
                </label>
                <Input
                  required
                  placeholder="e.g. President / Vice President / Secretary / Member"
                  value={postForm.name_en}
                  onChange={(e) => setPostForm({ ...postForm, name_en: e.target.value })}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  সংক্ষিপ্ত বিবরণ (বাংলা)
                </label>
                <Textarea
                  rows={2}
                  placeholder="পদবীর দায়িত্ব ও সংক্ষিপ্ত বিবরণ..."
                  value={postForm.description_bn}
                  onChange={(e) => setPostForm({ ...postForm, description_bn: e.target.value })}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Short Description (English)
                </label>
                <Textarea
                  rows={2}
                  placeholder="Brief summary of duties and responsibilities..."
                  value={postForm.description_en}
                  onChange={(e) => setPostForm({ ...postForm, description_en: e.target.value })}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'প্রদর্শনের ক্রম (Sort Order)' : 'Display Sort Order'}
                  </label>
                  <Input
                    type="number"
                    value={postForm.sortOrder}
                    onChange={(e) => setPostForm({ ...postForm, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postForm.isActive}
                      onChange={(e) => setPostForm({ ...postForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'সক্রিয় রাখুন (Active)' : 'Mark as Active'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPostModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingPost}
                  className="rounded-xl text-xs bg-primary text-white"
                >
                  {savingPost
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : editingPost
                    ? (isBn ? 'আপডেট করুন' : 'Update Designation')
                    : (isBn ? 'তৈরি করুন' : 'Create Designation')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MEMBER MODAL */}
      {assignModalOpen && assigningMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isBn ? 'কমিটি পদবী বরাদ্দ' : 'Assign Committee Designation'}
                </h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Member Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3">
              <Avatar
                src={assigningMember.userId?.image}
                alt={assigningMember.userId?.name}
                fallback={assigningMember.userId?.name || 'Alumni'}
                size="md"
                className="w-11 h-11 rounded-xl"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {assigningMember.userId?.name}
                </div>
                <div className="text-xs text-slate-400">
                  {assigningMember.batchYear ? `Batch '${assigningMember.batchYear}` : ''} • {assigningMember.group}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'কমিটি পদবী নির্বাচন করুন *' : 'Select Committee Designation *'}
                </label>
                <select
                  required
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="">{isBn ? '-- পদবী নির্বাচন করুন --' : '-- Select Designation --'}</option>
                  {posts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {isBn ? `${p.name_bn} (${p.name_en})` : `${p.name_en} (${p.name_bn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'কাস্টম পদবী শিরোনাম (ঐচ্ছিক)' : 'Custom Role Subtitle (Optional)'}
                </label>
                <Input
                  placeholder={isBn ? 'যেমন: সদস্য সচিব / কোষাধ্যক্ষ / প্রচার সম্পাদক' : 'e.g. Member Secretary / Treasurer'}
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingAssignment}
                  className="rounded-xl text-xs bg-primary text-white"
                >
                  {savingAssignment
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : (isBn ? 'সংরক্ষণ করুন' : 'Save Assignment')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
