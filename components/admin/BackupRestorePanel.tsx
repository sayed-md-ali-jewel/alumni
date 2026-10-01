'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import {
  Download,
  Upload,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Layers,
  Users,
  Calendar,
  Newspaper,
  HeartHandshake,
  Droplet,
  Sliders,
  Settings,
  ShieldAlert,
  Loader2,
  Info,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HardDriveDownload,
  HardDriveUpload,
  FileCheck2,
} from 'lucide-react';

interface CollectionMeta {
  key: string;
  label_bn: string;
  label_en: string;
  icon: React.ElementType;
  category: 'users' | 'content' | 'charity' | 'system';
}

const COLLECTIONS: CollectionMeta[] = [
  { key: 'users', label_bn: 'ইউজার অ্যাকাউন্ট', label_en: 'User Accounts', icon: Users, category: 'users' },
  { key: 'alumniProfiles', label_bn: 'অ্যালামনাই প্রোফাইল', label_en: 'Alumni Profiles', icon: Users, category: 'users' },
  { key: 'news', label_bn: 'সংবাদ ও বুলেটিন', label_en: 'News & Stories', icon: Newspaper, category: 'content' },
  { key: 'events', label_bn: 'ইভেন্ট ও রিইউনিয়ন', label_en: 'Events & Reunions', icon: Calendar, category: 'content' },
  { key: 'jobPosts', label_bn: 'চাকরি ও ক্যারিয়ার', label_en: 'Job Board Posts', icon: Calendar, category: 'content' },
  { key: 'committee', label_bn: 'কমিটি ও পদবী', label_en: 'Committee Members', icon: Users, category: 'content' },
  { key: 'sliders', label_bn: 'হোমপেজ স্লাইডার', label_en: 'Homepage Sliders', icon: Sliders, category: 'content' },
  { key: 'donations', label_bn: 'অনলাইন অনুদান', label_en: 'Online Donations', icon: HeartHandshake, category: 'charity' },
  { key: 'bankTransfers', label_bn: 'ব্যাংক ট্রান্সফার রিকোয়েস্ট', label_en: 'Bank Transfer Requests', icon: HeartHandshake, category: 'charity' },
  { key: 'campaigns', label_bn: 'তহবিল ও ক্যাম্পেইন', label_en: 'Fundraising Campaigns', icon: HeartHandshake, category: 'charity' },
  { key: 'bloodRequests', label_bn: 'রক্তের আবেদন', label_en: 'Blood Requests', icon: Droplet, category: 'charity' },
  { key: 'bloodDonations', label_bn: 'রক্তদান রেকর্ড', label_en: 'Blood Donations', icon: Droplet, category: 'charity' },
  { key: 'siteSettings', label_bn: 'সাইট ও ব্র্যান্ডিং সেটিংস', label_en: 'Site & Brand Settings', icon: Settings, category: 'system' },
  { key: 'smtpSettings', label_bn: 'ইমেইল ও SMTP সেটিংস', label_en: 'SMTP Mail Config', icon: Settings, category: 'system' },
  { key: 'communitySettings', label_bn: 'কমিউনিটি সেটিংস', label_en: 'Community Settings', icon: Settings, category: 'system' },
  { key: 'discussions', label_bn: 'কমিউনিটি আলোচনা', label_en: 'Discussions & Posts', icon: Layers, category: 'content' },
  { key: 'userRequests', label_bn: 'বার্তা ও চ্যাট রিকোয়েস্ট', label_en: 'Direct Chat Requests', icon: Layers, category: 'users' },
  { key: 'notifications', label_bn: 'সিস্টেম নোটিফিকেশন', label_en: 'Notifications', icon: Layers, category: 'system' },
];

