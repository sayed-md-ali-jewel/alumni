import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Event } from '@/models/Event';
import { NewsPost } from '@/models/NewsPost';
import { Donation } from '@/models/Donation';
import { Campaign } from '@/models/Campaign';
import { CommitteePost } from '@/models/CommitteePost';
import { ensureDefaultCommitteePosts } from '@/lib/committee';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DonationProgress } from '@/components/shared/DonationProgress';
import { formatCurrency, formatDate, toBengaliNumerals } from '@/lib/utils';
import { BloodRequest } from '@/models/BloodRequest';
import { HomeHeroCentered } from '@/components/home/HomeHeroCentered';
import { HomeHeroTwoColumn } from '@/components/home/HomeHeroTwoColumn';
import { HomeImageSlider } from '@/components/home/HomeImageSlider';
import { getActiveSliderItems, getIsSliderEnabled } from '@/lib/slider';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';
import { DirectoryUserActions } from '@/components/requests/DirectoryUserActions';
import { LinkedInIcon, FacebookIcon, WhatsAppIcon } from '@/components/shared/SocialIcons';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Calendar,
  ArrowRight,
  Sparkles,
  Award,
  Crown,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Check,
  TrendingUp,
  Droplet,
  HeartPulse,
  BookOpen,
  Atom,
  Coins,
  Palette,
  AlertTriangle,
  Clock,
  Building2,
  Briefcase,
  Mail,
  ExternalLink,
} from 'lucide-react';

const groupLabelBn: Record<string, string> = {
  Science: 'বিজ্ঞান',
  Commerce: 'ব্যবসায় শিক্ষা',
  Humanities: 'মানবিক',
};

const groupColors: Record<string, string> = {
  Science:
    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40',
  Commerce:
    'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
  Humanities:
    'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40',
};

