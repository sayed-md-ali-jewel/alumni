'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Globe,
  Eye,
  Layers,
  GraduationCap,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Layout,
  Share2,
  CreditCard,
  Banknote,
  Heart,
  Loader2,
  Server,
  Key,
  EyeOff,
  Send,
  ShieldCheck,
  MailCheck,
  Zap,
  X,
  Database,
  MessageSquare,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BackupRestorePanel } from '@/components/admin/BackupRestorePanel';

export default function AdminSettingsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showAlert, showConfirm, showToast } = useSweetAlert();
  const { updateSettingsLocally } = useSiteSettings();

  const [activeTab, setActiveTab] = useState<'header' | 'hero' | 'footer' | 'contact' | 'social' | 'payment' | 'chat' | 'smtp' | 'backup' | 'preview'>('header');
  const [formData, setFormData] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewLocale, setPreviewLocale] = useState<'bn' | 'en'>(locale === 'bn' ? 'bn' : 'en');

  // SMTP Settings State
  const [smtpData, setSmtpData] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: 'KHS Alumni Association',
    fromEmail: 'noreply@khsalumni.org',
    replyTo: 'info@khsalumni.org',
    isEnabled: true,
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);

  // Load existing settings from API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [resSite, resSmtp] = await Promise.all([
        fetch('/api/admin/settings/site'),
        fetch('/api/admin/settings/smtp'),
      ]);

      if (resSite.ok) {
        const data = await resSite.json();
        if (data) {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      }

      if (resSmtp.ok) {
        const smtpJson = await resSmtp.json();
        if (smtpJson) {
          setSmtpData((prev) => ({ ...prev, ...smtpJson }));
        }
      }
    } catch (e) {
      console.error('Error fetching admin settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      // Instantly update client application state everywhere
      updateSettingsLocally(formData);

      showToast({
        title: isBn ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings Saved',
        text: isBn
          ? 'ওয়েবসাইটের হেডার, লোগো, ফুটার ও ব্র্যান্ডিং সফলভাবে আপডেট হয়েছে।'
          : 'Website header, logo, footer, and branding settings were updated.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Save error:', err);
      showAlert({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err?.message || 'Failed to update settings',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSmtpSaving(true);
    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save SMTP settings');
      }

      showToast({
        title: isBn ? 'SMTP সেটিংস সংরক্ষিত হয়েছে' : 'SMTP Settings Saved',
        text: isBn
          ? 'ইমেইল প্রেরণের কনফিগারেশন সফলভাবে আপডেট হয়েছে।'
          : 'Email delivery and SMTP server configurations were updated.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('SMTP Save error:', err);
      showAlert({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err?.message || 'Failed to update SMTP settings',
        type: 'error',
      });
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      showToast({
        title: isBn ? 'ইমেইল প্রদান করুন' : 'Recipient Email Required',
        text: isBn ? 'পরীক্ষামূলক ইমেইল পাঠানোর জন্য ঠিকানা লিখুন।' : 'Please enter a test recipient email address.',
        type: 'error',
      });
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await fetch('/api/admin/settings/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testRecipient.trim(),
          host: smtpData.host,
          port: Number(smtpData.port),
          secure: smtpData.secure,
          user: smtpData.user,
          pass: smtpData.pass,
          fromName: smtpData.fromName,
          fromEmail: smtpData.fromEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SMTP Test Connection Failed');
      }

      showToast({
        title: isBn ? 'টেস্ট ইমেইল পাঠানো হয়েছে!' : 'Test Email Sent!',
        text: isBn
          ? `${testRecipient} ঠিকানায় টেস্ট ইমেইল সফলভাবে পৌঁছেছে।`
          : `A verification test email was successfully delivered to ${testRecipient}.`,
        type: 'success',
      });
      setShowTestModal(false);
    } catch (err: any) {
      console.error('SMTP test error:', err);
      showAlert({
        title: isBn ? 'কানেকশন ব্যর্থ হয়েছে' : 'SMTP Connection Failed',
        text: err?.message || 'Could not establish connection with SMTP server. Please verify your credentials and security options.',
        type: 'error',
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const applyPreset = (preset: 'gmail' | 'brevo' | 'mailgun' | 'outlook' | 'zoho') => {
    if (preset === 'gmail') {
      setSmtpData((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      }));
    } else if (preset === 'brevo') {
      setSmtpData((prev) => ({
        ...prev,
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
      }));
    } else if (preset === 'mailgun') {
      setSmtpData((prev) => ({
        ...prev,
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
      }));
    } else if (preset === 'outlook') {
      setSmtpData((prev) => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
      }));
    } else if (preset === 'zoho') {
      setSmtpData((prev) => ({
        ...prev,
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
      }));
    }
    showToast({
      title: isBn ? 'প্রিসেট লোড হয়েছে' : 'Preset Applied',
      text: `${preset.toUpperCase()} Host & Port auto-filled.`,
      type: 'info',
    });
  };

  const handleResetDefaults = () => {
    showConfirm({
      title: isBn ? 'ডিফল্ট সেটিংসে ফিরবেন?' : 'Reset to Default Settings?',
      text: isBn
        ? 'হেডার, লোগো, ফুটার ও যোগাযোগ তথ্যের সকল পরিবর্তন মুছে ডিফল্ট মানে রিসেট করা হবে।'
        : 'All custom branding, logos, contact info, and footer texts will be reset to defaults.',
      confirmButtonText: isBn ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      type: 'warning',
      onConfirm: () => {
        setFormData(DEFAULT_SITE_SETTINGS);
        showToast({
          title: isBn ? 'রিসেট করা হয়েছে' : 'Reset Applied',
          text: isBn ? 'সংরক্ষণ করতে "সেভ করুন" বাটনে ক্লিক করুন।' : 'Click "Save Settings" to persist defaults.',
          type: 'info',
        });
      },
    });
  };

  // Preview helper values
  const previewSiteName = previewLocale === 'bn' ? formData.siteName_bn : formData.siteName_en;
  const previewTagline = previewLocale === 'bn' ? formData.tagline_bn : formData.tagline_en;
  const previewFooterTagline = previewLocale === 'bn' ? formData.footerTagline_bn : formData.footerTagline_en;
  const previewAbout = previewLocale === 'bn' ? formData.about_bn : formData.about_en;
  const previewCopyright = previewLocale === 'bn' ? formData.copyright_bn : formData.copyright_en;
  const previewCommunity = previewLocale === 'bn' ? formData.communityName_bn : formData.communityName_en;
  const previewPrefix = previewLocale === 'bn' ? formData.customPrefix_bn : formData.customPrefix_en;
  const previewFor = previewLocale === 'bn' ? formData.customFor_bn : formData.customFor_en;

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-sm text-slate-500">
          {isBn ? 'সেটিংস লোড হচ্ছে...' : 'Loading site & branding settings...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white shadow-xl border border-primary-900/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'সিস্টেম ও ব্র্যান্ডিং কনসোল' : 'System Branding & Customizer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isBn ? 'হেডার, লোগো ও ফুটার সেটিংস' : 'Header, Logo & Footer Settings'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {isBn
              ? 'ওয়েবসাইটের মূল লোগো, ফেভিকন, নাম, হেডার ও ফুটার ট্যাগলাইন, সোশ্যাল মিডিয়া লিংক এবং কন্টাক্ট ইনফরমেশন কাস্টমাইজ করুন।'
              : 'Customize dynamic header logo, favicon, site title, taglines, footer about texts, secretariat contacts, and social links.'}
          </p>
        </div>

        {activeTab !== 'backup' && activeTab !== 'preview' && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetDefaults}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs gap-1.5 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-primary/30"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'header'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>{isBn ? 'হেডার ও ব্র্যান্ডিং' : 'Header & Branding'}</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hero'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isBn ? 'হেডার ব্যানার ও হিরো' : 'Hero & Home Banner'}</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'footer'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? 'ফুটার ও পরিচিতি' : 'Footer & About'}</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contact'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isBn ? 'সচিবালয় ও যোগাযোগ' : 'Contact Secretariat'}</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{isBn ? 'সোশ্যাল মিডিয়া ও ব্যাজ' : 'Social Links & Badge'}</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payment'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span>{isBn ? 'বিকাশ, নগদ ও ক্যাশ পেমেন্ট' : 'bKash/Nagad/Cash Setup'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>{isBn ? 'চ্যাট সেটিংস' : 'Chat Settings'}</span>
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'smtp'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Server className="w-4 h-4 text-rose-500" />
          <span>{isBn ? 'ইমেইল ও SMTP সেটিংস' : 'Email & SMTP Setup'}</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'backup'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>{isBn ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Export & Import Data'}</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ml-auto ${
            activeTab === 'preview'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}</span>
        </button>
      </div>

      {/* Tab 1: Header & Branding */}
      {activeTab === 'header' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo & Favicon Upload Card */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>{isBn ? 'ওয়েবসাইট লোগো ও ফেভিকন' : 'Website Logo & Favicon'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'সরাসরি ডিভাইস থেকে ছবি আপলোড করুন অথবা ইমেজ ইউআরএল ব্যবহার করুন।'
                  : 'Upload images directly from your device or specify public image URLs.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{isBn ? 'প্রধান লোগো (Header & Footer Logo)' : 'Main Website Logo'}</span>
                  <span className="text-[11px] font-normal text-slate-500">PNG / WEBP / SVG</span>
                </label>
                <ImageUpload
                  shape="rectangle"
                  value={formData.logoUrl}
                  onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                  helperText={
                    isBn
                      ? 'লোগো ফাইল আপলোড করুন (স্বচ্ছ ব্যাকগ্রাউন্ড সহ উপযুক্ত)। খালি রাখলে গ্র্যাজুয়েশন আইকন প্রদর্শিত হবে।'
                      : 'Upload website logo (transparent PNG/WEBP recommended). Leave blank to use graduation cap icon.'
                  }
                />
              </div>

              {/* Favicon Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{isBn ? 'ব্রাউজার ট্যাব ফেভিকন (Favicon)' : 'Browser Tab Favicon (Icon)'}</span>
                  <span className="text-[11px] font-normal text-slate-500">32x32 / 64x64 PNG or ICO</span>
                </label>
                <ImageUpload
                  shape="circle"
                  value={formData.faviconUrl}
                  onChange={(url) => setFormData({ ...formData, faviconUrl: url })}
                  fallbackName="ICO"
                  helperText={
                    isBn
                      ? 'ব্রাউজার ট্যাবে প্রদর্শিত ছোট আইকন (PNG, ICO বা SVG)'
                      : 'Small icon shown on browser tabs (PNG, ICO or SVG up to 2MB)'
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Website Name & Taglines */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <span>{isBn ? 'ওয়েবসাইটের নাম ও হেডার ট্যাগলাইন' : 'Website Name & Header Tagline'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'বাংলা ও ইংরেজি উভয় ভাষার জন্য নাম ও সাবটাইটেল নির্ধারণ করুন।'
                  : 'Specify title and header subtitle for both English and Bengali versions.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ওয়েবসাইটের নাম (English)' : 'Website Name (English)'} *
                </label>
                <Input
                  required
                  value={formData.siteName_en}
                  onChange={(e) => setFormData({ ...formData, siteName_en: e.target.value })}
                  placeholder="e.g. Alumni Association"
                  className="rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ওয়েবসাইটের নাম (বাংলা)' : 'Website Name (Bengali)'} *
                </label>
                <Input
                  required
                  value={formData.siteName_bn}
                  onChange={(e) => setFormData({ ...formData, siteName_bn: e.target.value })}
                  placeholder="যেমন: অ্যালামনাই অ্যাসোসিয়েশন"
                  className="rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'হেডার সাবটাইটেল / ট্যাগলাইন (English)' : 'Header Subtitle / Tagline (English)'}
                </label>
                <Input
                  value={formData.tagline_en}
                  onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                  placeholder="e.g. Legacy & Network"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'হেডার সাবটাইটেল / ট্যাগলাইন (বাংলা)' : 'Header Subtitle / Tagline (Bengali)'}
                </label>
                <Input
                  value={formData.tagline_bn}
                  onChange={(e) => setFormData({ ...formData, tagline_bn: e.target.value })}
                  placeholder="যেমন: ঐতিহ্য ও অগ্রযাত্রা"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Hero Banner (Home Header Section) */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hero Badge & Main Headline */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{isBn ? 'হেডার ব্যাজ ও মূল শিরোনাম' : 'Hero Badge & Main Headline'}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'হোমপেজের মূল হেডার সেকশনে প্রদর্শিত ব্যাজ, শিরোনাম ও সাবটাইটেল পরিবর্তন করুন।'
                    : 'Configure dynamic top badge, main headline, and subtitle for the home hero section.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badge EN & BN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'শীর্ষ ব্যাজ বার্তা (English)' : 'Top Badge Text (English)'}
                    </label>
                    <Input
                      value={formData.heroBadge_en}
                      onChange={(e) => setFormData({ ...formData, heroBadge_en: e.target.value })}
                      placeholder="e.g. 🎓 The Premier Global Network for Our Alumni"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'শীর্ষ ব্যাজ বার্তা (বাংলা)' : 'Top Badge Text (Bengali)'}
                    </label>
                    <Input
                      value={formData.heroBadge_bn}
                      onChange={(e) => setFormData({ ...formData, heroBadge_bn: e.target.value })}
                      placeholder="যেমন: 🎓 বিশ্বব্যাপী প্রাক্তন শিক্ষার্থীদের সর্ববৃহৎ প্ল্যাটফর্ম"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Title EN & BN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'মূল শিরোনাম / Headline (English)' : 'Main Headline / Title (English)'} *
                  </label>
                  <Input
                    required
                    value={formData.heroTitle_en}
                    onChange={(e) => setFormData({ ...formData, heroTitle_en: e.target.value })}
                    placeholder="e.g. Honoring Our Roots, Empowering the Future"
                    className="rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'মূল শিরোনাম / Headline (বাংলা)' : 'Main Headline / Title (Bengali)'} *
                  </label>
                  <Input
                    required
                    value={formData.heroTitle_bn}
                    onChange={(e) => setFormData({ ...formData, heroTitle_bn: e.target.value })}
                    placeholder="যেমন: শিকড়ের টানে, আগামীর পানে — আমাদের অ্যালামনাই পরিবার"
                    className="rounded-xl font-bold"
                  />
                </div>

                {/* Subtitle EN & BN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'বিবরণ / Subtitle (English)' : 'Description / Subtitle (English)'}
                  </label>
                  <Textarea
                    rows={2}
                    value={formData.heroSubtitle_en}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle_en: e.target.value })}
                    placeholder="Connect with thousands of distinguished alumni across the globe..."
                    className="rounded-xl resize-none text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'বিবরণ / Subtitle (বাংলা)' : 'Description / Subtitle (Bengali)'}
                  </label>
                  <Textarea
                    rows={2}
                    value={formData.heroSubtitle_bn}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle_bn: e.target.value })}
                    placeholder="আমাদের প্রিয় বিদ্যাপীঠের হাজারো কৃতি প্রাক্তনের সাথে যুক্ত হোন..."
                    className="rounded-xl resize-none text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons & Options */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>{isBn ? 'অ্যাকশন বাটন ও লিংকসমূহ' : 'Call to Action Buttons & Links'}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'হেডার ব্যানারের অ্যাকশন বাটন টেক্সট, গন্তব্য লিংক এবং পরিসংখ্যান বার নিয়ন্ত্রণ করুন।'
                    : 'Configure primary and secondary CTA buttons, URLs, and quick metrics bar.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Button */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>{isBn ? 'প্রথম অ্যাকশন বাটন (Primary CTA)' : 'Primary Action Button'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {isBn ? 'বাটন টেক্সট (English)' : 'Button Text (English)'}
                      </label>
                      <Input
                        value={formData.heroPrimaryBtnText_en}
                        onChange={(e) => setFormData({ ...formData, heroPrimaryBtnText_en: e.target.value })}
                        placeholder="Explore Directory"
                        className="rounded-xl text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {isBn ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bengali)'}
                      </label>
                      <Input
                        value={formData.heroPrimaryBtnText_bn}
                        onChange={(e) => setFormData({ ...formData, heroPrimaryBtnText_bn: e.target.value })}
                        placeholder="প্রাক্তনদের খুঁজুন"
                        className="rounded-xl text-xs h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {isBn ? 'বাটন লিংক URL' : 'Button Link URL'}
                    </label>
                    <Input
                      value={formData.heroPrimaryBtnLink}
                      onChange={(e) => setFormData({ ...formData, heroPrimaryBtnLink: e.target.value })}
                      placeholder="/directory"
                      className="rounded-xl text-xs h-9"
                    />
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{isBn ? 'দ্বিতীয় অ্যাকশন বাটন (Secondary CTA)' : 'Secondary Action Button'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {isBn ? 'বাটন টেক্সট (English)' : 'Button Text (English)'}
                      </label>
                      <Input
                        value={formData.heroSecondaryBtnText_en}
                        onChange={(e) => setFormData({ ...formData, heroSecondaryBtnText_en: e.target.value })}
                        placeholder="Support Endowment"
                        className="rounded-xl text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {isBn ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bengali)'}
                      </label>
                      <Input
                        value={formData.heroSecondaryBtnText_bn}
                        onChange={(e) => setFormData({ ...formData, heroSecondaryBtnText_bn: e.target.value })}
                        placeholder="তহবিলে অনুদান দিন"
                        className="rounded-xl text-xs h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {isBn ? 'বাটন লিংক URL' : 'Button Link URL'}
                    </label>
                    <Input
                      value={formData.heroSecondaryBtnLink}
                      onChange={(e) => setFormData({ ...formData, heroSecondaryBtnLink: e.target.value })}
                      placeholder="/donate"
                      className="rounded-xl text-xs h-9"
                    />
                  </div>
                </div>

                {/* Show Stats Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? 'হেডারে লাইভ পরিসংখ্যান প্রদর্শন' : 'Display Quick Stats Grid'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isBn ? 'নিবন্ধিত প্রাক্তন, ব্যাচ ও রক্তদাতার সংখ্যা কার্ড' : 'Shows registered alumni, batches, and donor counts'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.heroShowStats !== false}
                    onChange={(e) => setFormData({ ...formData, heroShowStats: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Live Preview Card */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{isBn ? 'হেডার ব্যানারের লাইভ প্রিভিউ' : 'Hero Banner Live Preview'}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewLocale(previewLocale === 'bn' ? 'en' : 'bn')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {previewLocale.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {previewTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`p-6 sm:p-10 ${previewTheme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
              <div className="max-w-3xl mx-auto text-center space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 border border-primary/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {previewLocale === 'bn'
                      ? formData.heroBadge_bn || DEFAULT_SITE_SETTINGS.heroBadge_bn
                      : formData.heroBadge_en || DEFAULT_SITE_SETTINGS.heroBadge_en}
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {previewLocale === 'bn'
                    ? formData.heroTitle_bn || DEFAULT_SITE_SETTINGS.heroTitle_bn
                    : formData.heroTitle_en || DEFAULT_SITE_SETTINGS.heroTitle_en}
                </h2>

                {/* Subtitle */}
                <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${previewTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {previewLocale === 'bn'
                    ? formData.heroSubtitle_bn || DEFAULT_SITE_SETTINGS.heroSubtitle_bn
                    : formData.heroSubtitle_en || DEFAULT_SITE_SETTINGS.heroSubtitle_en}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <div className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {previewLocale === 'bn'
                        ? formData.heroPrimaryBtnText_bn || 'প্রাক্তনদের খুঁজুন'
                        : formData.heroPrimaryBtnText_en || 'Explore Directory'}
                    </span>
                  </div>
                  <div className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${previewTheme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-800'}`}>
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <span>
                      {previewLocale === 'bn'
                        ? formData.heroSecondaryBtnText_bn || 'তহবিলে অনুদান দিন'
                        : formData.heroSecondaryBtnText_en || 'Support Endowment'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Footer & About */}
      {activeTab === 'footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>{isBn ? 'ফুটার ট্যাগলাইন ও কপিরাইট' : 'Footer Tagline & Copyright'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'ফুটারের ব্র্যান্ডিং স্লোগান ও স্বত্বাধিকার বার্তা নির্ধারণ করুন।'
                  : 'Footer brand slogan and copyright statement displayed at the bottom.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ফুটার স্লোগান (English)' : 'Footer Slogan / Tagline (English)'}
                </label>
                <Input
                  value={formData.footerTagline_en}
                  onChange={(e) => setFormData({ ...formData, footerTagline_en: e.target.value })}
                  placeholder="e.g. Connecting Legacy, Empowering the Future"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ফুটার স্লোগান (বাংলা)' : 'Footer Slogan / Tagline (Bengali)'}
                </label>
                <Input
                  value={formData.footerTagline_bn}
                  onChange={(e) => setFormData({ ...formData, footerTagline_bn: e.target.value })}
                  placeholder="যেমন: ঐতিহ্যের বন্ধনে প্রাক্তনদের সংযোগ"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'কপিরাইট নোটিশ (English)' : 'Copyright Text (English)'}
                </label>
                <Input
                  value={formData.copyright_en}
                  onChange={(e) => setFormData({ ...formData, copyright_en: e.target.value })}
                  placeholder="Alumni Association. All rights reserved."
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'কপিরাইট নোটিশ (বাংলা)' : 'Copyright Text (Bengali)'}
                </label>
                <Input
                  value={formData.copyright_bn}
                  onChange={(e) => setFormData({ ...formData, copyright_bn: e.target.value })}
                  placeholder="অ্যালামনাই অ্যাসোসিয়েশন। সর্বস্বত্ব সংরক্ষিত।"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{isBn ? 'অ্যাসোসিয়েশন পরিচিতি (About Text)' : 'About Association Description'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'ফুটার লোগোর নিচে প্রদর্শিত সংক্ষিপ্ত পরিচিতি বার্তা।'
                  : 'Short description displayed below the brand logo in the footer.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ (English)' : 'Short Description (English)'}
                </label>
                <Textarea
                  rows={4}
                  value={formData.about_en}
                  onChange={(e) => setFormData({ ...formData, about_en: e.target.value })}
                  placeholder="A dedicated platform uniting our esteemed graduates..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Short Description (Bengali)'}
                </label>
                <Textarea
                  rows={4}
                  value={formData.about_bn}
                  onChange={(e) => setFormData({ ...formData, about_bn: e.target.value })}
                  placeholder="বিশ্বজুড়ে ছড়িয়ে থাকা আমাদের বিশ্ববিদ্যালয়ের হাজারো কৃতি প্রাক্তনদের..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Contact Secretariat */}
      {activeTab === 'contact' && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <span>{isBn ? 'সচিবালয় ও অফিসিয়াল যোগাযোগের তথ্য' : 'Contact Secretariat & Office Information'}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'ফুটারের "Contact Secretariat" সেকশনে প্রদর্শিত ঠিকানা, ফোন নম্বর এবং ইমেইল ঠিকানা।'
                : 'Address, official phone numbers, and helpdesk email shown in the footer.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'অফিস / ভবনের ঠিকানা (Address)' : 'Physical Office Address'}</span>
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alumni Bhavan, Central Campus, Dhaka-1000, Bangladesh"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? 'ফোন নম্বর (Phone Numbers)' : 'Helpline / Phone Numbers'}</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 2 9876543, +8801700000000"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? 'অফিসিয়াল ইমেইল (Official Email)' : 'Official Email Address'}</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@alumni.ac.bd"
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Social Links & Badge */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <span>{isBn ? 'সোশ্যাল মিডিয়া লিংক সমূহ' : 'Social Media & Web Links'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'ফুটারের সোশ্যাল আইকনগুলোর জন্য লিঙ্ক প্রদান করুন। খালি রাখলে আইকন লুকায়িত থাকবে।'
                  : 'Configure social links for footer icons. Leave empty to hide specific icons.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Page / Group URL</span>
                </label>
                <Input
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/your-alumni-page"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                  <span>LinkedIn Page URL</span>
                </label>
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/your-alumni"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube Channel URL</span>
                </label>
                <Input
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@your-alumni"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span>Official University / Organization Website</span>
                </label>
                <Input
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://alumni.ac.bd"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" />
                    <span>Twitter / X URL</span>
                  </label>
                  <Input
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://x.com/alumni"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram URL</span>
                  </label>
                  <Input
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/alumni"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Number / Direct Chat Link</span>
                </label>
                <Input
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+8801700000000 or https://chat.whatsapp.com/..."
                  className="rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Community Badge */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>{isBn ? 'ফুটার কমিউনিটি ব্যাজ (Built with ❤️)' : 'Footer Community Badge'}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? 'ফুটারের সর্বনিম্নে প্রদর্শিত কাস্টম অ্যালামনাই কমিউনিটি ব্যাজ।'
                  : 'Customize the "Built with ❤️ for our Community" badge at the bottom of the footer.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isBn ? 'কমিউনিটি ব্যাজ চালু রাখুন' : 'Enable Community Badge'}
                </span>
                <input
                  type="checkbox"
                  checked={formData.showCommunityBadge}
                  onChange={(e) => setFormData({ ...formData, showCommunityBadge: e.target.checked })}
                  className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Prefix Text (EN)
                  </label>
                  <Input
                    value={formData.customPrefix_en}
                    onChange={(e) => setFormData({ ...formData, customPrefix_en: e.target.value })}
                    placeholder="Built with"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Prefix Text (BN)
                  </label>
                  <Input
                    value={formData.customPrefix_bn}
                    onChange={(e) => setFormData({ ...formData, customPrefix_bn: e.target.value })}
                    placeholder="ভালোবাসা দিয়ে নির্মিত"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Community Name (EN)
                  </label>
                  <Input
                    value={formData.communityName_en}
                    onChange={(e) => setFormData({ ...formData, communityName_en: e.target.value })}
                    placeholder="our Alumni Community"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Community Name (BN)
                  </label>
                  <Input
                    value={formData.communityName_bn}
                    onChange={(e) => setFormData({ ...formData, communityName_bn: e.target.value })}
                    placeholder="আমাদের অ্যালামনাই কমিউনিটি"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Payment Accounts & Instructions (bKash, Nagad, Cash) */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* bKash Configuration Card */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-pink-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-600 inline-block" />
                    <span>{isBn ? 'বিকাশ (bKash) পেমেন্ট সেটিংস' : 'bKash Payment Configuration'}</span>
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <span>{formData.isBkashEnabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}</span>
                    <input
                      type="checkbox"
                      checked={formData.isBkashEnabled}
                      onChange={(e) => setFormData({ ...formData, isBkashEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-pink-600 accent-pink-600 cursor-pointer"
                    />
                  </label>
                </div>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'বিকাশ অ্যাকাউন্ট নম্বর, অ্যাকাউন্ট ধরন ও অনুদান পাঠানোর নির্দেশনা।'
                    : 'Set bKash receiving number, account type (Personal/Merchant), and payment steps.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'বিকাশ নম্বর (bKash Number)' : 'bKash Number'} *
                    </label>
                    <Input
                      value={formData.bkashNumber}
                      onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'অ্যাকাউন্টের ধরন (Account Type)' : 'Account Type'}
                    </label>
                    <select
                      value={formData.bkashType || 'Personal'}
                      onChange={(e) => setFormData({ ...formData, bkashType: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                    >
                      <option value="Personal">{isBn ? 'Personal (ব্যক্তিগত)' : 'Personal'}</option>
                      <option value="Merchant">{isBn ? 'Merchant (মার্চেন্ট)' : 'Merchant'}</option>
                      <option value="Agent">{isBn ? 'Agent (এজেন্ট)' : 'Agent'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট নির্দেশিকা (English)' : 'bKash Instructions (English)'}
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.bkashInstructions_en}
                    onChange={(e) => setFormData({ ...formData, bkashInstructions_en: e.target.value })}
                    placeholder="1. Open bKash App..."
                    className="rounded-xl text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট নির্দেশিকা (বাংলা)' : 'bKash Instructions (Bengali)'}
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.bkashInstructions_bn}
                    onChange={(e) => setFormData({ ...formData, bkashInstructions_bn: e.target.value })}
                    placeholder="১. বিকাশ অ্যাপ ওপেন করুন..."
                    className="rounded-xl text-xs leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Nagad Configuration Card */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span>{isBn ? 'নগদ (Nagad) পেমেন্ট সেটিংস' : 'Nagad Payment Configuration'}</span>
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <span>{formData.isNagadEnabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}</span>
                    <input
                      type="checkbox"
                      checked={formData.isNagadEnabled}
                      onChange={(e) => setFormData({ ...formData, isNagadEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                  </label>
                </div>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'নগদ অ্যাকাউন্ট নম্বর, অ্যাকাউন্ট ধরন ও অনুদান পাঠানোর নির্দেশিকা।'
                    : 'Set Nagad receiving number, account type, and donation guidelines.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'নগদ নম্বর (Nagad Number)' : 'Nagad Number'} *
                    </label>
                    <Input
                      value={formData.nagadNumber}
                      onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                      placeholder="018XXXXXXXX"
                      className="rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'অ্যাকাউন্টের ধরন (Account Type)' : 'Account Type'}
                    </label>
                    <select
                      value={formData.nagadType || 'Personal'}
                      onChange={(e) => setFormData({ ...formData, nagadType: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                    >
                      <option value="Personal">{isBn ? 'Personal (ব্যক্তিগত)' : 'Personal'}</option>
                      <option value="Merchant">{isBn ? 'Merchant (মার্চেন্ট)' : 'Merchant'}</option>
                      <option value="Agent">{isBn ? 'Agent (এজেন্ট)' : 'Agent'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট নির্দেশিকা (English)' : 'Nagad Instructions (English)'}
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.nagadInstructions_en}
                    onChange={(e) => setFormData({ ...formData, nagadInstructions_en: e.target.value })}
                    placeholder="1. Open Nagad App..."
                    className="rounded-xl text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট নির্দেশিকা (বাংলা)' : 'Nagad Instructions (Bengali)'}
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.nagadInstructions_bn}
                    onChange={(e) => setFormData({ ...formData, nagadInstructions_bn: e.target.value })}
                    placeholder="১. নগদ অ্যাপ ওপেন করুন..."
                    className="rounded-xl text-xs leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Payment Configuration Card */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>{isBn ? 'ক্যাশ (Cash) পেমেন্ট ও সচিবালয় নির্দেশিকা' : 'Cash Payment & Secretariat Instructions'}</span>
                </CardTitle>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <span>{formData.isCashEnabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}</span>
                  <input
                    type="checkbox"
                    checked={formData.isCashEnabled}
                    onChange={(e) => setFormData({ ...formData, isCashEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                </label>
              </div>
              <CardDescription className="text-xs">
                {isBn
                  ? 'সরাসরি অফিসে এসে নগদ অর্থ প্রদানের নির্দেশনা (রসিদ ও যাচাইকরণ প্রক্রিয়া)।'
                  : 'Instructions shown when donor chooses to deposit cash in person at the Secretariat office.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ক্যাশ পেমেন্ট নির্দেশিকা (English)' : 'Cash Payment Instructions (English)'}
                </label>
                <Textarea
                  rows={3}
                  value={formData.cashInstructions_en}
                  onChange={(e) => setFormData({ ...formData, cashInstructions_en: e.target.value })}
                  placeholder="You can deposit your cash donation directly at the Alumni Secretariat Desk..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ক্যাশ পেমেন্ট নির্দেশিকা (বাংলা)' : 'Cash Payment Instructions (Bengali)'}
                </label>
                <Textarea
                  rows={3}
                  value={formData.cashInstructions_bn}
                  onChange={(e) => setFormData({ ...formData, cashInstructions_bn: e.target.value })}
                  placeholder="আপনি সরাসরি বিদ্যালয় অ্যালামনাই সচিবালয় অফিসে নগদ অর্থ জমা দিতে পারেন..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Chat Settings (Global Chat Control) */}
      {activeTab === 'chat' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Main Global Chat Switch Card */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      {isBn ? 'গ্লোবাল চ্যাট নিয়ন্ত্রণ (Global Chat Control)' : 'Global Chat Settings'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isBn
                        ? 'ওয়েবসাইটের সকল ব্যবহারকারী ও অ্যালামনাইদের জন্য চ্যাট সুবিধা নিয়ন্ত্রণ করুন।'
                        : 'Manage system-wide chat availability and instant messaging permissions.'}
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={formData.isChatEnabled ? 'success' : 'destructive'}
                  className="px-3 py-1 text-xs font-bold gap-1.5"
                >
                  {formData.isChatEnabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'চ্যাট সক্রিয় (Global ON)' : 'Global Chat: ON'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isBn ? 'চ্যাট নিষ্ক্রিয় (Global OFF)' : 'Global Chat: OFF'}</span>
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Global Master Switch */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isBn ? 'সিস্টেমব্যাপী চ্যাট চালু রাখুন' : 'Enable Chat Globally'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      {isBn ? 'ডিফল্ট: চালু' : 'Default: ON'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {formData.isChatEnabled
                      ? isBn
                        ? '✅ চ্যাট চালু রয়েছে। ব্যবহারকারীদের ব্যক্তিগত চ্যাট অনুমতির ভিত্তিতে চ্যাট উপলব্ধ রয়েছে।'
                        : '✅ Global chat is currently ON. Instant messaging is available according to each individual user\'s chat permission.'
                      : isBn
                        ? '⛔ চ্যাট বন্ধ রয়েছে। সিস্টেমের সকল ব্যবহারকারী ও অ্যালামনাইদের জন্য চ্যাট সম্পূর্ণ নিষ্ক্রিয় করা হয়েছে।'
                        : '⛔ Global chat is currently OFF. Chat and messaging are completely disabled across the entire system for all users.'}
                  </p>
                </div>

                {/* Styled Interactive Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-extrabold ${!formData.isChatEnabled ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-400'}`}>
                    OFF
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isChatEnabled}
                    onClick={() => setFormData({ ...formData, isChatEnabled: !formData.isChatEnabled })}
                    className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      formData.isChatEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.isChatEnabled ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-extrabold ${formData.isChatEnabled ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-400'}`}>
                    ON
                  </span>
                </div>
              </div>

              {/* Chat Permission Hierarchy & Rules Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{isBn ? 'চ্যাট অনুমতি ও প্রায়োরিটি লজিক' : 'Chat Permission Hierarchy & Priority Logic'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Case 1 */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    !formData.isChatEnabled
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-extrabold uppercase text-rose-600 dark:text-rose-400">
                        {isBn ? 'প্রায়োরিটি ১' : 'Priority 1'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                        {isBn ? 'সবার জন্য বন্ধ' : 'Disabled for All'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Global Chat: OFF
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {isBn
                        ? 'সিস্টেমের যেকোনো ব্যবহারকারীর ব্যক্তিগত সেটিং যা-ই থাকুক না কেন, চ্যাট সবার জন্য সম্পূর্ণ বন্ধ থাকবে।'
                        : 'Chat disabled for everyone across the system, regardless of individual settings.'}
                    </p>
                  </div>

                  {/* Case 2 */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    formData.isChatEnabled
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                        {isBn ? 'প্রায়োরিটি ২' : 'Priority 2'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                        {isBn ? 'নির্দিষ্ট সদস্যের বন্ধ' : 'Disabled for User'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Global ON + Individual OFF
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {isBn
                        ? 'গ্লোবালি চ্যাট চালু থাকলেও শুধুমাত্র সংশ্লিষ্ট অ্যালামনাইয়ের অ্যাকাউন্টে চ্যাট বন্ধ থাকবে।'
                        : 'Chat disabled only for that specific alumni without affecting anyone else.'}
                    </p>
                  </div>

                  {/* Case 3 */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    formData.isChatEnabled
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                        {isBn ? 'প্রায়োরিটি ৩' : 'Priority 3'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                        {isBn ? 'চ্যাট উপলব্ধ' : 'Chat Available'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Global ON + Individual ON
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {isBn
                        ? 'গ্লোবাল ও ব্যক্তিগত উভয় অনুমতি সক্রিয় থাকায় চ্যাট ও মেসেজিং পুরোপুরি চালু থাকবে।'
                        : 'Chat fully operational and active with instant messaging, audio, and attachments.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Management Link Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {isBn ? 'নির্দিষ্ট সদস্যের চ্যাট অনুমতি নিয়ন্ত্রণ করতে চান?' : 'Need to control chat access for a specific alumni?'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isBn
                        ? 'অ্যাডমিন → অ্যালামনাই ম্যানেজমেন্টে গিয়ে যেকোনো সদস্যের প্রোফাইল এডিট করে "Chat Access" নিয়ন্ত্রণ করুন।'
                        : 'Go to Admin → Alumni Management to configure individual chat toggle for any specific member.'}
                    </p>
                  </div>
                </div>

                <a
                  href={`/${locale}/dashboard/admin/alumni`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition-all shrink-0"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অ্যালামনাই ম্যানেজমেন্ট' : 'Alumni Management'}</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: SMTP / Email Settings */}
      {activeTab === 'smtp' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Quick Presets Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isBn ? 'জনপ্রিয় ইমেইল সার্ভিস প্রিসেট' : 'Quick Provider Presets'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isBn ? 'এক ক্লিকে হোস্ট ও পোর্ট অটোফিল করুন' : 'Auto-fill recommended host and port settings'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('gmail')}
                className="rounded-xl text-xs font-semibold h-8"
              >
                Gmail (587)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('brevo')}
                className="rounded-xl text-xs font-semibold h-8"
              >
                Brevo / Sendinblue
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('mailgun')}
                className="rounded-xl text-xs font-semibold h-8"
              >
                Mailgun
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('outlook')}
                className="rounded-xl text-xs font-semibold h-8"
              >
                Outlook / 365
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('zoho')}
                className="rounded-xl text-xs font-semibold h-8"
              >
                Zoho (465 SSL)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP Server Credentials */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-rose-600">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Server className="w-5 h-5 text-rose-600" />
                    <span>{isBn ? 'SMTP সার্ভার ও নিরাপত্তা' : 'SMTP Server Connection'}</span>
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <span>{smtpData.isEnabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}</span>
                    <input
                      type="checkbox"
                      checked={smtpData.isEnabled}
                      onChange={(e) => setSmtpData({ ...smtpData, isEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                    />
                  </label>
                </div>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'পাসওয়ার্ড রিসেট, নোটিফিকেশন ও স্বয়ংক্রিয় বার্তা প্রেরণের জন্য মেইল সার্ভার।'
                    : 'Configure outbound email server details for password resets and notifications.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'SMTP হোস্ট (Server Host)' : 'SMTP Host / Server'} *
                    </label>
                    <Input
                      value={smtpData.host}
                      onChange={(e) => setSmtpData({ ...smtpData, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="rounded-xl font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'পোর্ট (Port)' : 'Port'} *
                    </label>
                    <Input
                      type="number"
                      value={smtpData.port}
                      onChange={(e) => setSmtpData({ ...smtpData, port: Number(e.target.value) || 587 })}
                      placeholder="587"
                      className="rounded-xl font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isBn ? 'SSL / TLS এনক্রিপশন' : 'SSL / TLS Secure Connection'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isBn ? 'পোর্ট ৪৬৫ এর জন্য SSL অন রাখুন, পোর্ট ৫৮৭ এর জন্য অফ রাখুন (STARTTLS)' : 'Enable for port 465 (SSL), leave disabled for port 587 (STARTTLS)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smtpData.secure}
                    onChange={(e) => setSmtpData({ ...smtpData, secure: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'ইউজারনেম / ইমেইল (Username)' : 'SMTP Username / Email'}
                  </label>
                  <Input
                    value={smtpData.user}
                    onChange={(e) => setSmtpData({ ...smtpData, user: e.target.value })}
                    placeholder="your-email@gmail.com or api-user"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'পাসওয়ার্ড / অ্যাপ পাসওয়ার্ড (Password)' : 'SMTP Password / App Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[11px] text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
                    >
                      {showSmtpPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSmtpPass ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখান' : 'Show')}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={smtpData.pass}
                      onChange={(e) => setSmtpData({ ...smtpData, pass: e.target.value })}
                      placeholder={isBn ? 'পাসওয়ার্ড বা ১৬ সংখ্যার অ্যাপ পাসওয়ার্ড' : '••••••••••••••••'}
                      className="rounded-xl text-xs font-mono pl-9"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sender Identity & Testing */}
            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MailCheck className="w-5 h-5 text-emerald-600" />
                    <span>{isBn ? 'প্রেরক তথ্য (Sender Identity)' : 'Sender Identity & Headers'}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'ব্যবহারকারী যে নাম ও ইমেইল ঠিকানা থেকে মেসেজ পাবেন।'
                      : 'Customize the display name and sender email address on outgoing messages.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isBn ? 'প্রেরকের নাম (From Name)' : 'Sender Display Name'} *
                    </label>
                    <Input
                      value={smtpData.fromName}
                      onChange={(e) => setSmtpData({ ...smtpData, fromName: e.target.value })}
                      placeholder="KHS Alumni Association"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isBn ? 'প্রেরক ইমেইল (From Email)' : 'From Email Address'} *
                      </label>
                      <Input
                        type="email"
                        value={smtpData.fromEmail}
                        onChange={(e) => setSmtpData({ ...smtpData, fromEmail: e.target.value })}
                        placeholder="noreply@khsalumni.org"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isBn ? 'উত্তর প্রেরণের ইমেইল (Reply-To)' : 'Reply-To Email'}
                      </label>
                      <Input
                        type="email"
                        value={smtpData.replyTo}
                        onChange={(e) => setSmtpData({ ...smtpData, replyTo: e.target.value })}
                        placeholder="info@khsalumni.org"
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isBn ? 'Gmail ব্যবহারকারীদের জন্য গুরুত্বপূর্ণ টিপ:' : 'Gmail App Password Guide:'}</span>
                    </div>
                    <p>
                      {isBn
                        ? 'Gmail এ 2-Step Verification অন করে Google Account > Security > App Passwords থেকে ১৬ সংখ্যার অ্যাপ পাসওয়ার্ড তৈরি করে এখানে দিন।'
                        : 'If using Gmail with 2FA, generate a 16-character App Password under Google Account > Security > 2-Step Verification > App passwords.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Test Connection Card */}
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-slate-50 to-rose-50/20 dark:from-slate-900 dark:to-slate-800/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Send className="w-4 h-4 text-rose-600" />
                    <span>{isBn ? 'SMTP কানেকশন যাচাই করুন' : 'Test SMTP Connection'}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'বর্তমান সেটিংস যাচাই করতে যেকোনো ইমেইলে একটি পরীক্ষামূলক টেস্ট মেইল পাঠান।'
                      : 'Send a live verification test email to verify credentials and connectivity.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      type="email"
                      placeholder={isBn ? 'পরীক্ষার জন্য ইমেইল লিখুন...' : 'Enter test recipient email...'}
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      disabled={testingSmtp || !testRecipient}
                      onClick={handleTestSmtp}
                      className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 rounded-xl shrink-0 h-10 px-4 shadow-sm"
                    >
                      {testingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{testingSmtp ? (isBn ? 'পাঠানো হচ্ছে...' : 'Testing...') : (isBn ? 'টেস্ট মেইল পাঠান' : 'Send Test')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isBn ? 'প্রিভিউ কন্ট্রোল:' : 'Preview Controls:'}
              </span>
              <div className="flex items-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewLocale('bn')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewLocale === 'bn'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLocale('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewLocale === 'en'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm"
              >
                {previewTheme === 'dark' ? '☀️ Switch Light Header' : '🌙 Switch Dark Header'}
              </button>
            </div>
          </div>

          {/* Header Live Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{isBn ? '১. হেডার ও ব্র্যান্ডিং প্রিভিউ' : '1. Header & Navigation Preview'}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">● Real-time Live</span>
            </div>

            <div
              className={`rounded-2xl border transition-colors shadow-md overflow-hidden ${
                previewTheme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-900 via-primary-700 to-primary-500 text-white flex items-center justify-center shadow-md border border-primary-400/30 overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-amber-300" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight leading-tight">
                      {previewSiteName || 'Alumni Association'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
                      {previewTagline || 'Legacy & Network'}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
                  <span className="text-primary font-bold">{previewLocale === 'bn' ? 'হোম' : 'Home'}</span>
                  <span>{previewLocale === 'bn' ? 'ডিরেক্টরি' : 'Directory'}</span>
                  <span>{previewLocale === 'bn' ? 'রক্তদাতা' : 'Blood Donors'}</span>
                  <span>{previewLocale === 'bn' ? 'ইভেন্টস' : 'Events'}</span>
                  <span>{previewLocale === 'bn' ? 'নিউজ' : 'News'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Live Preview */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{isBn ? '২. হোমপেজ হিরো ব্যানার প্রিভিউ' : '2. Homepage Hero Banner Preview'}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">● Real-time Live</span>
            </div>

            <div
              className={`rounded-3xl border transition-colors shadow-lg overflow-hidden p-8 sm:p-12 text-center space-y-6 ${
                previewTheme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 text-white'
                  : 'bg-gradient-to-b from-primary-50/60 to-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 border border-primary/20 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {previewLocale === 'bn'
                    ? formData.heroBadge_bn || DEFAULT_SITE_SETTINGS.heroBadge_bn
                    : formData.heroBadge_en || DEFAULT_SITE_SETTINGS.heroBadge_en}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl mx-auto">
                {previewLocale === 'bn'
                  ? formData.heroTitle_bn || DEFAULT_SITE_SETTINGS.heroTitle_bn
                  : formData.heroTitle_en || DEFAULT_SITE_SETTINGS.heroTitle_en}
              </h2>

              <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${previewTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {previewLocale === 'bn'
                  ? formData.heroSubtitle_bn || DEFAULT_SITE_SETTINGS.heroSubtitle_bn
                  : formData.heroSubtitle_en || DEFAULT_SITE_SETTINGS.heroSubtitle_en}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {previewLocale === 'bn'
                      ? formData.heroPrimaryBtnText_bn || 'প্রাক্তনদের খুঁজুন'
                      : formData.heroPrimaryBtnText_en || 'Explore Directory'}
                  </span>
                </div>
                <div className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${previewTheme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-300 bg-white text-slate-800'}`}>
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  <span>
                    {previewLocale === 'bn'
                      ? formData.heroSecondaryBtnText_bn || 'তহবিলে অনুদান দিন'
                      : formData.heroSecondaryBtnText_en || 'Support Endowment'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Live Preview */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{isBn ? '৩. ফুটার প্রিভিউ' : '3. Footer Live Preview'}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">● Real-time Live</span>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 text-slate-300 shadow-2xl p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand Col */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-slate-950" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-base text-white tracking-tight">
                        {previewSiteName}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {previewFooterTagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {previewAbout}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {formData.facebookUrl && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Facebook className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {formData.linkedinUrl && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Linkedin className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {formData.youtubeUrl && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {formData.websiteUrl && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick links placeholder */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {previewLocale === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
                  </h4>
                  <p className="text-xs text-slate-400">Directory • Donors • Events • News</p>
                </div>

                {/* Giving & Aid */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {previewLocale === 'bn' ? 'তহবিল ও রক্তদান' : 'Giving & Blood Aid'}
                  </h4>
                  <p className="text-xs text-slate-400">Development Fund • Blood Requests</p>
                </div>

                {/* Contact Secretariat */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {previewLocale === 'bn' ? 'সচিবালয়' : 'Contact Secretariat'}
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{formData.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{formData.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{formData.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright & Badge */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                <p>© {new Date().getFullYear()} {previewCopyright}</p>
                {formData.showCommunityBadge && (
                  <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{previewPrefix}</span>
                    <Heart className="w-3 h-3 fill-current text-rose-500" />
                    <span>{previewFor} <strong className="text-slate-200">{previewCommunity}</strong></span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Backup & Restore (Export & Import All Data) */}
      {activeTab === 'backup' && <BackupRestorePanel />}

      {/* Floating Save Bar (Only for editable configuration tabs) */}
      {activeTab !== 'backup' && activeTab !== 'preview' && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              {activeTab === 'smtp'
                ? (isBn ? 'SMTP কনফিগারেশন সংরক্ষণ করতে সেভ করুন।' : 'Click save to apply SMTP & email server configuration.')
                : (isBn ? 'পরিবর্তন করার পর সংরক্ষণ করুন' : 'Click save to apply changes globally across all pages.')}
            </span>
          </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={activeTab === 'smtp' ? () => applyPreset('gmail') : handleResetDefaults}
            className="text-xs border-slate-300 dark:border-slate-700 rounded-xl"
          >
            {isBn ? 'রিসেট' : 'Reset'}
          </Button>

          <Button
            type="button"
            onClick={() => (activeTab === 'smtp' ? handleSaveSmtp() : handleSave())}
            disabled={activeTab === 'smtp' ? smtpSaving : saving}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md"
          >
            {(activeTab === 'smtp' ? smtpSaving : saving) ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>
              {(activeTab === 'smtp' ? smtpSaving : saving)
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : (isBn ? 'সেভ করুন' : 'Save Settings')}
            </span>
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}

