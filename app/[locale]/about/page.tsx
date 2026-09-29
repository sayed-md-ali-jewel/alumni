'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  GraduationCap,
  Target,
  Eye,
  ShieldCheck,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('about');
  const isBn = locale === 'bn';

  const committeeMembers = [
    {
      role_bn: 'সভাপতি',
      role_en: 'President',
      name: 'Dr. Rafiqul Islam',
      dept: 'CSE, Batch 1998',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      role_bn: 'সাধারণ সম্পাদক',
      role_en: 'General Secretary',
      name: 'Engr. Arifur Rahman Khan',
      dept: 'EEE, Batch 2010',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      role_bn: 'কোষাধ্যক্ষ',
      role_en: 'Treasurer',
      name: 'Nusrat Jahan Chowdhury',
      dept: 'BBA, Batch 2018',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      role_bn: 'সাংগঠনিক সম্পাদক',
      role_en: 'Organizing Secretary',
      name: 'Mahmudul Hasan Shuvo',
      dept: 'Civil, Batch 2012',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>{isBn ? 'পরিচিতি ও ইতিহাস' : 'Legacy & Heritage'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {t('subtitle')}
        </p>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('missionTitle')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('missionDesc')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('visionTitle')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('visionDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heritage & History */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{t('history')}</span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          {isBn
            ? 'পঁচিশ বছরের গৌরবোজ্জ্বল পথচলা ও ঐতিহ্য'
            : '25 Years of Unbroken Fellowship and Impact'}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {t('historyDesc')}
        </p>
      </div>

      {/* Executive Committee */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('leadershipTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {isBn
              ? 'গণতান্ত্রিকভাবে নির্বাচিত নির্বাহী পরিষদ'
              : 'Elected Board of Trustees & Executive Leaders'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {committeeMembers.map((member, idx) => (
            <Card key={idx} className="border-slate-200 dark:border-slate-800 text-center">
              <CardContent className="p-6 space-y-3">
                <Avatar
                  src={member.image}
                  fallback={member.name}
                  size="xl"
                  className="mx-auto ring-2 ring-primary/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {member.name}
                  </h4>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {isBn ? member.role_bn : member.role_en}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{member.dept}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
