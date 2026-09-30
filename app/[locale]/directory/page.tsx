"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { toBengaliNumerals } from "@/lib/utils";
import {
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  MapPin,
  GraduationCap,
  Droplet,
  X,
  ExternalLink,
  HeartHandshake,
  Mail,
  Phone,
  Sparkles,
  Layers,
  Award,
  Atom,
  Coins,
  Palette,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  FacebookIcon,
  LinkedInIcon,
  InstagramIcon,
  WhatsAppIcon,
  formatWhatsAppUrl,
} from "@/components/shared/SocialIcons";
import { ALUMNI_GROUPS, BLOOD_GROUPS } from "@/lib/types";
import { DirectoryUserActions } from "@/components/requests/DirectoryUserActions";

export default function DirectoryPage() {
  const t = useTranslations("directory");
  const common = useTranslations("common");
  const locale = useLocale();
  const isBn = locale === "bn";
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchYear, setBatchYear] = useState("all");
  const [group, setGroup] = useState(searchParams.get("group") || "all");
  const [bloodGroup, setBloodGroup] = useState(
    searchParams.get("bloodGroup") || "all",
  );
  const [bloodDonor, setBloodDonor] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [batchesList, setBatchesList] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "24",
        q: search,
        batchYear,
        group,
        bloodGroup,
        bloodDonor,
        sortBy: sortOrder,
      });

      const res = await fetch(`/api/alumni?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProfiles(data.profiles || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        if (data.filters?.batches) {
          setBatchesList(data.filters.batches || []);
        }
      }
    } catch (e) {
      console.error("Error loading alumni directory:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [page, batchYear, group, bloodGroup, bloodDonor, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAlumni();
  };

  const handleClearFilters = () => {
    setSearch("");
    setBatchYear("all");
    setGroup("all");
    setBloodGroup("all");
    setBloodDonor("all");
    setSortOrder("desc");
    setPage(1);
  };

  const isFiltered =
    Boolean(search.trim()) ||
    batchYear !== "all" ||
    group !== "all" ||
    bloodGroup !== "all" ||
    bloodDonor !== "all" ||
    sortOrder !== "desc";

  // Group profiles batch-wise
  const groupedProfiles = useMemo(() => {
    const groups: { [key: string]: typeof profiles } = {};

    profiles.forEach((profile) => {
      const key = profile.batchYear ? String(profile.batchYear) : "unassigned";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(profile);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "unassigned") return 1;
      if (b === "unassigned") return -1;
      const numA = Number(a);
      const numB = Number(b);
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });

    return sortedKeys.map((key) => ({
      key,
      batchYear: key === "unassigned" ? null : Number(key),
      members: groups[key],
    }));
  }, [profiles, sortOrder]);

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-5 xs:p-8 sm:p-12 text-white shadow-xl border border-slate-800">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.18] sm:leading-[1.15]">
            {isBn
              ? "অ্যালামনাই ডিরেক্টরি ও গ্র্যাজুয়েট নেটওয়ার্ক"
              : "Alumni Directory & Network"}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {isBn
              ? "বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখার সকল ব্যাচের প্রাক্তন শিক্ষার্থীদের খুঁজুন, পেশাগত নেটওয়ার্কিং করুন এবং পারস্পরিক বন্ধন সুদৃঢ় রাখুন।"
              : "Discover and connect with school alumni across Science, Commerce, and Humanities streams, graduating batches, and emergency blood groups worldwide."}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <div className="px-3 py-1.5 xs:px-3.5 xs:py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-300" />
              <span>
                {isBn
                  ? `মোট নিবন্ধিত প্রাক্তন: ${toBengaliNumerals(totalCount)} জন`
                  : `Total Alumni: ${totalCount} Members`}
              </span>
            </div>
            <div className="px-3 py-1.5 xs:px-3.5 xs:py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? `অধিভুক্ত ব্যাচ: ${toBengaliNumerals(batchesList.length || 30)}+ টি`
                  : `Batches: ${batchesList.length || 30}+ Graduating Classes`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Stream Quick-Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setGroup("all");
            setPage(1);
          }}
          className={`px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            group === "all"
              ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            {isBn ? "সকল শাখা (All Streams)" : "All Academic Streams"}
          </span>
        </button>

        <button
          onClick={() => {
            setGroup("Science");
            setPage(1);
          }}
          className={`px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            group === "Science"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>{isBn ? "বিজ্ঞান বিভাগ (Science)" : "Science Stream"}</span>
        </button>

        <button
          onClick={() => {
            setGroup("Commerce");
            setPage(1);
          }}
          className={`px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            group === "Commerce"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{isBn ? "ব্যবসায় শিক্ষা (Commerce)" : "Commerce Stream"}</span>
        </button>

        <button
          onClick={() => {
            setGroup("Humanities");
            setPage(1);
          }}
          className={`px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            group === "Humanities"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>
            {isBn ? "মানবিক বিভাগ (Humanities)" : "Humanities Stream"}
          </span>
        </button>
      </div>

      {/* Flat Filter & Live Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3.5 xs:p-5 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Live Search Input */}
            <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder={
                  isBn
                    ? "নাম, পদবী, প্রতিষ্ঠান বা অবস্থান..."
                    : "Search by name, profession, company..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9.5 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-10 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Batch Filter */}
            <select
              aria-label="Filter by Batch Year"
              value={batchYear}
              onChange={(e) => {
                setBatchYear(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <option value="all">{t("allBatches")}</option>
              {batchesList.map((year) => (
                <option key={year} value={year}>
                  {isBn ? `ব্যাচ ${toBengaliNumerals(year)}` : `Batch ${year}`}
                </option>
              ))}
            </select>

            {/* Blood Group Filter */}
            <select
              aria-label="Filter by Blood Group"
              value={bloodGroup}
              onChange={(e) => {
                setBloodGroup(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <option value="all">
                {isBn ? "সকল রক্তের গ্রুপ" : "All Blood Groups"}
              </option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg} Blood
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              aria-label="Sort by Batch Order"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "desc" | "asc");
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <option value="desc">
                {isBn ? "সর্ট: DESC (নতুন ব্যাচ)" : "Sort: DESC (Newest)"}
              </option>
              <option value="asc">
                {isBn ? "সর্ট: ASC (পুরনো ব্যাচ)" : "Sort: ASC (Oldest)"}
              </option>
            </select>
          </div>

          {/* Secondary Filter Row: Blood Donors & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-500">
                {isBn ? "রক্তদান স্থিতি:" : "Blood Bank:"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setBloodDonor("all");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  bloodDonor === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {isBn ? "সকল" : "All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBloodDonor("donor");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  bloodDonor === "donor"
                    ? "bg-rose-600 text-white font-bold shadow-xs shadow-rose-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                }`}
              >
                <Droplet className="w-3 h-3 fill-current text-rose-300" />
                <span>{isBn ? "রক্তদাতা" : "Blood Donors"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBloodDonor("available");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  bloodDonor === "available"
                    ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isBn ? "প্রস্তুত রক্তদাতা" : "Available Donors"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-1.5 text-xs text-slate-500 hover:text-rose-600 rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? "ফিল্টার মুছুন" : "Clear Filters"}</span>
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 rounded-xl text-xs bg-primary text-white font-bold shadow-sm shadow-primary/20"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isBn ? "অনুসন্ধান" : "Search"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Count Feedback */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <div>
          <span>
            {isBn ? `${toBengaliNumerals(totalCount)} ` : `${totalCount} `}
          </span>
          <span>{t("resultsFound")}</span>
        </div>
      </div>

      {/* Alumni Batch-Wise Grouping */}
      {loading ? (
        <div className="space-y-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-6 w-36 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800 p-6"
              />
            ))}
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {t("noResults")}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isBn
              ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সদস্য পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।"
              : "No alumni found matching your search criteria. Try adjusting keywords or filters."}
          </p>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="rounded-xl text-xs"
          >
            {isBn ? "সকল সদস্য দেখুন" : "Show All Alumni"}
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedProfiles.map(
            ({ key, batchYear: groupBatchYear, members }) => (
              <section key={key} className="space-y-6">
                {/* Modern Flat Batch Section Header */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary dark:bg-primary-950/60 dark:text-primary-400 flex items-center justify-center font-bold border border-primary-200/60 dark:border-primary-800/60 shadow-xs shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {groupBatchYear
                          ? isBn
                            ? `ব্যাচ ${toBengaliNumerals(groupBatchYear)}`
                            : `Batch ${groupBatchYear}`
                          : isBn
                            ? "অন্যান্য ব্যাচ"
                            : "Other Batches"}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60">
                        {isBn
                          ? `${toBengaliNumerals(members.length)} জন`
                          : `${members.length} ${members.length === 1 ? "Alumnus" : "Alumni"}`}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>{isBn ? "ব্যাচভিত্তিক তালিকা" : "BATCH GROUP"}</span>
                  </div>
                </div>

                {/* Members Grid for this Batch — Matches Committee Card Design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {members.map((profile) => {
                    const user = profile.userId || ({} as any);
                    const displayName = user.name || "Alumni Member";
                    const blood = profile.bloodGroup || user.bloodGroup;
                    const displayGroup = profile.group
                      ? isBn
                        ? groupLabelBn[profile.group] || profile.group
                        : profile.group
                      : null;
                    const whatsappLink = profile.whatsapp
                      ? formatWhatsAppUrl(profile.whatsapp)
                      : null;

                    return (
                      <Card
                        key={profile._id}
                        className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          {/* Member Head Info */}
                          <div className="space-y-3.5">
                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                <Avatar
                                  src={user.image}
                                  alt={displayName}
                                  fallback={displayName}
                                  size="lg"
                                  className="w-14 h-14 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm object-cover"
                                />
                                {user.isVerified && (
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

                              {/* Name, Designation Badge & Verified Status */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <Link
                                  href={`/directory/${profile._id}`}
                                  className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate"
                                >
                                  {displayName}
                                </Link>

                                {profile.committeePost && (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 text-[10px] font-bold truncate">
                                    <Award className="w-3 h-3 shrink-0 text-amber-500" />
                                    <span className="truncate">
                                      {isBn
                                        ? profile.committeePost.name_bn ||
                                          profile.committeePost.name_en
                                        : profile.committeePost.name_en ||
                                          profile.committeePost.name_bn}
                                    </span>
                                  </div>
                                )}

                                {user.isVerified && !profile.committeePost && (
                                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>
                                      {isBn
                                        ? "যাচাইকৃত সদস্য"
                                        : "Verified Member"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Batch, Academic Group & Blood Group Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {profile.batchYear && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                                  <GraduationCap className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {isBn
                                      ? `ব্যাচ ${toBengaliNumerals(profile.batchYear)}`
                                      : `Batch '${profile.batchYear}`}
                                  </span>
                                </span>
                              )}

                              {displayGroup && (
                                <span
                                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                                    groupColors[profile.group] ||
                                    "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {displayGroup}
                                </span>
                              )}

                              {blood && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 text-[10px] font-extrabold">
                                  <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" />
                                  <span>{blood}</span>
                                </span>
                              )}
                            </div>

                            {/* Professional Details */}
                            {(profile.jobTitle || profile.company) && (
                              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed">
                                  {profile.jobTitle}
                                  {profile.jobTitle && profile.company
                                    ? ` at ${profile.company}`
                                    : profile.company}
                                </span>
                              </div>
                            )}

                            {profile.location && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {profile.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Footer (Flat Socials + View Profile) */}
                          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            {/* Social Icons */}
                            <div className="flex items-center gap-1.5">
                              {profile.linkedin && (
                                <a
                                  href={profile.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors"
                                  title="LinkedIn"
                                >
                                  <LinkedInIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {profile.facebook && (
                                <a
                                  href={profile.facebook}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center transition-colors"
                                  title="Facebook"
                                >
                                  <FacebookIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {whatsappLink && (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-center transition-colors"
                                  title="WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {user.email && (
                                <a
                                  href={`mailto:${user.email}`}
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center justify-center transition-colors"
                                  title={user.email}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Actions (Socials + Direct Request / Block + Profile) */}
                            <div className="flex items-center gap-2">
                              <DirectoryUserActions targetUser={profile} variant="card" />

                              {/* View Profile Button */}
                              <Link href={`/directory/${profile._id}`}>
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {/* Modern Flat Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setPage(page - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
          >
            {isBn ? "পূর্ববর্তী" : "Previous"}
          </Button>
          <span className="text-xs font-bold px-4 text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            {isBn
              ? `পৃষ্ঠা ${toBengaliNumerals(page)} / ${toBengaliNumerals(totalPages)}`
              : `Page ${page} of ${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setPage(page + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
          >
            {isBn ? "পরবর্তী" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
