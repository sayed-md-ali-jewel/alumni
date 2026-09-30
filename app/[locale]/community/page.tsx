'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  PlusCircle,
  ThumbsUp,
  Share2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function CommunityPage() {
  const t = useTranslations('community');
  const common = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const { showLoginPrompt, showToast, showAlert } = useSweetAlert();

  const isBn = locale === 'bn';

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const categories = ['all', 'General', 'Batch', 'Group', 'Career', 'Startups'];

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community?category=${category}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDiscussions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [category]);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      showLoginPrompt(
        isBn
          ? 'নতুন আলোচনা পোস্ট করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।'
          : 'Please sign in to post a new discussion topic.'
      );
      return;
    }

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setShowNewModal(false);
        fetchDiscussions();
        showAlert({
          title: isBn ? 'আলোচনা প্রকাশিত!' : 'Topic Published!',
          text: isBn ? 'আপনার আলোচনা ফোরামে যুক্ত করা হয়েছে।' : 'Your topic has been posted to the forum.',
          type: 'success',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (discussionId: string) => {
    const comment = commentInputs[discussionId];
    if (!comment?.trim()) return;

    if (!session) {
      showLoginPrompt(
        isBn
          ? 'মন্তব্য প্রদান করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।'
          : 'Please sign in to post a comment.'
      );
      return;
    }

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionId,
          commentContent: comment,
        }),
      });

      if (res.ok) {
        setCommentInputs({ ...commentInputs, [discussionId]: '' });
        fetchDiscussions();
        showToast({
          title: isBn ? 'মন্তব্য যুক্ত হয়েছে' : 'Comment Posted',
          type: 'success',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <MessageSquare className="w-4 h-4" />
            <span>{isBn ? 'নেটওয়ার্কিং ও ফোরাম' : 'Networking & Forum'}</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        <Button
          onClick={() => setShowNewModal(true)}
          className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('newPost')}</span>
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? (isBn ? 'সকল আলোচনা' : 'All Topics') : cat}
          </button>
        ))}
      </div>

      {/* New Post Modal Form */}
      {showNewModal && (
        <Card className="border-primary shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t('newPost')}</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isBn ? 'শিরোনাম' : 'Title'} *</label>
                <Input
                  required
                  placeholder={isBn ? 'আলোচনার বিষয় লিখুন...' : 'Topic title...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isBn ? 'ক্যাটাগরি' : 'Category'}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="General">General</option>
                  <option value="Batch">Batch Forum</option>
                  <option value="Group">Group</option>
                  <option value="Career">Career & Advice</option>
                  <option value="Startups">Startups & Business</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isBn ? 'মূল বক্তব্য' : 'Content'} *</label>
                <Textarea
                  required
                  rows={4}
                  placeholder={isBn ? 'আপনার বিস্তারিত মতামত লিখুন...' : 'Share your thoughts, questions, or ideas...'}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>
                  {common('cancel')}
                </Button>
                <Button type="submit">
                  {common('submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Discussion Threads List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো আলোচনা খুঁজে পাওয়া যায়নি' : 'No discussions yet'}
          </h3>
          <Button onClick={() => setShowNewModal(true)}>{t('newPost')}</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {discussions.map((disc) => (
            <Card key={disc._id} className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6 space-y-4">
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={disc.authorId?.image} fallback={disc.authorId?.name || 'AL'} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {disc.authorId?.name}
                        </span>
                        {disc.authorId?.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(disc.createdAt, locale)}
                      </span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-xs">
                    {disc.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {disc.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {disc.content}
                  </p>
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {disc.comments?.length || 0} {t('comments')}
                  </h4>

                  {disc.comments?.map((com: any, cIdx: number) => (
                    <div key={cIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <Avatar src={com.authorId?.image} fallback={com.authorId?.name || 'AL'} size="sm" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {com.authorId?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(com.createdAt, locale)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {com.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      placeholder={t('writeComment')}
                      value={commentInputs[disc._id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [disc._id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(disc._id);
                      }}
                    />
                    <Button size="icon" onClick={() => handleAddComment(disc._id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