async function getHomeData() {
  try {
    await connectToDatabase();

    const [
      totalAlumni,
      batches,
      spotlightProfiles,
      upcomingEvents,
      latestNews,
      donationStats,
      activeBloodRequests,
      totalDonors,
      availableDonors,
      scienceCount,
      commerceCount,
      humanitiesCount,
      liveCampaigns,
      isSliderEnabled,
      sliderItems,
      siteSettingsDoc,
    ] = await Promise.all([
      User.countDocuments({ role: 'alumni' }),
      AlumniProfile.distinct('batchYear'),
      AlumniProfile.find({ visibility: 'public' })
        .populate('userId', 'name image isVerified bloodGroup email')
        .sort({ updatedAt: -1 })
        .limit(3)
        .lean(),
      Event.find({ date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(3),
      NewsPost.find().sort({ publishedAt: -1 }).limit(3),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$campaign',
            raised: { $sum: '$amount' },
            donorsCount: { $sum: 1 },
          },
        },
      ]),
      BloodRequest.find({ status: { $in: ['Open', 'Partially Fulfilled'] } })
        .sort({ urgency: -1, createdAt: -1 })
        .limit(3),
      AlumniProfile.countDocuments({ isBloodDonor: true, bloodDonationConsent: true }),
      AlumniProfile.countDocuments({
        isBloodDonor: true,
        bloodDonationConsent: true,
        donationStatus: 'Available',
      }),
      AlumniProfile.countDocuments({ group: 'Science' }),
      AlumniProfile.countDocuments({ group: 'Commerce' }),
      AlumniProfile.countDocuments({ group: 'Humanities' }),
      Campaign.find({ status: { $in: ['active', 'completed'] } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(2)
        .lean(),
      getIsSliderEnabled(),
      getActiveSliderItems(),
      SiteSetting.findOne({ key: 'site_settings' }).lean(),
    ]);

    // Ensure default committee posts exist
    await ensureDefaultCommitteePosts();
    if (!User) void User;
    if (!CommitteePost) void CommitteePost;

    // Fetch active executive committee posts in sortOrder (EXCLUDING default regular member posts)
    const executivePosts = await CommitteePost.find({
      isActive: true,
      isDefault: { $ne: true },
      name_en: { $nin: ['Member', 'General Member'] },
      name_bn: { $nin: ['সদস্য', 'সাধারণ সদস্য'] },
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    const executivePostIds = executivePosts.map((p) => p._id);

    // Fetch alumni profiles assigned ONLY to active executive committee posts
    let rawCommitteeProfiles = await AlumniProfile.find({
      committeePost: { $in: executivePostIds },
      visibility: 'public',
    })
      .populate({
        path: 'userId',
        select: 'name email image isVerified bloodGroup phone',
        model: User,
      })
      .populate({
        path: 'committeePost',
        select: 'name_en name_bn sortOrder isActive isDefault',
        model: CommitteePost,
      })
      .lean();

    // Filter valid profiles with a valid user and non-default executive post
    rawCommitteeProfiles = rawCommitteeProfiles.filter(
      (p: any) =>
        p.userId &&
        (p.userId as any).name &&
        p.committeePost &&
        !p.committeePost.isDefault &&
        p.committeePost.name_en !== 'Member' &&
        p.committeePost.name_bn !== 'সদস্য'
    );

    // Strict deduplication by profile ID and user ID to ensure no duplicate cards
    const seenProfileIds = new Set<string>();
    const seenUserIds = new Set<string>();
    const committeeProfiles: any[] = [];

    for (const p of rawCommitteeProfiles) {
      const pId = p._id.toString();
      const uId = (p.userId as any)?._id?.toString() || (p.userId as any)?.toString();
      if (!seenProfileIds.has(pId) && (!uId || !seenUserIds.has(uId))) {
        seenProfileIds.add(pId);
        if (uId) seenUserIds.add(uId);
        committeeProfiles.push(p);
      }
    }

    // Sort strictly by committeePost sortOrder (e.g., President = 1, VP = 2, Secretary = 3, etc.)
    committeeProfiles.sort((a: any, b: any) => {
      const orderA = a.committeePost?.sortOrder ?? 999;
      const orderB = b.committeePost?.sortOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.batchYear || 0) - (b.batchYear || 0);
    });

    const totalRaised = donationStats.reduce((acc, curr) => acc + curr.raised, 0);

    const donationCampaigns =
      liveCampaigns && liveCampaigns.length > 0
        ? liveCampaigns.map((c: any) => ({
            title: c.title_en,
            title_bn: c.title_bn,
            desc: c.description_en,
            desc_bn: c.description_bn,
            goal: c.goal,
            raised:
              donationStats.find((d) => d._id === c.title_en || d._id === c.title_bn)?.raised ||
              c.raised ||
              0,
          }))
        : [
            {
              title: 'Student Scholarship Endowment Fund',
              title_bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থী শিক্ষাবৃত্তি তহবিল',
              desc: 'Sponsoring full school tuition and learning resources for talented students in need.',
              desc_bn: 'আর্থিক অসচ্ছলতার কারণে কোনো মেধাবী শিক্ষার্থীর পড়াশোনা যাতে বন্ধ না হয়, তার সম্পূর্ণ দায়িত্ব গ্রহণ।',
              goal: 1000000,
              raised:
                donationStats.find((d) => d._id === 'Student Scholarship Endowment Fund')?.raised || 350000,
            },
            {
              title: 'Smart Science Lab & Digital Campus Renovation',
              title_bn: 'স্মার্ট সায়েন্স ল্যাব ও ডিজিটাল ক্যাম্পাস আধুনিকায়ন',
              desc: 'Modern lab equipment, smart interactive boards, and high-speed campus connectivity.',
              desc_bn: 'আধুনিক বিজ্ঞান গবেষণাগার সরঞ্জাম ও মাল্টিমিডিয়া ডিজিটাল শ্রেণীকক্ষ নির্মাণ।',
              goal: 750000,
              raised:
                donationStats.find((d) => d._id === 'Smart Classroom & AI Lab Renovation')?.raised || 200000,
            },
          ];

    return {
      stats: {
        totalAlumni: Math.max(totalAlumni, 1250),
        batchesCount: Math.max(batches.length, 30),
        totalDonors: Math.max(totalDonors, 48),
        availableDonors: Math.max(availableDonors, 32),
        totalRaised: Math.max(totalRaised, 550000),
        groupCounts: {
          Science: scienceCount || 540,
          Commerce: commerceCount || 380,
          Humanities: humanitiesCount || 330,
        },
      },
      siteSettings: (siteSettingsDoc as any) || DEFAULT_SITE_SETTINGS,
      isSliderEnabled: isSliderEnabled !== false,
      slides: JSON.parse(JSON.stringify(sliderItems || [])),
      spotlightProfiles: JSON.parse(JSON.stringify(spotlightProfiles || [])),
      committeeProfiles: JSON.parse(JSON.stringify(committeeProfiles || [])),
      upcomingEvents,
      latestNews,
      activeBloodRequests,
      donationCampaigns,
    };
  } catch (error) {
    console.error('Home data fetching error:', error);
    return {
      stats: {
        totalAlumni: 1250,
        batchesCount: 30,
        totalDonors: 48,
        availableDonors: 32,
        totalRaised: 550000,
        groupCounts: { Science: 540, Commerce: 380, Humanities: 330 },
      },
      siteSettings: DEFAULT_SITE_SETTINGS,
      isSliderEnabled: false,
      slides: [],
      spotlightProfiles: [],
      committeeProfiles: [],
      upcomingEvents: [],
      latestNews: [],
      activeBloodRequests: [],
      donationCampaigns: [],
    };
  }
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const data = await getHomeData();
  const settings = data.siteSettings || DEFAULT_SITE_SETTINGS;

  const isBn = locale === 'bn';

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 
        When Slider is ENABLED:
          1st Section: Pure Full-Width Image Slider
          2nd Section: Hero & Home Banner (2-Column layout with live association metrics card)
        When Slider is DISABLED:
          1st Section: Centered Hero layout (Image 1 design with 4 stats cards)
          2nd Section: Slider is omitted
      */}
      {data.isSliderEnabled && data.slides && data.slides.length > 0 ? (
        <>
          {/* 1st Section: Pure Full-Width Image Slider with dynamic display controls */}
          <HomeImageSlider
            slides={data.slides}
            showTitle={settings.sliderShowTitle !== false}
            showDescription={settings.sliderShowDescription !== false}
            showButton={settings.sliderShowButton !== false}
            isBn={isBn}
          />

          {/* 2nd Section: Hero & Home Banner (2-Column Layout) */}
          <HomeHeroTwoColumn stats={data.stats} settings={settings} isBn={isBn} />
        </>
      ) : (
        /* 1st Section: Centered Hero (When Slider Disabled) */
        <HomeHeroCentered stats={data.stats} settings={settings} isBn={isBn} />
      )}

      {/* Academic Groups Hub Section */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{isBn ? 'একাডেমিক বিভাগ ও গ্রুপ' : 'Academic Groups'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isBn ? 'আমাদের তিনটি প্রধান গ্রুপ' : 'Three Core Academic Streams'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের সকল প্রাক্তনের সমন্বিত নেটওয়ার্ক'
                : 'Connecting graduates from Science, Commerce, and Humanities streams worldwide.'}
            </p>
          </div>

          <Link href="/directory" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
            <span>{isBn ? 'সব গ্র্যাজুয়েট দেখুন' : 'Explore Alumni Directory'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Science Group */}
          <Link href="/directory?group=Science" className="group">
            <Card className="h-full border-blue-100 dark:border-blue-950/50 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-7 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Atom className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {isBn ? 'বিজ্ঞান বিভাগ' : 'Science Group'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isBn
                      ? 'চিকিৎসা, তথ্যপ্রযুক্তি, প্রকৌশল ও বৈজ্ঞানিক গবেষণায় অগ্রণী কৃতি প্রাক্তনবৃন্দ।'
                      : 'Medical, Engineering, IT, and Scientific research pioneers globally.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
                  <span>{isBn ? `${toBengaliNumerals(data.stats.groupCounts.Science)}+ সদস্য` : `${data.stats.groupCounts.Science}+ Members`}</span>
                  <span className="flex items-center gap-1">
                    {isBn ? 'ব্রাউজ করুন' : 'Browse'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Commerce Group */}
          <Link href="/directory?group=Commerce" className="group">
            <Card className="h-full border-amber-100 dark:border-amber-950/50 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-7 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {isBn ? 'ব্যবসায় শিক্ষা বিভাগ' : 'Commerce Group'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isBn
                      ? 'ব্যাংকিং, ফিন্যান্স, করপোরেট ব্যবস্থাপনা ও সফল উদ্যোক্তাদের শক্তিশালী ফোরাম।'
                      : 'Banking, Finance, Corporate Strategy, and Entrepreneurial leadership.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                  <span>{isBn ? `${toBengaliNumerals(data.stats.groupCounts.Commerce)}+ সদস্য` : `${data.stats.groupCounts.Commerce}+ Members`}</span>
                  <span className="flex items-center gap-1">
                    {isBn ? 'ব্রাউজ করুন' : 'Browse'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Humanities Group */}
          <Link href="/directory?group=Humanities" className="group">
            <Card className="h-full border-rose-100 dark:border-rose-950/50 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 hover:border-rose-500/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-7 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                  <Palette className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {isBn ? 'মানবিক বিভাগ' : 'Humanities Group'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isBn
                      ? 'আইন, বিচারব্যবস্থা, সিভিল সার্ভিস, সাংবাদিকতা ও সৃষ্টিশীল শিল্পকলার নেতৃত্ব।'
                      : 'Law, Judiciary, Civil Administration, Journalism, and Cultural Arts.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold">
                  <span>{isBn ? `${toBengaliNumerals(data.stats.groupCounts.Humanities)}+ সদস্য` : `${data.stats.groupCounts.Humanities}+ Members`}</span>
                  <span className="flex items-center gap-1">
                    {isBn ? 'ব্রাউজ করুন' : 'Browse'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Executive Committee Leadership Section */}
      {data.committeeProfiles && data.committeeProfiles.length > 0 && (
        <section className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                <Crown className="w-4 h-4" />
                <span>{isBn ? 'পরিচালনা পরিষদ' : 'Executive Leadership'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {isBn ? 'সম্মানিত কার্যনির্বাহী পরিষদ' : 'Executive Committee Leaders'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? 'অ্যাসোসিয়েশনের সার্বিক নেতৃত্ব ও পরিচালনার দায়িত্বে নিয়োজিত সম্মানিত সদস্যবৃন্দ'
                  : 'Dedicated alumni leaders steering the vision, fellowship, and institutional legacy.'}
              </p>
            </div>

            <Link href="/committee" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
              <span>{isBn ? 'সম্পূর্ণ কমিটি দেখুন' : 'View Full Committee'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.committeeProfiles.map((profile: any) => {
              const user = profile.userId || {};
              const blood = profile.bloodGroup || user?.bloodGroup;
              const displayName = user?.name || 'Committee Leader';
              const displayGroup = profile.group || profile.department;
              const batchText = profile.batchYear
                ? isBn
                  ? `ব্যাচ '${toBengaliNumerals(String(profile.batchYear))}`
                  : `Batch '${profile.batchYear}`
                : null;
              const locationText = profile.location || profile.donorLocation || 'Dhaka, Bangladesh';
              const postName = profile.committeePost
                ? isBn
                  ? profile.committeePost.name_bn || profile.committeePost.name_en
                  : profile.committeePost.name_en || profile.committeePost.name_bn
                : isBn
                ? 'কার্যনির্বাহী সদস্য'
                : 'Executive Member';

              return (
                <Card
                  key={profile._id.toString()}
                  className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    {/* Top: Avatar & Verified Info */}
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar
                            src={user?.image}
                            name={displayName}
                            fallback={displayName}
                            size="lg"
                            className="w-14 h-14 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs object-cover bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold"
                          />
                          {user?.isVerified && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs"
                              title={isBn ? 'যাচাইকৃত সদস্য' : 'Verified Member'}
                            >
                              <Check className="w-3 h-3 stroke-[3] text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name & Designation */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link
                            href={`/directory/${profile._id}`}
                            className="block font-bold text-base text-slate-900 dark:text-white hover:text-primary transition-colors truncate"
                          >
                            {displayName}
                          </Link>

                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/40 text-xs font-bold truncate">
                            <Crown className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="truncate">{postName}</span>
                          </div>

                          {profile.committeeRoleTitle && (
                            <div className="text-xs text-slate-500 truncate font-medium">
                              {profile.committeeRoleTitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Batch, Academic Stream & Blood Group Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {batchText && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            <span>{batchText}</span>
                          </span>
                        )}

                        {displayGroup && (
                          <span
                            className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                              groupColors[displayGroup] ||
                              'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40'
                            }`}
                          >
                            {isBn ? groupLabelBn[displayGroup] || displayGroup : displayGroup}
                          </span>
                        )}

                        {blood && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 text-xs font-bold">
                            <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" />
                            <span>{blood}</span>
                          </span>
                        )}
                      </div>

                      {/* Professional & Location Meta */}
                      <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                        {(profile.jobTitle || profile.company) && (
                          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed font-medium">
                              {profile.jobTitle && profile.company
                                ? `${profile.jobTitle} at ${profile.company}`
                                : profile.jobTitle || profile.company}
                            </span>
                          </div>
                        )}

                        {locationText && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions: Socials, Message & View Profile */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
                      {/* Social / Email Icons */}
                      <div className="flex items-center gap-1.5">
                        {profile.linkedin && (
                          <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
                            title="LinkedIn"
                          >
                            <LinkedInIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {(user?.email || profile.email) && (
                          <a
                            href={`mailto:${user?.email || profile.email}`}
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
                            title={user?.email || profile.email || 'Email'}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Actions: Message + Profile */}
                      <div className="flex items-center gap-2 ml-auto">
                        <DirectoryUserActions targetUser={profile} variant="card" showBlock={false} />

                        <Link href={`/directory/${profile._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs rounded-xl px-3 gap-1.5 font-semibold hover:bg-primary hover:text-white hover:border-primary border-slate-200 dark:border-slate-700 transition-colors shadow-none"
                          >
                            <span>{isBn ? 'প্রোফাইল' : 'Profile'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Alumni Spotlight */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
              <Award className="w-4 h-4" />
              <span>{isBn ? 'অ্যালামনাই স্পটলাইট' : 'Alumni Spotlight'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isBn ? 'আলোকিত কৃতি প্রাক্তন' : 'Distinguished Alumni Leaders'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'দেশ ও বিদেশের মাটিতে যারা রাখছেন অনন্য অবদান'
                : 'Graduates making transformative impact in tech, science, and industry.'}
            </p>
          </div>

          <Link href="/directory" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
            <span>{isBn ? 'সকল সদস্য দেখুন' : 'View Full Directory'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.spotlightProfiles.map((profile: any) => {
            const user = profile.userId || {};
            const blood = profile.bloodGroup || user?.bloodGroup;
            const displayName = user?.name || 'Alumni Member';
            const displayGroup = profile.group || profile.department;
            const batchText = profile.batchYear
              ? isBn
                ? `ব্যাচ '${toBengaliNumerals(String(profile.batchYear))}`
                : `Batch '${profile.batchYear}`
              : null;
            const locationText = profile.location || profile.donorLocation || 'Dhaka, Bangladesh';

            return (
              <Card
                key={profile._id.toString()}
                className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  {/* Top: Avatar & Verified Info */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Avatar
                          src={user?.image}
                          name={displayName}
                          fallback={displayName}
                          size="lg"
                          className="w-14 h-14 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs object-cover bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold"
                        />
                        {user?.isVerified && (
                          <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs"
                            title={isBn ? 'যাচাইকৃত সদস্য' : 'Verified Member'}
                          >
                            <Check className="w-3 h-3 stroke-[3] text-white" />
                          </div>
                        )}
                      </div>

                      {/* Name & Status */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link
                          href={`/directory/${profile._id}`}
                          className="block font-bold text-base text-slate-900 dark:text-white hover:text-primary transition-colors truncate"
                        >
                          {displayName}
                        </Link>

                        {user?.isVerified ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isBn ? 'যাচাইকৃত সদস্য' : 'Verified Member'}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 truncate">
                            {profile.jobTitle || (isBn ? 'প্রাক্তন শিক্ষার্থী' : 'Alumni Member')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Batch, Academic Stream & Blood Group Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {batchText && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>{batchText}</span>
                        </span>
                      )}

                      {displayGroup && (
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                            groupColors[displayGroup] ||
                            'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40'
                          }`}
                        >
                          {isBn ? groupLabelBn[displayGroup] || displayGroup : displayGroup}
                        </span>
                      )}

                      {blood && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 text-xs font-bold">
                          <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>{blood}</span>
                        </span>
                      )}
                    </div>

                    {/* Professional & Location Meta */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                      {(profile.jobTitle || profile.company) && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed font-medium">
                            {profile.jobTitle && profile.company
                              ? `${profile.jobTitle} at ${profile.company}`
                              : profile.jobTitle || profile.company}
                          </span>
                        </div>
                      )}

                      {locationText && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions: Socials, Message & View Profile */}
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
                    {/* Social / Email Icons */}
                    <div className="flex items-center gap-1.5">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
                          title="LinkedIn"
                        >
                          <LinkedInIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {(user?.email || profile.email) && (
                        <a
                          href={`mailto:${user?.email || profile.email}`}
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-slate-700/60"
                          title={user?.email || profile.email || 'Email'}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Actions: Message + Profile */}
                    <div className="flex items-center gap-2 ml-auto">
                      <DirectoryUserActions targetUser={profile} variant="card" showBlock={false} />

                      <Link href={`/directory/${profile._id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs rounded-xl px-3 gap-1.5 font-semibold hover:bg-primary hover:text-white hover:border-primary border-slate-200 dark:border-slate-700 transition-colors shadow-none"
                        >
                          <span>{isBn ? 'প্রোফাইল' : 'Profile'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Emergency Blood Aid & Donor Network Section */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border border-rose-900/40 p-4 xs:p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 mb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                <Droplet className="w-3.5 h-3.5 fill-current text-rose-500 animate-pulse" />
                <span>{isBn ? 'লাইভ রক্তদান ও জরুরি সহায়তা' : 'School Blood Bank & Emergency Aid'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isBn ? 'জীবনের তরে সহমর্মিতা — প্রাক্তনদের রক্তদান নেটওয়ার্ক' : 'Saving Lives Together — Alumni Blood Donation Network'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isBn
                  ? 'জরুরি প্রয়োজনে রক্তদাতা খুঁজুন অথবা রক্তের আবেদন পোস্ট করুন। আমাদের নিবন্ধিত প্রাক্তন রক্তদাতাদের সাথে তাত্ক্ষণিক যোগাযোগ করুন।'
                  : 'Find verified volunteer blood donors among school alumni or post an emergency request for your loved ones.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <Link href="/blood-requests/create" className="w-full sm:w-auto">
                <Button size="default" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-lg shadow-rose-600/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isBn ? 'জরুরি রক্তের আবেদন' : 'Post Blood Request'}</span>
                </Button>
              </Link>
              <Link href="/blood-donors" className="w-full sm:w-auto">
                <Button size="default" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white hover:text-white gap-2 shadow-sm">
                  <Droplet className="w-4 h-4 text-rose-400" />
                  <span>{isBn ? 'রক্তদাতা খুঁজুন' : 'Find Blood Donors'}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Emergency Requests List */}
          {data.activeBloodRequests && data.activeBloodRequests.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>{isBn ? 'চলমান জরুরি রক্তের আবেদন' : 'Active Emergency Requests'}</span>
                <Link href="/blood-requests" className="text-rose-400 hover:underline flex items-center gap-1">
                  <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.activeBloodRequests.map((req: any) => (
                  <div
                    key={req._id.toString()}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-lg">
                        {req.bloodGroup}
                      </div>
                      <Badge
                        variant={req.urgency === 'Emergency' ? 'destructive' : req.urgency === 'Urgent' ? 'warning' : 'default'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {req.urgency}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {req.patientName} ({req.requiredUnits} {isBn ? 'ব্যাগ' : 'Units'})
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{req.hospitalName}, {req.hospitalLocation}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{formatDate(req.requiredDate, locale)}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <Link href={`/blood-requests/${req._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 hover:text-white">
                          {isBn ? 'বিস্তারিত দেখুন' : 'Details'}
                        </Button>
                      </Link>
                      <Link href={`/blood-requests/${req._id}?match=true`} className="flex-1">
                        <Button size="sm" className="w-full text-xs bg-rose-600 hover:bg-rose-700 text-white">
                          {isBn ? 'ম্যাচিং রক্তদাতা' : 'Find Donors'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
              <p>{isBn ? 'এই মুহূর্তে কোনো সক্রিয় রক্তের আবেদন নেই।' : 'No open blood requests at the moment.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events & Reunions */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
              <Calendar className="w-4 h-4" />
              <span>{isBn ? 'ইভেন্ট ও সম্মেলন' : 'Upcoming Gatherings'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isBn ? 'আসন্ন ইভেন্ট ও পুনর্মিলনী' : 'Events & Flagship Reunions'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'একসাথে কাটানো সোনালী দিনগুলো আবারও উদযাপনের সুযোগ'
                : 'Reconnect with classmates and attend exclusive webinars & networking galas.'}
            </p>
          </div>

          <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
            <span>{isBn ? 'সকল ইভেন্ট দেখুন' : 'Explore All Events'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.upcomingEvents.map((event: any) => {
            const title = isBn ? event.title_bn : event.title_en;
            const desc = isBn ? event.description_bn : event.description_en;
            return (
              <Card key={event._id.toString()} className="group hover:-translate-y-1 transition-all duration-200 overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col">
                {event.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={event.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-slate-900/80 text-white backdrop-blur-md border-0 text-xs">
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

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{event.location}</span>
                    </div>

                    <Link href={`/events/${event._id}`}>
                      <Button size="sm" variant="default" className="text-xs">
                        {isBn ? 'RSVP / বিস্তারিত' : 'RSVP / Details'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Giving Back & Endowments Banner */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 border border-slate-800 p-5 xs:p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>{isBn ? 'তহবিল ও অনুদান (Giving Back)' : 'Giving Back & Endowments'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {isBn
                ? 'আপনার উপহার বদলে দিতে পারে অসংখ্য শিক্ষার্থীর ভবিষ্যৎ'
                : 'Your Generosity Transforms Tomorrow’s Leaders'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {isBn
                ? 'অসচ্ছল ও মেধাবী শিক্ষার্থীদের শিক্ষাবৃত্তি, আধুনিক গবেষণাগার নির্মাণ এবং ক্যাম্পাসের অবকাঠামো উন্নয়নে অংশ নিন। সরাসরি বিকাশ, নগদ, ভিসা বা ব্যাংক ট্রান্সফারের মাধ্যমে নিরাপদে দান করুন।'
                : 'Directly fund undergraduate tuition scholarships, state-of-the-art tech labs, and emergency student medical aid. Fully secured via SSLCommerz and Direct Bank Deposit.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
              {data.donationCampaigns.map((camp, idx) => (
                <div
                  key={idx}
                  className="p-4 xs:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3"
                >
                  <h4 className="font-bold text-base text-amber-300">
                    {isBn ? camp.title_bn : camp.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {isBn ? camp.desc_bn : camp.desc}
                  </p>
                  <DonationProgress raised={camp.raised} goal={camp.goal} />
                </div>
              ))}
            </div>

            <div className="pt-3 sm:pt-4 flex flex-wrap gap-2.5 sm:gap-3">
              <Link href="/donate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-sm sm:text-base">
                  {isBn ? 'অনলাইনে অনুদান দিন (SSLCommerz)' : 'Donate Online (SSLCommerz)'}
                </Button>
              </Link>
              <Link href="/donate/bank-transfer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-600 bg-slate-800/60 text-white hover:bg-white/10 hover:text-white text-sm sm:text-base">
                  {isBn ? 'সরাসরি ব্যাংক ডিপোজিট' : 'Direct Bank Deposit'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Stories */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{isBn ? 'সংবাদ ও অর্জন' : 'News & Achievements'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isBn ? 'সর্বশেষ সংবাদ ও সমসাময়িক আপডেট' : 'Latest News & Stories'}
            </h2>
          </div>

          <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
            <span>{isBn ? 'সব সংবাদ পড়ুন' : 'View All Stories'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.latestNews.map((news: any) => {
            const title = isBn ? news.title_bn : news.title_en;
            const summary = isBn ? news.summary_bn : news.summary_en;
            return (
              <Card key={news._id.toString()} className="group hover:-translate-y-1 transition-all duration-200 overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col">
                {news.image && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={news.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary/90 text-white text-xs">
                        {news.category}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      {formatDate(news.publishedAt, locale)}
                    </p>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  <Link href={`/news/${news.slug}`} className="pt-2 block">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      {isBn ? 'সম্পূর্ণ পড়ুন' : 'Read Full Story'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary text-white p-6 xs:p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isBn ? 'আপনি কি আমাদের প্রাক্তন শিক্ষার্থী?' : 'Are You an Alumnus?'}
            </h2>
            <p className="text-sm sm:text-base text-primary-100 leading-relaxed">
              {isBn
                ? 'আজই আমাদের অ্যাসোসিয়েশনে যোগ দিন। আপনার প্রোফাইল তৈরি করুন, সহপাঠীদের খুঁজুন এবং আগামী প্রজন্মের অনুপ্রেরণা হোন।'
                : 'Join our vibrant alumni ecosystem. Claim your verified profile, connect with batchmates, and unlock exclusive alumni network privileges.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary font-bold hover:bg-slate-100 shadow-md">
                  {isBn ? 'এখনই বিনামূল্যে নিবন্ধন করুন' : 'Register for Free'}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  {isBn ? 'ইতিমধ্যে সদস্য? প্রবেশ করুন' : 'Already a Member? Sign In'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
