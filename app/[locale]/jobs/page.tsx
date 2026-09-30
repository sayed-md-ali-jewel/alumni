'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  PlusCircle,
  ExternalLink,
  Sparkles,
  DollarSign,
  Tag,
} from 'lucide-react';

export default function JobsPage() {
  const t = useTranslations('jobs');
  const common = useTranslations('common');
  const locale = useLocale();

  const [jobs, setJobs] = useState<any[]>([]);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isBn = locale === 'bn';

  const types = [
    { value: 'all', label_bn: 'সকল চাকরির ধরন', label_en: 'All Types' },
    { value: 'full_time', label_bn: 'ফুল টাইম', label_en: 'Full-Time' },
    { value: 'remote', label_bn: 'রিমোট', label_en: 'Remote' },
    { value: 'internship', label_bn: 'ইন্টার্নশিপ', label_en: 'Internship' },
    { value: 'part_time', label_bn: 'পার্ট টাইম', label_en: 'Part-Time' },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        q: search,
      });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Briefcase className="w-4 h-4" />
            <span>{isBn ? 'ক্যারিয়ার ও কর্মসংস্থান' : 'Career Opportunities'}</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        <Link href="/jobs/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-md">
            <PlusCircle className="w-4 h-4" />
            <span>{t('postJob')}</span>
          </Button>
        </Link>
      </div>

      {/* Search & Type Filter Card */}
      <Card className="border-slate-200 dark:border-slate-800 p-3.5 xs:p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder={isBn ? 'পদবী, কোম্পানি বা দক্ষতা দিয়ে খুঁজুন...' : 'Search by title, company, or keyword...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full md:w-auto md:min-w-[180px]"
          >
            {types.map((tp) => (
              <option key={tp.value} value={tp.value}>
                {isBn ? tp.label_bn : tp.label_en}
              </option>
            ))}
          </select>

          <Button type="submit" className="w-full md:w-auto gap-2">
            <Search className="w-4 h-4" />
            <span>{isBn ? 'খুঁজুন' : 'Search'}</span>
          </Button>
        </form>
      </Card>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 sm:py-16 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো চাকরির বিজ্ঞপ্তি পাওয়া যায়নি' : 'No job listings found'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <Card
              key={job._id}
              className="group hover:-translate-y-1 transition-all duration-200 border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <CardContent className="p-4 xs:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs uppercase font-bold">
                        {job.type.replace('_', ' ')}
                      </Badge>
                      {job.isReferral && (
                        <Badge variant="success" className="text-xs gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{isBn ? 'রেফারেল প্রযোজ্য' : 'Alumni Referral'}</span>
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-base xs:text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-2 xs:gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                      <span className="font-semibold flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                </div>

                {job.salaryRange && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border border-slate-100 dark:border-slate-800">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{job.salaryRange}</span>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar src={job.postedBy?.image} fallback={job.postedBy?.name || 'AL'} size="sm" />
                    <span className="text-xs text-slate-500 truncate">
                      {isBn ? 'পোস্ট করেছেন: ' : 'Posted by '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {job.postedBy?.name}
                      </span>
                    </span>
                  </div>

                  <Link href={`/jobs/${job._id}`} className="w-full xs:w-auto">
                    <Button size="sm" variant="outline" className="w-full xs:w-auto text-xs gap-1">
                      <span>{isBn ? 'আবেদন / বিস্তারিত' : 'Apply / View'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