export function BackupRestorePanel() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const [dbStats, setDbStats] = useState<Record<string, number>>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Export State
  const [exporting, setExporting] = useState(false);
  const [selectedExportCollections, setSelectedExportCollections] = useState<string[]>(
    COLLECTIONS.map((c) => c.key)
  );

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [selectedImportCollections, setSelectedImportCollections] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch summary on load
  const fetchDbSummary = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/backup/export?summary=1');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data.stats || {});
        setTotalRecords(data.totalRecords || 0);
      }
    } catch (e) {
      console.error('Error fetching database stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDbSummary();
  }, []);

  // Handle Export
  const handleExport = async (all = true) => {
    setExporting(true);
    try {
      showToast({
        title: isBn ? 'ডাটাবেস ব্যাকআপ তৈরি হচ্ছে...' : 'Preparing Database Backup...',
        text: isBn ? 'সকল রেকর্ড সংগ্রহ করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।' : 'Aggregating records, please hold on.',
        type: 'info',
      });

      const res = await fetch('/api/admin/backup/export');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to export backup');
      }

      const blob = await res.blob();
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `alumni_backup_${dateStr}.json`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast({
        title: isBn ? 'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে' : 'Backup Downloaded Successfully',
        text: isBn ? `ফাইল: ${filename}` : `Saved file: ${filename}`,
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: isBn ? 'এক্সপোর্ট ব্যর্থ হয়েছে' : 'Export Failed',
        text: err?.message || 'Unable to download backup snapshot.',
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showAlert({
        title: isBn ? 'অবৈধ ফাইল ফরম্যাট' : 'Invalid File Type',
        text: isBn ? 'অনুগ্রহ করে একটি বৈধ .json ব্যাকআপ ফাইল আপলোড করুন।' : 'Please upload a valid .json backup file.',
        type: 'error',
      });
      return;
    }

    setImportFile(file);
    setImportReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.data || typeof json.data !== 'object') {
          throw new Error('Missing "data" field in JSON file.');
        }

        setParsedData(json);
        const keysInFile = Object.keys(json.data);
        setSelectedImportCollections(keysInFile);

        showToast({
          title: isBn ? 'ব্যাকআপ ফাইল লোড হয়েছে' : 'Backup File Loaded',
          text: isBn
            ? `${keysInFile.length}টি কালেকশন ও মোট ${json.totalRecords || 'একাধিক'} রেকর্ড সনাক্ত করা হয়েছে।`
            : `Detected ${keysInFile.length} collections with ${json.totalRecords || 'multiple'} records.`,
          type: 'info',
        });
      } catch (err: any) {
        showAlert({
          title: isBn ? 'ফাইল পার্সিং ব্যর্থ' : 'File Parse Error',
          text: isBn ? 'ফাইলটি সঠিক JSON ফরম্যাটে নেই বা ক্ষতিগ্রস্ত।' : 'File is corrupted or not in valid alumni backup format.',
          type: 'error',
        });
        setParsedData(null);
        setImportFile(null);
      }
    };
    reader.readAsText(file);
  };

  // Handle Import Execution
  const handleExecuteImport = () => {
    if (!parsedData || !parsedData.data) {
      showAlert({
        title: isBn ? 'কোনো ফাইল নির্বাচন করা হয়নি' : 'No File Selected',
        text: isBn ? 'অনুগ্রহ করে প্রথমে একটি ব্যাকআপ ফাইল আপলোড করুন।' : 'Please upload a backup file first.',
        type: 'error',
      });
      return;
    }

    if (selectedImportCollections.length === 0) {
      showAlert({
        title: isBn ? 'কালেকশন নির্বাচন করুন' : 'Select Collections',
        text: isBn ? 'কমপক্ষে একটি কালেকশন ইমপোর্ট করার জন্য টিক দিন।' : 'Please select at least one collection to restore.',
        type: 'warning',
      });
      return;
    }

    const isReplace = importMode === 'replace';

    showConfirm({
      title: isReplace
        ? (isBn ? 'সতর্কতা: ডাটাবেস প্রতিস্থাপন করবেন?' : 'WARNING: Overwrite Database?')
        : (isBn ? 'ডাটাবেস রিস্টোর নিশ্চিত করুন' : 'Confirm Data Import'),
      text: isReplace
        ? (isBn
            ? 'নির্বাচিত কালেকশনগুলোর বর্তমান সকল তথ্য মুছে ব্যাকআপ ফাইলের তথ্য দিয়ে প্রতিস্থাপন করা হবে। এই পদক্ষেপটি অপরিবর্তনীয়!'
            : 'All current records in selected collections will be WIPED OUT and replaced with the backup file. This cannot be undone!')
        : (isBn
            ? 'ব্যাকআপ ফাইলের তথ্য বিদ্যমান তথ্যের সাথে মার্জ (আপসার্ট) করা হবে। কোনো পূর্ববর্তী ডাটা মুছে যাবে না।'
            : 'Backup records will be merged with existing records without deleting existing items.'),
      confirmButtonText: isBn ? (isReplace ? 'হ্যাঁ, প্রতিস্থাপন করুন' : 'হ্যাঁ, ইমপোর্ট শুরু করুন') : (isReplace ? 'Yes, Overwrite & Restore' : 'Yes, Merge & Import'),
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      type: isReplace ? 'error' : 'warning',
      onConfirm: async () => {
        setImporting(true);
        try {
          // Filter data object to only selected collections
          const filteredData: Record<string, any[]> = {};
          for (const key of selectedImportCollections) {
            if (parsedData.data[key]) {
              filteredData[key] = parsedData.data[key];
            }
          }

          const res = await fetch('/api/admin/backup/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: filteredData,
              mode: importMode,
              collections: selectedImportCollections,
            }),
          });

          const result = await res.json();
          if (!res.ok) {
            throw new Error(result.error || 'Failed to import data');
          }

          setImportReport(result);
          fetchDbSummary();

          showAlert({
            title: isBn ? 'ইমপোর্ট সফল হয়েছে!' : 'Import Completed Successfully!',
            text: isBn
              ? `মোট ${result.totalProcessed}টি রেকর্ড ডাটাবেসে সফলভাবে রিস্টোর করা হয়েছে।`
              : `Successfully processed and restored ${result.totalProcessed} records to database.`,
            type: 'success',
          });
        } catch (err: any) {
          showAlert({
            title: isBn ? 'ইমপোর্ট ব্যর্থ হয়েছে' : 'Import Failed',
            text: err?.message || 'An error occurred during database restoration.',
            type: 'error',
          });
        } finally {
          setImporting(false);
        }
      },
    });
  };

  const toggleSelectAllExport = () => {
    if (selectedExportCollections.length === COLLECTIONS.length) {
      setSelectedExportCollections([]);
    } else {
      setSelectedExportCollections(COLLECTIONS.map((c) => c.key));
    }
  };

  const toggleSelectAllImport = () => {
    if (!parsedData?.data) return;
    const allKeys = Object.keys(parsedData.data);
    if (selectedImportCollections.length === allKeys.length) {
      setSelectedImportCollections([]);
    } else {
      setSelectedImportCollections(allKeys);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white border border-primary-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'ডাটাবেস সংরক্ষণাগার ও রিস্টোর' : 'Database Archive & Disaster Recovery'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isBn ? 'সম্পূর্ণ ডাটা এক্সপোর্ট ও ইমপোর্ট সেটিংস' : 'Full Data Export & Import Center'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isBn
              ? 'প্ল্যাটফর্মের সকল ইউজার, প্রোফাইল, রক্তদাতা, অনুদান, ইভেন্ট, সংবাদ, সেটিংস এবং চ্যাট মেসেজের পূর্ণাঙ্গ ব্যাকআপ ডাউনলোড করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন।'
              : 'Download complete JSON snapshots of all users, alumni profiles, blood donors, treasury donations, events, news, settings, and messages or restore them anytime.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={fetchDbSummary}
            disabled={loadingStats}
            className="border-slate-700 bg-slate-800/80 text-slate-200 text-xs gap-1.5 rounded-xl hover:bg-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ মেট্রিক্স' : 'Refresh Metrics'}</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleExport(true)}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-emerald-950/40"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDriveDownload className="w-3.5 h-3.5" />}
            <span>{exporting ? (isBn ? 'এক্সপোর্ট হচ্ছে...' : 'Exporting...') : (isBn ? 'সম্পূর্ণ ব্যাকআপ ডাউনলোড' : 'Download Full Backup')}</span>
          </Button>
        </div>
      </div>

      {/* Live Collection Inventory Stats */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{isBn ? 'ডাটাবেসের বর্তমান রেকর্ড পরিসংখ্যান' : 'Live Database Inventory & Record Counts'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'বর্তমান মঙ্গোডিবি ক্লাস্টারে মোট সংরক্ষিত তথ্যের সংক্ষিপ্ত বিবরণ'
                  : 'Breakdown of active entities across all system collections in MongoDB'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs text-primary font-bold border-primary/30 w-fit">
              {isBn ? `মোট রেকর্ড: ${totalRecords.toLocaleString()}` : `Total Records: ${totalRecords.toLocaleString()}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loadingStats ? (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-slate-400">{isBn ? 'পরিসংখ্যান লোড হচ্ছে...' : 'Loading collection statistics...'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {COLLECTIONS.map((c) => {
                const IconComponent = c.icon;
                const count = dbStats[c.key] ?? 0;
                return (
                  <div
                    key={c.key}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                        {isBn ? c.label_bn : c.label_en}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 truncate">{c.key}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Data Export */}
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDriveDownload className="w-5 h-5 text-emerald-500" />
              <span>{isBn ? 'ডাটা এক্সপোর্ট (Export Backup)' : 'Export Backup Archive'}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'ডাটাবেসের সম্পূর্ণ কপি একক নিরাপদ .json ফাইলে ডাউনলোড করে নিরাপদে সংরক্ষণ করুন।'
                : 'Extract complete collections into an offline portable JSON snapshot file.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isBn ? 'নিরাপদ ও নির্ভরযোগ্য' : 'Secure & Encapsulated'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {isBn
                    ? 'এক্সপোর্ট করা ব্যাকআপ ফাইলে সকল টেবিল, সম্পর্ক, সেটিংস এবং ছবিগুলোর লিঙ্ক অক্ষত থাকে।'
                    : 'The backup includes relational IDs, timestamps, administrative configs, and metadata.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{isBn ? 'এক্সপোর্ট অন্তর্ভুক্ত কালেকশনসমূহ' : 'Collections to Include'}</span>
                  <button
                    type="button"
                    onClick={toggleSelectAllExport}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {selectedExportCollections.length === COLLECTIONS.length
                      ? (isBn ? 'সব আনচেক করুন' : 'Deselect All')
                      : (isBn ? 'সব সিলেক্ট করুন' : 'Select All')}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                  {COLLECTIONS.map((c) => {
                    const isChecked = selectedExportCollections.includes(c.key);
                    const count = dbStats[c.key] ?? 0;
                    return (
                      <label
                        key={c.key}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExportCollections([...selectedExportCollections, c.key]);
                              } else {
                                setSelectedExportCollections(selectedExportCollections.filter((k) => k !== c.key));
                              }
                            }}
                            className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                          />
                          <span className="font-medium text-[11px]">{isBn ? c.label_bn : c.label_en}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {count} {isBn ? 'রেকর্ড' : 'items'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleExport(false)}
              disabled={exporting || selectedExportCollections.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-5 rounded-2xl shadow-md gap-2 mt-4"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>
                {exporting
                  ? (isBn ? 'এক্সপোর্ট হচ্ছে...' : 'Exporting...')
                  : (isBn ? 'ব্যাকআপ ফাইল তৈরি ও ডাউনলোড (.json)' : 'Generate & Download Backup (.json)')}
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Data Import */}
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDriveUpload className="w-5 h-5 text-primary" />
              <span>{isBn ? 'ডাটা ইমপোর্ট ও রিস্টোর (Import & Restore)' : 'Import & Restore Data'}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'পূর্বে এক্সপোর্ট করা .json ব্যাকআপ ফাইল আপলোড করে ডাটাবেসে রিস্টোর করুন।'
                : 'Upload a previously generated JSON backup snapshot to restore database records.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* File Dropzone / Picker */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  importFile
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`}
              >
                {importFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                      {importFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(importFile.size / 1024).toFixed(1)} KB • {isBn ? 'ক্লিক করে অন্য ফাইল বাছুন' : 'Click to change file'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? 'ব্যাকআপ ফাইল সিলেক্ট করুন (.json)' : 'Select Backup File (.json)'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isBn ? 'কম্পিউটার বা ডিভাইস থেকে ফাইল ড্র্যাগ বা ক্লিক করে আনুন' : 'Drag & drop or browse from your computer'}
                    </p>
                  </div>
                )}
              </div>

              {/* Parsed Inspection Preview */}
              {parsedData && parsedData.data && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isBn ? 'ফাইলের তথ্য' : 'File Snapshot Details'}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {parsedData.version ? `v${parsedData.version}` : 'Snapshot'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400 block">{isBn ? 'এক্সপোর্টের তারিখ:' : 'Exported At:'}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                        {parsedData.exportedAt ? new Date(parsedData.exportedAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{isBn ? 'মোট রেকর্ড:' : 'Total Items:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {parsedData.totalRecords || Object.values(parsedData.data).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0)}
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? 'ইমপোর্ট মোড নির্বাচন করুন:' : 'Select Restoration Strategy:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          importMode === 'merge'
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isBn ? 'মার্জ ও আপসার্ট' : 'Merge & Upsert'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {isBn ? 'বর্তমান তথ্য থাকবে, মিললে আপডেট হবে (নিরাপদ)' : 'Preserve current, insert & update matches (Safe)'}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          importMode === 'replace'
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সম্পূর্ণ প্রতিস্থাপন' : 'Full Overwrite'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {isBn ? 'বর্তমান তথ্য মুছে ফাইলের তথ্য বসবে' : 'Wipe collection & recreate from backup'}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Collections to Restore Checkbox List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      <span>{isBn ? 'রিস্টোর করার কালেকশনসমূহ' : 'Collections to Restore'}</span>
                      <button
                        type="button"
                        onClick={toggleSelectAllImport}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {selectedImportCollections.length === Object.keys(parsedData.data).length
                          ? (isBn ? 'সব আনচেক' : 'Deselect All')
                          : (isBn ? 'সব সিলেক্ট' : 'Select All')}
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                      {Object.keys(parsedData.data).map((key) => {
                        const items = parsedData.data[key];
                        const isChecked = selectedImportCollections.includes(key);
                        const meta = COLLECTIONS.find((c) => c.key === key);
                        return (
                          <label
                            key={key}
                            className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedImportCollections([...selectedImportCollections, key]);
                                  } else {
                                    setSelectedImportCollections(selectedImportCollections.filter((k) => k !== key));
                                  }
                                }}
                                className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                              />
                              <span className="font-medium text-[11px]">
                                {meta ? (isBn ? meta.label_bn : meta.label_en) : key}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {Array.isArray(items) ? items.length : 0}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results Report */}
              {importReport && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isBn ? 'ইমপোর্ট রিপোর্ট সারসংক্ষেপ' : 'Import Execution Report'}</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      {isBn ? `মোট: ${importReport.totalProcessed} রেকর্ড` : `Total: ${importReport.totalProcessed} records`}
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono">
                    {Object.entries(importReport.results || {}).map(([col, r]: [string, any]) => (
                      <div key={col} className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>{col}:</span>
                        <span>
                          +{r.inserted} {isBn ? 'যোগ' : 'ins'} | ~{r.updated} {isBn ? 'আপডেট' : 'upd'}
                          {r.failed > 0 && <span className="text-rose-500"> ({r.failed} err)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleExecuteImport}
              disabled={importing || !parsedData || selectedImportCollections.length === 0}
              className={`w-full font-bold text-xs py-5 rounded-2xl shadow-md gap-2 mt-4 ${
                importMode === 'replace'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>
                {importing
                  ? (isBn ? 'ডাটা রিস্টোর হচ্ছে...' : 'Restoring Database...')
                  : isBn
                  ? (importMode === 'replace' ? 'ডাটাবেস প্রতিস্থাপন ও রিস্টোর করুন' : 'ডাটাবেসে ইমপোর্ট ও মার্জ করুন')
                  : (importMode === 'replace' ? 'Execute Overwrite & Restore' : 'Execute Merge & Restore')}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
