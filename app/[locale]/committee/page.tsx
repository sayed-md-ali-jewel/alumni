"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { toBengaliNumerals } from "@/lib/utils";
import {
  Award,
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  MapPin,
  GraduationCap,
  Droplet,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Crown,
  X,
  UserCheck,
  Building2,
  Filter,
} from "lucide-react";
import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
  formatWhatsAppUrl,
} from "@/components/shared/SocialIcons";

interface CommitteeSection {
  _id: string;
  name_en: string;
  name_bn: string;
  description_en?: string;
  description_bn?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  memberCount: number;
  members: Array<{
    _id: string;
    batchYear: number;
    group: string;
    bloodGroup?: string;
    company?: string;
    jobTitle?: string;
    location?: string;
    bio?: string;
    linkedin?: string;
    facebook?: string;
    whatsapp?: string;
    phone?: string;
    committeeRoleTitle?: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      image?: string;
      isVerified?: boolean;
      bloodGroup?: string;
      phone?: string;
    };
  }>;
}

export default function CommitteePage() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const common = useTranslations("common");

  const [sections, setSections] = useState<CommitteeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchCommittee = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/committee");
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch (e) {
      console.error("Error fetching committee:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittee();
  }, []);

  const groupLabelBn: Record<string, string> = {
    Science: "বিজ্ঞান",
    Commerce: "ব্যবসায় শিক্ষা",
    Humanities: "মানবিক",
  };

  const groupColors: Record<string, string> = {
    Science:
      "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
    Commerce:
      "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
    Humanities:
      "bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60",
  };

  // Filter sections and members by search query and active post tab
  const filteredSections = useMemo(() => {
    return sections
      .filter((sec) => activeTab === "all" || sec._id === activeTab)
      .map((sec) => {
        if (!searchQuery.trim()) return sec;
        const q = searchQuery.toLowerCase().trim();
        const filteredMembers = sec.members.filter((m) => {
          const name = m.userId?.name?.toLowerCase() || "";
          const email = m.userId?.email?.toLowerCase() || "";
          const company = m.company?.toLowerCase() || "";
          const jobTitle = m.jobTitle?.toLowerCase() || "";
          const location = m.location?.toLowerCase() || "";
          const roleTitle = m.committeeRoleTitle?.toLowerCase() || "";
          const batch = m.batchYear?.toString() || "";
          const postName = (isBn ? sec.name_bn : sec.name_en).toLowerCase();
          return (
            name.includes(q) ||
            email.includes(q) ||
            company.includes(q) ||
            jobTitle.includes(q) ||
            location.includes(q) ||
            roleTitle.includes(q) ||
            batch.includes(q) ||
            postName.includes(q)
          );
        });
        return {
          ...sec,
          members: filteredMembers,
          memberCount: filteredMembers.length,
        };
      })
      .filter((sec) => sec.members.length > 0 || !searchQuery.trim());
  }, [sections, activeTab, searchQuery, isBn]);

  const totalMembersCount = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (sec.members?.length || 0), 0);
  }, [sections]);

  const currentResultCount = useMemo(() => {
    return filteredSections.reduce(
      (acc, sec) => acc + (sec.members?.length || 0),
      0,
    );
  }, [filteredSections]);

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-5 xs:p-8 sm:p-12 text-white shadow-xl border border-slate-800">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.18] sm:leading-[1.15]">
            {isBn ? "সম্মানিত পরিচালনা পরিষদ" : "Executive Committee"}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {isBn
              ? "আমাদের প্রিয় অ্যালামনাই অ্যাসোসিয়েশনের নেতৃত্ব, সার্বিক পরিচালনা ও উন্নয়নমূলক উদ্যোগ বাস্তবায়নে দায়িত্বরত সম্মানিত কার্যনির্বাহী সদস্যবৃন্দ।"
              : "The distinguished leaders and dedicated committee members guiding our alumni association, driving fellowship, community impact, and institutional legacy."}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <div className="px-3 py-1.5 xs:px-3.5 xs:py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-300" />
              <span>
                {isBn
                  ? `মোট কমিটি সদস্য: ${toBengaliNumerals(totalMembersCount)} জন`
                  : `Total Committee Members: ${totalMembersCount}`}
              </span>
            </div>
            <div className="px-3 py-1.5 xs:px-3.5 xs:py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? `কার্যনির্বাহী পদবী: ${toBengaliNumerals(sections.length)} টি`
                  : `Designation Portfolios: ${sections.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flat Sticky Filter & Live Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Designation Selection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isBn ? "সকল পদবী" : "All Designations"}{" "}
              <span className="opacity-80">
                (
                {isBn
                  ? toBengaliNumerals(totalMembersCount)
                  : totalMembersCount}
                )
              </span>
            </button>

            {sections.map((sec) => (
              <button
                key={sec._id}
                onClick={() => setActiveTab(sec._id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === sec._id
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {isBn ? sec.name_bn : sec.name_en}{" "}
                <span className="opacity-80">
                  ({isBn ? toBengaliNumerals(sec.memberCount) : sec.memberCount}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder={
                isBn
                  ? "নাম, পদবী, কোম্পানি বা ব্যাচ..."
                  : "Search by name, post, company or batch..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-10 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary feedback when filtering */}
        {searchQuery.trim() && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {isBn
                ? `অনুসন্ধানের ফলাফল: "${searchQuery}" — ${toBengaliNumerals(currentResultCount)} জন সদস্য পাওয়া গেছে`
                : `Search results for "${searchQuery}" — ${currentResultCount} committee members found`}
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary hover:underline font-semibold"
            >
              {isBn ? "রিসেট করুন" : "Clear Search"}
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-8 py-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 animate-pulse p-5"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSections.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isBn
              ? "কোনো কমিটি সদস্য পাওয়া যায়নি"
              : "No Committee Members Found"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isBn
              ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সদস্য পাওয়া যায়নি। সার্চ কিওয়ার্ড পরিবর্তন করুন।"
              : "No committee members matched your search criteria. Please try different keywords."}
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
            variant="outline"
            size="sm"
            className="text-xs rounded-xl"
          >
            {isBn ? "সকল সদস্য প্রদর্শন করুন" : "Show All Members"}
          </Button>
        </div>
      )}

      {/* Sections Grouped by Committee Post */}
      {!loading &&
        filteredSections.map((section) => {
          const postName = isBn ? section.name_bn : section.name_en;
          const postDesc = isBn
            ? section.description_bn
            : section.description_en;
          const isTopTier = section.sortOrder <= 2;

          return (
            <section key={section._id} className="space-y-5">
              {/* Clean Modern Designation Section Header (No harsh underline border) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isTopTier
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/20"
                    }`}
                  >
                    {isTopTier ? (
                      <Crown className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                        {postName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
                        {isBn
                          ? `${toBengaliNumerals(section.members.length)} জন`
                          : `${section.members.length} ${section.members.length === 1 ? "Member" : "Members"}`}
                      </span>
                    </div>
                    {postDesc && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {postDesc}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Members Grid for this Designation */}
              {section.members.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">
                    {isBn
                      ? "এই পদে বর্তমানে কোনো সদস্য বরাদ্দ নেই।"
                      : "No members currently assigned to this portfolio."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {section.members.map((member) => {
                    const u = member.userId || ({} as any);
                    const displayName = u.name || "Alumni Member";
                    const displayGroup = member.group
                      ? isBn
                        ? groupLabelBn[member.group] || member.group
                        : member.group
                      : null;

                    return (
                      /* Flat Modern Member Card — Pure Flat Layout with NO top border stripe */
                      <Card
                        key={member._id}
                        className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          {/* Member Head Info */}
                          <div className="space-y-3.5">
                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                <Avatar
                                  src={u.image}
                                  alt={displayName}
                                  fallback={displayName}
                                  size="lg"
                                  className="w-14 h-14 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm object-cover"
                                />
                                {u.isVerified && (
                                  <div
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm"
                                    title={
                                      isBn
                                        ? "যাচাইকৃত প্রাক্তন"
                                        : "Verified Alumni"
                                    }
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>

                              {/* Name, Designation Badge & Committee Role */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <Link
                                  href={`/directory/${member._id || u._id}`}
                                  className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate"
                                >
                                  {displayName}
                                </Link>

                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 text-[10px] font-bold truncate">
                                  <Award className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{postName}</span>
                                </div>

                                {member.committeeRoleTitle && (
                                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                    {member.committeeRoleTitle}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Batch, Academic Group & Blood Group Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {member.batchYear && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                                  <GraduationCap className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {isBn
                                      ? `ব্যাচ ${toBengaliNumerals(member.batchYear)}`
                                      : `Batch '${member.batchYear}`}
                                  </span>
                                </span>
                              )}

                              {displayGroup && (
                                <span
                                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                                    groupColors[member.group] ||
                                    "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {displayGroup}
                                </span>
                              )}

                              {u.bloodGroup && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 text-[10px] font-extrabold">
                                  <Droplet className="w-3 h-3" />
                                  <span>{u.bloodGroup}</span>
                                </span>
                              )}
                            </div>

                            {/* Professional Details */}
                            {(member.jobTitle || member.company) && (
                              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed">
                                  {member.jobTitle}
                                  {member.jobTitle && member.company
                                    ? ` at ${member.company}`
                                    : member.company}
                                </span>
                              </div>
                            )}

                            {member.location && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {member.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Footer (Flat Socials + View Profile) */}
                          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            {/* Social Icons */}
                            <div className="flex items-center gap-1.5">
                              {member.linkedin && (
                                <a
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors"
                                  title="LinkedIn"
                                >
                                  <LinkedInIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {member.facebook && (
                                <a
                                  href={member.facebook}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors"
                                  title="Facebook"
                                >
                                  <FacebookIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {member.whatsapp && (
                                <a
                                  href={formatWhatsAppUrl(member.whatsapp)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-center transition-colors"
                                  title="WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* View Profile Button */}
                            <Link href={`/directory/${member._id || u._id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs rounded-xl px-3 gap-1.5 font-semibold hover:bg-primary hover:text-white hover:border-primary border-slate-200 dark:border-slate-700 transition-colors shadow-none"
                              >
                                <span>{isBn ? "প্রোফাইল" : "Profile"}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}
