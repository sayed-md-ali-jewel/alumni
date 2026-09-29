'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { formatDate, toBengaliNumerals } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Share2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import { useSweetAlert } from '@/components/ui/SweetAlert';

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const t = useTranslations('events');
  const common = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const { showLoginPrompt, showAlert, showToast } = useSweetAlert();

  const [eventData, setEventData] = useState<any>(null);
  const [userRsvp, setUserRsvp] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState('');

  const isBn = locale === 'bn';

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setEventData(data.event);

      // Check current user's RSVP
      const currentUserId = (session?.user as any)?.id;
      if (currentUserId && data.rsvps) {
        const myRsvp = data.rsvps.find((r: any) => r.userId?._id === currentUserId || r.userId === currentUserId);
        if (myRsvp) {
          setUserRsvp(myRsvp.status);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id, session]);

  const handleRsvp = async (status: 'going' | 'interested' | 'declined') => {
    if (!session) {
      showLoginPrompt(
        isBn
          ? 'ইভেন্টে আপনার উপস্থিতি নিশ্চিত (RSVP) করতে অনুগ্রহ করে প্রথমে লগইন করুন।'
          : 'Please sign in to confirm your RSVP for this event.'
      );
      return;
    }

    setRsvpLoading(true);
    setRsvpSuccessMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          status,
          guestsCount: 0,
        }),
      });

      if (res.ok) {
        setUserRsvp(status);
        setRsvpSuccessMsg(t('rsvpSuccess'));
        fetchEvent(); // Refresh attendee count
        showToast({
          title: status === 'going' ? (isBn ? 'উপস্থিতি নিশ্চিত হয়েছে!' : 'RSVP Confirmed!') : (isBn ? 'অবস্থা সংরক্ষিত' : 'Status Saved'),
          text: status === 'going' ? (isBn ? 'আমরা ইভেন্টে আপনাকে দেখার অপেক্ষায় রইলাম।' : 'We look forward to seeing you at the event.') : undefined,
          type: 'success',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">{common('loading')}</p>
      </div>
    );
  }

  if (!eventData) {
    notFound();
  }

  const title = isBn ? eventData.title_bn : eventData.title_en;
  const desc = isBn ? eventData.description_bn : eventData.description_en;
  const attendeesCount = eventData.attendees?.length || 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8">
      {/* Back button */}
      <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'সকল ইভেন্টে ফিরে যান' : 'Back to Events'}</span>
      </Link>

      {/* Main Event Hero */}
      <div className="space-y-6">
        {eventData.image && (
          <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <img src={eventData.image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-1 text-xs">
                {eventData.category}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(eventData.date, locale)}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{eventData.location}</span>
          </div>
        </div>
      </div>

      {/* Two Column Details and RSVP Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Attendee list */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span>{t('eventDetails')}</span>
              </h3>
              <RichContentRenderer content={desc} />
            </CardContent>
          </Card>

          {/* Confirmed Attendees Section */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isBn ? 'অংশগ্রহণকারী সদস্যবৃন্দ' : 'Registered Attendees'}
                </h3>
                <Badge variant="success" className="text-xs">
                  {isBn ? `${toBengaliNumerals(attendeesCount)} জন` : `${attendeesCount} members`}
                </Badge>
              </div>

              {attendeesCount === 0 ? (
                <p className="text-xs text-slate-500">
                  {isBn ? 'এখনও কেউ RSVP করেননি। প্রথম অংশগ্রহণকারী হোন!' : 'No RSVPs yet. Be the first to join!'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {eventData.attendees?.map((att: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                    >
                      <Avatar src={att.image} fallback={att.name || 'AL'} size="sm" />
                      <span className="truncate max-w-[120px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: RSVP Actions Widget */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {t('rsvp')}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'আপনার উপস্থিতি নিশ্চিত করে আসন সংরক্ষণ করুন'
                    : 'Confirm your attendance to reserve your seat'}
                </p>
              </div>

              {rsvpSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{rsvpSuccessMsg}</span>
                </div>
              )}

              {userRsvp && (
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold text-center">
                  {isBn ? `আপনার বর্তমান অবস্থা: ` : `Your current RSVP: `}
                  <span className="font-black uppercase">{userRsvp}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  isLoading={rsvpLoading}
                  onClick={() => handleRsvp('going')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('going')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  isLoading={rsvpLoading}
                  onClick={() => handleRsvp('interested')}
                >
                  {t('interested')}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-slate-500 hover:text-rose-600"
                  isLoading={rsvpLoading}
                  onClick={() => handleRsvp('declined')}
                >
                  {t('declined')}
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>{locale === 'bn' ? 'মোট আসন সংখ্যা' : 'Capacity'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {eventData.capacity || 500}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('organizer')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {eventData.createdBy?.name || 'Alumni Secretariat'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
