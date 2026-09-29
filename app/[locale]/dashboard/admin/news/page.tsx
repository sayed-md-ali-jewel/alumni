'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { SectionBuilder } from '@/components/ui/SectionBuilder';
import { formatDate } from '@/lib/utils';
import {
  Newspaper,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function AdminNewsPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const { showAlert, showConfirm } = useSweetAlert();

  const isBn = locale === 'bn';

  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title_bn: '',
    title_en: '',
    slug: '',
    category: 'Announcement',
    image: '',
    summary_bn: '',
    summary_en: '',
    content_bn: '',
    content_en: '',
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData({
      ...formData,
      title_en: val,
      slug: generatedSlug,
    });
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      title_bn: '',
      title_en: '',
      slug: '',
      category: 'Announcement',
      image: '',
      summary_bn: '',
      summary_en: '',
      content_bn: '',
      content_en: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title_bn: post.title_bn || '',
      title_en: post.title_en || '',
      slug: post.slug || '',
      category: post.category || 'Announcement',
      image: post.image || '',
      summary_bn: post.summary_bn || '',
      summary_en: post.summary_en || '',
      content_bn: post.content_bn || '',
      content_en: post.content_en || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const isEdit = Boolean(editingPost);
      const method = isEdit ? 'PUT' : 'POST';

      // Auto-generate slug if missing
      let finalSlug = (formData.slug || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      if (!finalSlug) {
        finalSlug = `story-${Date.now().toString(36)}`;
      }

      // Ensure content is not empty JSON
      const contentBn =
        formData.content_bn && formData.content_bn.trim() !== ''
          ? formData.content_bn
          : JSON.stringify([
              {
                id: 'b-1',
                type: 'paragraph',
                paragraphText: formData.summary_bn || formData.title_bn,
              },
            ]);

      const contentEn =
        formData.content_en && formData.content_en.trim() !== ''
          ? formData.content_en
          : JSON.stringify([
              {
                id: 'b-1',
                type: 'paragraph',
                paragraphText: formData.summary_en || formData.title_en,
              },
            ]);

      const bodyPayload = isEdit
        ? {
            id: editingPost._id,
            ...formData,
            slug: finalSlug,
            content_bn: contentBn,
            content_en: contentEn,
          }
        : {
            ...formData,
            slug: finalSlug,
            content_bn: contentBn,
            content_en: contentEn,
          };

      const res = await fetch('/api/news', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save news article');
      }

      setShowModal(false);
      setEditingPost(null);
      fetchNews();
      showAlert({
        title: isEdit
          ? (isBn ? 'সংবাদ হালনাগাদ সম্পন্ন!' : 'Article Updated!')
          : (isBn ? 'প্রকাশনা সফল!' : 'Published!'),
        text: isEdit
          ? (isBn ? 'সংবাদ নিবন্ধটি সফলভাবে পরিমার্জন করা হয়েছে।' : 'News article updated successfully.')
          : (isBn ? 'সংবাদ নিবন্ধটি সফলভাবে প্রকাশিত হয়েছে।' : 'News article published successfully.'),
        type: 'success',
      });
    } catch (err: any) {
      setError(err?.message || 'Error saving article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    showConfirm({
      title: isBn ? 'সংবাদ মুছে ফেলবেন?' : 'Delete Article?',
      text: isBn ? `"${title}" সংবাদটি স্থায়ীভাবে মুছে ফেলা হবে।` : `"${title}" will be permanently removed.`,
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
      confirmButtonVariant: 'destructive',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            setPosts(posts.filter((p) => p._id !== id));
            showAlert({
              title: isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted',
              text: isBn ? 'সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।' : 'News article deleted successfully.',
              type: 'success',
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      search === '' ||
      (p.title_bn && p.title_bn.toLowerCase().includes(search.toLowerCase())) ||
      (p.title_en && p.title_en.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Newspaper className="w-4 h-4" />
            <span>{isBn ? 'সংবাদ ও বুলেটিন CMS' : 'News & Stories CMS'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('newsManage')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'ক্যাম্পাস নোটিশ, অ্যালামনাই সাফল্য ও প্রাতিষ্ঠানিক প্রেস রিলিজ প্রকাশ ও সম্পাদনা'
              : 'Publish, edit news bulletins, alumnus spotlights, and community updates'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-600/20 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isBn ? 'নতুন সংবাদ' : 'New Story'}</span>
        </button>
      </div>

      {/* Creation & Edit Modal */}
      {showModal && (
        <Card className="border-emerald-500/40 shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-150">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingPost ? <Pencil className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>
                  {editingPost
                    ? (isBn ? 'সংবাদ সম্পাদনা করুন' : 'Edit News Story')
                    : (isBn ? 'নতুন সংবাদ প্রকাশ' : 'Publish New Story')}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {editingPost
                  ? (isBn ? 'সংবাদের শিরোনাম, বিবরণ ও ছবি হালনাগাদ করুন' : 'Update story content, summary, and category')
                  : (isBn ? 'নতুন ক্যাম্পাস সংবাদ বা অর্জন প্রকাশের তথ্য পূরণ করুন' : 'Fill in story details to broadcast to alumni')}
              </CardDescription>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'শিরোনাম (বাংলা) *' : 'Title (Bengali) *'}
                  </label>
                  <Input
                    required
                    placeholder="উদা: ২০২৬ সালের গ্র্যান্ড রিইউনিয়নের রেজিস্ট্রেশন শুরু"
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Title (English) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Registration Opens for Annual Grand Reunion 2026"
                    value={formData.title_en}
                    onChange={handleTitleEnChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'ক্যাটাগরি *' : 'Category *'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Campus">Campus Update</option>
                    <option value="Spotlight">Alumni Spotlight</option>
                    <option value="Story">Story / Article</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <ImageUpload
                    shape="rectangle"
                    label={isBn ? 'কভার ছবি' : 'Cover Image'}
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    helperText={isBn ? 'সংবাদের কভার ছবি আপলোড করুন (JPG, PNG, WEBP)' : 'Upload news cover image (JPG, PNG, WEBP up to 5MB)'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Summary (Bengali)'}
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="১-২ লাইনে সারসংক্ষেপ লিখুন..."
                    value={formData.summary_bn}
                    onChange={(e) => setFormData({ ...formData, summary_bn: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Summary (English)
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Short 1-2 sentence preview summary..."
                    value={formData.summary_en}
                    onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-8 pt-2">
                <SectionBuilder
                  required
                  label={isBn ? 'সেকশন বিল্ডার: সম্পূর্ণ প্রতিবেদন (বাংলা)' : 'Section Builder: Full Content (Bengali)'}
                  value={formData.content_bn}
                  onChange={(val) => setFormData({ ...formData, content_bn: val })}
                  isBn={true}
                />

                <SectionBuilder
                  required
                  label="Section Builder: Full Content (English)"
                  value={formData.content_en}
                  onChange={(val) => setFormData({ ...formData, content_en: val })}
                  isBn={false}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  {common('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : editingPost
                    ? (isBn ? 'হালনাগাদ করুন' : 'Update Story')
                    : (isBn ? 'প্রকাশ করুন' : 'Publish Story')}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* News Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">{isBn ? 'সংবাদের শিরোনাম' : 'Article Title'}</th>
                <th className="p-4">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="p-4">{isBn ? 'প্রকাশের তারিখ' : 'Published Date'}</th>
                <th className="p-4 text-right">{common('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>{common('loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    No articles published yet
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white max-w-[320px] truncate">
                        {isBn ? post.title_bn : post.title_en}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[320px]">
                        {isBn ? post.summary_bn : post.summary_en}
                      </p>
                    </td>

                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{post.category}</Badge>
                    </td>

                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {formatDate(post.publishedAt || post.createdAt, locale)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-900/50 transition-all shadow-2xs hover:shadow-xs"
                          title="Edit Story"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id, isBn ? post.title_bn : post.title_en)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/50 transition-all shadow-2xs hover:shadow-xs"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
