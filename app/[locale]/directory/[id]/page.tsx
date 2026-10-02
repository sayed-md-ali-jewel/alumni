import React from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { toBengaliNumerals } from '@/lib/utils';
import {
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Droplet,
  HeartHandshake,
  Clock,
  ExternalLink,
  MessageCircle,
  Award,
} from 'lucide-react';
import { User } from '@/models/User';
import { CommitteePost } from '@/models/CommitteePost';
import mongoose from 'mongoose';
import {
  FacebookIcon,
  LinkedInIcon,
  InstagramIcon,
  WhatsAppIcon,
  formatWhatsAppUrl,
} from '@/components/shared/SocialIcons';
import { DirectoryUserActions } from '@/components/requests/DirectoryUserActions';
import { ProfileAvatarWithPreview } from '@/components/shared/ProfileAvatarWithPreview';

async function getProfile(id: string) {
  try {
    await connectToDatabase();
    if (!mongoose.models.User) void User;
    if (!mongoose.models.CommitteePost) void CommitteePost;

    let profile = await AlumniProfile.findById(id)
      .populate('userId', 'name email image isVerified role phone bloodGroup')
      .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault')
      .lean();

    if (!profile && mongoose.Types.ObjectId.isValid(id)) {
      profile = await AlumniProfile.findOne({ userId: id })
        .populate('userId', 'name email image isVerified role phone bloodGroup')
        .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault')
        .lean();
    }

    return profile ? JSON.parse(JSON.stringify(profile)) : null;
  } catch (e) {
    return null;
  }
}

