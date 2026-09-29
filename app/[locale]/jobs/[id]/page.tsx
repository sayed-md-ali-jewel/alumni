import React from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { JobPost } from '@/models/JobPost';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Mail,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

async function getJob(id: string) {
  try {
    await connectToDatabase();
    return await JobPost.findById(id).populate('postedBy', 'name email image isVerified phone');
  } catch (e) {
    return null;
  }
}

export default async function JobDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const job = (await getJob(id)) as any;
  if (!job) {
    notFound();
  }

  const isBn = locale === 'bn';
  const postedBy = job.postedBy;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      {/* Back button */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'ক্যারিয়ার হবে ফিরে যান' : 'Back to Career Hub'}</span>
      </Link>

      {/* Main Job Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs uppercase font-bold">
                  {job.type.replace('_', ' ')}
                </Badge>
                {job.isReferral && (
                  <Badge variant="success" className="text-xs gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{isBn ? 'অ্যালামনাই রেফারেল সুবিধা' : 'Alumni Referral'}</span>
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {job.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-primary" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
              </div>
            </div>

            {/* Apply Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {job.applicationUrl && (
                <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                  <Button className="w-full sm:w-auto gap-1.5 bg-primary text-white">
                    <span>{isBn ? 'ওয়েবসাইটে আবেদন করুন' : 'Apply on Company Site'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
              {job.contactEmail && (
                <a href={`mailto:${job.contactEmail}?subject=Application for ${job.title}`}>
                  <Button variant="outline" className="w-full sm:w-auto gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{isBn ? 'ইমেইলে যোগাযোগ' : 'Email Application'}</span>
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Salary & Meta info */}
          {job.salaryRange && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center gap-2 border border-slate-200 dark:border-slate-800 text-sm">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-slate-500">{isBn ? 'বেতন পরিসর: ' : 'Salary Range: '}</span>
              <span className="font-bold text-slate-900 dark:text-white">{job.salaryRange}</span>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'দায়িত্ব ও কাজের বিবরণ' : 'Job Description'}
            </h3>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements List */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'প্রয়োজনীয় যোগ্যতাসমূহ' : 'Key Requirements'}
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Poster info */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={postedBy?.image} fallback={postedBy?.name || 'AL'} size="md" />
              <div>
                <p className="text-xs text-slate-500">{isBn ? 'বিজ্ঞপ্তি প্রদানকারী' : 'Posted by'}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{postedBy?.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {formatDate(job.createdAt, locale)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
