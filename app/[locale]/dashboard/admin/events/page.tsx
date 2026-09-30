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
  Calendar,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function AdminEventsPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const { showAlert } = useSweetAlert();

  const isBn = locale === 'bn';

  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title_bn: '',
    title_en: '',
    description_bn: '',
    description_en: '',
    date: '',
    location: '',
    category: 'Reunion',
    capacity: 500,
    image: '',
    allowSharing: true,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title_bn: '',
      title_en: '',
      description_bn: '',
      description_en: '',
      date: '',
      location: '',
      category: 'Reunion',
      capacity: 500,
      image: '',
      allowSharing: true,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingEvent(event);
    let formattedDate = '';
    if (event.date) {
      try {
        const d = new Date(event.date);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      } catch (e) {
        formattedDate = '';
      }
    }

    setFormData({
      title_bn: event.title_bn || '',
      title_en: event.title_en || '',
      description_bn: event.description_bn || '',
      description_en: event.description_en || '',
      date: formattedDate,
      location: event.location || '',
      category: event.category || 'Reunion',
      capacity: event.capacity || 500,
      image: event.image || '',
      allowSharing: event.allowSharing !== false,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const isEdit = Boolean(editingEvent);
      const url = isEdit ? `/api/events/${editingEvent._id}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      const descBn =
        formData.description_bn && formData.description_bn.trim() !== ''
          ? formData.description_bn
          : JSON.stringify([
              {
                id: 'ev-1',
                type: 'paragraph',
                paragraphText: formData.title_bn,
              },
            ]);

      const descEn =
        formData.description_en && formData.description_en.trim() !== ''
          ? formData.description_en
          : JSON.stringify([
              {
                id: 'ev-1',
                type: 'paragraph',
                paragraphText: formData.title_en,
              },
            ]);

      const payload = {
        ...formData,
        description_bn: descBn,
        description_en: descEn,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      setShowModal(false);
      setEditingEvent(null);
      fetchEvents();
      showAlert({
        title: isEdit
          ? (isBn ? 'ইভেন্ট হালনাগাদ সম্পন্ন!' : 'Event Updated!')
          : (isBn ? 'ইভেন্ট তৈরি সম্পন্ন!' : 'Event Published!'),
        text: isEdit
          ? (isBn ? 'ইভেন্টের তথ্য সফলভাবে পরিমার্জন করা হয়েছে।' : 'Event details have been updated successfully.')
          : (isBn ? 'নতুন ইভেন্টটি সক্রিয় করা হয়েছে।' : 'New event has been published successfully.'),
        type: 'success',
      });
    } catch (err: any) {
      setError(err?.message || 'Error saving event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    showAlert({
      title: isBn ? 'ইভেন্ট মুছে ফেলতে চান?' : 'Delete this event?',
      text: isBn
        ? 'এই ইভেন্টটি স্থায়ীভাবে মুছে ফেলা হবে এবং সকল RSVP তথ্য বাতিল হবে।'
        : 'This will permanently remove the event and all associated RSVP registrations.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      confirmButtonVariant: 'destructive',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setEvents(events.filter((e) => e._id !== id));
            showAlert({
              title: isBn ? 'মুছে ফেলা হয়েছে!' : 'Deleted!',
              text: isBn ? 'ইভেন্টটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Event removed successfully.',
              type: 'success',
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      search === '' ||
      (e.title_bn && e.title_bn.toLowerCase().includes(search.toLowerCase())) ||
      (e.title_en && e.title_en.toLowerCase().includes(search.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>{isBn ? 'ইভেন্ট ও সমাবেশ' : 'Events & Gatherings'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('eventsManage')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'রিইউনিয়ন, গালা ডিনার, ক্যারিয়ার ফেয়ার ও ওয়েবিনার শিডিউল পরিচালনা ও সম্পাদনা করুন'
              : 'Schedule, edit reunions, webinars, RSVP capacity, and attendee management'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-700 text-white shadow-xs hover:shadow-primary/20 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isBn ? 'নতুন ইভেন্ট' : 'New Event'}</span>
        </button>
      </div>

      {/* Creation & Edit Modal */}
      {showModal && (
        <Card className="border-primary/40 shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-150">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingEvent ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                <span>
                  {editingEvent
                    ? (isBn ? 'ইভেন্ট সম্পাদনা করুন' : 'Edit Event')
                    : (isBn ? 'নতুন ইভেন্ট তৈরি করুন' : 'Create New Event')}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {editingEvent
                  ? (isBn ? 'ইভেন্টের বিবরণ ও সময়সূচী হালনাগাদ করুন' : 'Update event schedule, venue, and capacity')
                  : (isBn ? 'নতুন রিইউনিয়ন বা মিলনমেলার তথ্য পূরণ করুন' : 'Fill in the event details to publish')}
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
                    placeholder="উদা: গ্র্যান্ড রিইউনিয়ন ২০২৬"
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
                    placeholder="e.g. Grand Alumni Reunion 2026"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'তারিখ ও সময় *' : 'Date & Time *'}
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'ক্যাটাগরি *' : 'Category *'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
                  >
                    <option value="Reunion">Reunion</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Gala">Gala Dinner</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'আসন সংখ্যা' : 'Capacity (Seats)'}
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'স্থান ও ঠিকানা *' : 'Venue & Location *'}
                </label>
                <Input
                  required
                  placeholder="Central Auditorium, Campus, Dhaka"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <ImageUpload
                  shape="rectangle"
                  label={isBn ? 'ইভেন্ট কভার ছবি' : 'Event Cover Image'}
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  helperText={isBn ? 'ইভেন্টের কভার ছবি আপলোড করুন (JPG, PNG, WEBP)' : 'Upload event cover image (JPG, PNG, WEBP up to 5MB)'}
                />
              </div>

              {/* Social Sharing Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isBn ? 'সোশ্যাল মিডিয়া শেয়ারিং' : 'Social Sharing'}
                    </span>
                    <Badge variant={formData.allowSharing ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {formData.allowSharing ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBn
                      ? 'ভিজিটরদের এই ইভেন্টটি সোশ্যাল মিডিয়ায় (ফেসবুক, এক্স, হোয়াটসঅ্যাপ, লিঙ্কডইন) শেয়ার করার অনুমতি দিন।'
                      : 'Allow visitors to share this Event on social media (Facebook, X/Twitter, WhatsApp, LinkedIn).'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.allowSharing}
                    onChange={(e) => setFormData({ ...formData, allowSharing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="space-y-8 pt-2">
                <SectionBuilder
                  required
                  label={isBn ? 'সেকশন বিল্ডার: বিস্তারিত বিবরণ ও সময়সূচী (বাংলা)' : 'Section Builder: Detailed Description & Schedule (Bengali)'}
                  value={formData.description_bn}
                  onChange={(val) => setFormData({ ...formData, description_bn: val })}
                  isBn={true}
                />

                <SectionBuilder
                  required
                  label="Section Builder: Detailed Description & Schedule (English)"
                  value={formData.description_en}
                  onChange={(val) => setFormData({ ...formData, description_en: val })}
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-700 text-white shadow-xs hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : editingEvent
                    ? (isBn ? 'হালনাগাদ করুন' : 'Update Event')
                    : (isBn ? 'তৈরি করুন' : 'Create Event')}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">{isBn ? 'ইভেন্ট শিরোনাম' : 'Event Title'}</th>
                <th className="p-4">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="p-4">{isBn ? 'তারিখ ও স্থান' : 'Date & Venue'}</th>
                <th className="p-4">{isBn ? 'অংশগ্রহণকারী' : 'Attendees'}</th>
                <th className="p-4 text-right">{common('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>{common('loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No scheduled events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white max-w-[260px] truncate">
                        {isBn ? event.title_bn : event.title_en}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">ID: {event._id?.slice(-6)}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{event.category}</Badge>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-xs text-amber-600 dark:text-amber-400">
                        {formatDate(event.date, locale)}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{event.location}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {event.attendees?.length || 0} / {event.capacity || 500} RSVPs
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(event)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-primary-600 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/50 border border-primary-200/80 dark:border-primary-900/50 transition-all shadow-2xs hover:shadow-xs"
                          title="Edit Event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/50 transition-all shadow-2xs hover:shadow-xs"
                          title="Delete Event"
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