export default async function AlumniProfileDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const profile = await getProfile(id);
  if (!profile) {
    notFound();
  }

  const user = profile.userId as any;
  const isBn = locale === 'bn';
  const blood = profile.bloodGroup || user?.bloodGroup;

  const groupLabelBn: Record<string, string> = {
    Science: 'বিজ্ঞান',
    Commerce: 'ব্যবসায় শিক্ষা',
    Humanities: 'মানবিক',
  };

  const groupColors: Record<string, string> = {
    Science: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Commerce: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Humanities: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-5xl space-y-8">
      {/* Back button */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'ডিরেক্টরিতে ফিরে যান' : 'Back to Directory'}</span>
      </Link>

      {/* Main Profile Header Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden rounded-3xl">
        {/* Banner */}
        <div className="h-28 xs:h-32 sm:h-44 w-full bg-gradient-to-r from-primary-900 via-primary-700 to-amber-600 relative" />

        <CardContent className="px-4 xs:px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar and Badges */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 xs:-mt-16 sm:-mt-20 gap-4 mb-6">
            <div className="relative">
              <ProfileAvatarWithPreview
                src={user?.image}
                name={user?.name || 'AL'}
                batch={profile.batchYear}
                group={profile.group}
                bloodGroup={blood}
                jobTitle={profile.jobTitle}
                company={profile.company}
                isVerified={user?.isVerified}
                committeePostName={
                  profile.committeePost
                    ? isBn
                      ? (profile.committeePost as any).name_bn || (profile.committeePost as any).name_en
                      : (profile.committeePost as any).name_en || (profile.committeePost as any).name_bn
                    : undefined
                }
                location={profile.location}
                locale={locale}
                size="xl"
                avatarClassName="w-24 h-24 xs:w-28 xs:h-28 sm:w-36 sm:h-36 ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {blood && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-sm shadow-rose-600/20">
                  <Droplet className="w-3.5 h-3.5 fill-current text-rose-100" />
                  <span>{isBn ? `রক্তের গ্রুপ: ${blood}` : `Blood: ${blood}`}</span>
                </div>
              )}

              {profile.committeePost && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50 text-xs font-bold shadow-xs">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {isBn
                      ? (profile.committeePost as any).name_bn || (profile.committeePost as any).name_en
                      : (profile.committeePost as any).name_en || (profile.committeePost as any).name_bn}
                  </span>
                </div>
              )}

              {user?.isVerified ? (
                <Badge variant="success" className="px-3 py-1 gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'যাচাইকৃত প্রাক্তন সদস্য' : 'Verified Alumni Member'}</span>
                </Badge>
              ) : (
                <Badge variant="warning" className="px-3 py-1 gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Verification Pending'}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {profile.jobTitle || (isBn ? 'প্রাক্তন শিক্ষার্থী' : 'Alumnus')}
              {profile.company && (
                <span className="text-primary font-bold"> @ {profile.company}</span>
              )}
            </p>
            {profile.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Academic Tag Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isBn ? 'পাসের সন / ব্যাচ' : 'Graduation Batch'}
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {isBn
                    ? `ব্যাচ ${toBengaliNumerals(profile.batchYear)}`
                    : `Batch ${profile.batchYear}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isBn ? 'গ্রুপ / শাখা' : 'Group'}
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? groupLabelBn[profile.group] || profile.group : profile.group}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biography & Blood Donation Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Bio & Skills */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 rounded-3xl">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isBn ? 'সংক্ষিপ্ত পরিচিতি ও বায়ো' : 'About & Biography'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.bio || (isBn ? 'কোনো বায়ো তথ্য যোগ করা হয়নি।' : 'No biography added yet.')}
              </p>
            </CardContent>
          </Card>

          {Array.isArray(profile.skills) && profile.skills.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 rounded-3xl">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isBn ? 'দক্ষতাসমূহ ও বিশেষজ্ঞতা' : 'Skills & Expertise'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dedicated Blood Donation Section */}
          {profile.isBloodDonor && profile.bloodDonationConsent && (
            <Card className="border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-rose-100 dark:border-rose-900/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {isBn ? 'রক্তদান স্থিতি ও অঙ্গীকার' : 'Blood Donation Profile'}
                      </h3>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        {isBn ? 'স্বেচ্ছাসেবী রক্তদাতা হিসেবে তালিকাভুক্ত' : 'Registered Volunteer Blood Donor'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      profile.donationStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {profile.donationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {blood}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {isBn ? 'রক্তদানের অবস্থান' : 'Donor Location'}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {profile.donorLocation || profile.location || 'Bangladesh'}
                    </span>
                  </div>
                </div>

                {profile.donorNotes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    &ldquo;{profile.donorNotes}&rdquo;
                  </p>
                )}

                <Link href={`/blood-donors`} className="block pt-1">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{isBn ? 'রক্তের অনুরোধ জানাতে ডিরেক্টরি ব্যবহার করুন' : 'Contact for Blood Donation'}</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact info & Social Media Sidebar */}
        {(() => {
          const userPhone = user?.phone || profile.phone;
          const contactPrivacy = profile.contactPrivacy || {};

          const isEmailPublic = Boolean(user?.email && contactPrivacy.email !== 'private');
          const isPhonePublic = Boolean(userPhone && contactPrivacy.phone !== 'private');
          const isWhatsAppPublic = Boolean(profile.whatsapp && contactPrivacy.whatsapp !== 'private');
          const isFacebookPublic = Boolean(profile.facebook && contactPrivacy.facebook !== 'private');
          const isLinkedInPublic = Boolean(profile.linkedin && contactPrivacy.linkedin !== 'private');
          const isInstagramPublic = Boolean(profile.instagram && contactPrivacy.instagram !== 'private');

          const hasAnyPublicContact = Boolean(
            isEmailPublic ||
            isPhonePublic ||
            isWhatsAppPublic ||
            isFacebookPublic ||
            isLinkedInPublic ||
            isInstagramPublic
          );

          return (
            <div className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <span>{isBn ? 'যোগাযোগের তথ্য' : 'Contact Information'}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      hasAnyPublicContact
                        ? 'text-primary bg-primary/10'
                        : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {hasAnyPublicContact
                        ? (isBn ? 'সক্রিয়' : 'Available')
                        : (isBn ? 'গোপনীয়' : 'Private')}
                    </span>
                  </h3>

                  {hasAnyPublicContact ? (
                    <div className="space-y-2.5 text-xs">
                      {/* Email */}
                      {isEmailPublic && (
                        <a
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          title={user.email}
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {isBn ? 'ইমেইল' : 'Email'}
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {user.email}
                            </p>
                          </div>
                        </a>
                      )}

                      {/* Phone */}
                      {isPhonePublic && (
                        <a
                          href={`tel:${userPhone}`}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          title={userPhone}
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {isBn ? 'ফোন নম্বর' : 'Phone'}
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {userPhone}
                            </p>
                          </div>
                        </a>
                      )}

                      {/* WhatsApp */}
                      {isWhatsAppPublic && (
                        <a
                          href={formatWhatsAppUrl(
                            profile.whatsapp,
                            isBn
                              ? `হ্যালো ${user?.name || ''}, আমি স্কুল অ্যালামনাই প্ল্যাটফর্ম থেকে যোগাযোগ করছি।`
                              : `Hello ${user?.name || ''}, reaching out from the Alumni Network.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#25D366]/10 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-[#25D366]/30"
                          title={profile.whatsapp}
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <WhatsAppIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              WhatsApp
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {profile.whatsapp}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {/* Facebook */}
                      {isFacebookPublic && (
                        <a
                          href={profile.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#1877F2]/10 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-[#1877F2]/30"
                          title="Facebook Profile"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#1877F2]/15 text-[#1877F2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <FacebookIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-[#1877F2] uppercase tracking-wider">
                              Facebook
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {isBn ? 'ফেসবুক প্রোফাইল' : 'Facebook Profile'}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {/* LinkedIn */}
                      {isLinkedInPublic && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#0A66C2]/10 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-[#0A66C2]/30"
                          title="LinkedIn Profile"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <LinkedInIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-[#0A66C2] uppercase tracking-wider">
                              LinkedIn
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {isBn ? 'লিঙ্কডইন প্রোফাইল' : 'LinkedIn Profile'}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {/* Instagram */}
                      {isInstagramPublic && (
                        <a
                          href={profile.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#E4405F]/10 text-slate-700 dark:text-slate-200 transition-all group border border-transparent hover:border-[#E4405F]/30"
                          title="Instagram Profile"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#E4405F]/15 text-[#E4405F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <InstagramIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-[#E4405F] uppercase tracking-wider">
                              Instagram
                            </p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {isBn ? 'ইনস্টাগ্রাম প্রোফাইল' : 'Instagram Profile'}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {isBn
                          ? '🔒 যোগাযোগের তথ্য ব্যক্তিগত রাখা হয়েছে।'
                          : '🔒 Contact details are kept private.'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {isBn
                          ? 'সরাসরি যোগাযোগ করতে নিচের বাটন ব্যবহার করে বার্তা পাঠান।'
                          : 'You can send a secure message directly using the button below.'}
                      </p>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <DirectoryUserActions targetUser={profile} />

                    {isWhatsAppPublic && (
                      <a
                        href={formatWhatsAppUrl(
                          profile.whatsapp,
                          isBn
                            ? `হ্যালো ${user?.name || ''}, আমি স্কুল অ্যালামনাই প্ল্যাটফর্ম থেকে যোগাযোগ করছি।`
                            : `Hello ${user?.name || ''}, reaching out from the Alumni Network.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button
                          size="sm"
                          className="w-full gap-2 text-xs rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
                        >
                          <WhatsAppIcon size={15} />
                          <span>{isBn ? 'WhatsApp-এ বার্তা পাঠান' : 'Chat on WhatsApp'}</span>
                        </Button>
                      </a>
                    )}

                    {isEmailPublic && (
                      <a href={`mailto:${user.email}`} className="block w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2 text-xs rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isBn ? 'ইমেইল বার্তা পাঠান' : 'Send Message'}</span>
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
