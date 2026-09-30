'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, toBengaliNumerals } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function EventsPage() {
  const t = useTranslations('events');
  const common = useTranslations('common');
  const locale = useLocale();

  const [events, setEvents] = useState<any[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const isBn = locale === 'bn';

  const categories = ['all', 'Reunion', 'Webinar', 'Gala', 'Workshop', 'Sports', 'Networking'];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events?filter=${tab}&category=${category}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (e) {
        console.error('Failed to load events:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [tab, category]);

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Calendar className="w-4 h-4" />
          <span>{isBn ? 'মিলনমেলা ও আয়োজন' : 'Reunions & Gatherings'}</span>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-3xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Upcoming vs Past Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              tab === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('upcoming')}
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              tab === 'past'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('past')}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? (isBn ? 'সকল ক্যাটাগরি' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো ইভেন্ট পাওয়া যায়নি' : 'No events found'}
          </h3>
          <p className="text-xs text-slate-500">
            {isBn ? 'অন্য ক্যাটাগরি নির্বাচন করুন' : 'Try selecting a different category'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const title = isBn ? event.title_bn : event.title_en;
            const desc = isBn ? event.description_bn : event.description_en;
            const attendeesCount = event.attendees?.length || 0;

            return (
              <Card
                key={event._id}
                className="group hover:-translate-y-1 transition-all duration-200 overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {event.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={event.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-slate-900/80 text-white backdrop-blur-md text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(event.date, locale)}</span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {isBn ? `${toBengaliNumerals(attendeesCount)} জন` : `${attendeesCount} attendees`}
                        </span>
                      </div>
                    </div>

                    <Link href={`/events/${event._id}`} className="block">
                      <Button size="sm" className="w-full gap-1.5 text-xs">
                        <span>{isBn ? 'RSVP / বিস্তারিত দেখুন' : 'RSVP / View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
