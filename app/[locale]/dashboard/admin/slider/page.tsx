'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Type,
  AlignLeft,
  MousePointerClick,
} from 'lucide-react';

export default function AdminSliderPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showAlert, showConfirm, showToast } = useSweetAlert();

  const [slides, setSlides] = useState<any[]>([]);
  const [isSliderEnabled, setIsSliderEnabled] = useState(true);
  const [sliderShowTitle, setSliderShowTitle] = useState(true);
  const [sliderShowDescription, setSliderShowDescription] = useState(true);
  const [sliderShowButton, setSliderShowButton] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [displayToggleLoading, setDisplayToggleLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal form state (Badge and Secondary Button removed)
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    buttonText_en: 'Explore Directory',
    buttonText_bn: 'প্রাক্তনদের খুঁজুন',
    buttonLink: '/directory',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/slider');
      if (res.ok) {
        const data = await res.json();
        setSlides(data.slides || []);
        setIsSliderEnabled(data.isSliderEnabled !== false);
        setSliderShowTitle(data.sliderShowTitle !== false);
        setSliderShowDescription(data.sliderShowDescription !== false);
        setSliderShowButton(data.sliderShowButton !== false);
      }
    } catch (e) {
      console.error('Error fetching slides:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleToggleGlobalSlider = async () => {
    setToggleLoading(true);
    const nextState = !isSliderEnabled;
    try {
      const res = await fetch('/api/admin/slider/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSliderEnabled: nextState }),
      });
      if (res.ok) {
        setIsSliderEnabled(nextState);
        showToast(
          nextState
            ? (isBn ? 'স্লাইডার সফলভাবে সক্রিয় করা হয়েছে' : 'Slider enabled successfully')
            : (isBn ? 'স্লাইডার নিষ্ক্রিয় করা হয়েছে (স্ট্যাটিক হিরো দৃশ্যমান)' : 'Slider disabled (Static hero active)'),
          'success'
        );
      } else {
        showToast('Failed to update slider status', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error while toggling slider', 'error');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleToggleDisplayOption = async (
    key: 'sliderShowTitle' | 'sliderShowDescription' | 'sliderShowButton'
  ) => {
    setDisplayToggleLoading(key);
    const currentVal =
      key === 'sliderShowTitle'
        ? sliderShowTitle
        : key === 'sliderShowDescription'
        ? sliderShowDescription
        : sliderShowButton;
    const nextVal = !currentVal;

    try {
      const res = await fetch('/api/admin/slider/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: nextVal }),
      });

      if (res.ok) {
        if (key === 'sliderShowTitle') setSliderShowTitle(nextVal);
        if (key === 'sliderShowDescription') setSliderShowDescription(nextVal);
        if (key === 'sliderShowButton') setSliderShowButton(nextVal);

        const labels: Record<string, { en: string; bn: string }> = {
          sliderShowTitle: { en: 'Title display', bn: 'শিরোনাম প্রদর্শন' },
          sliderShowDescription: { en: 'Description display', bn: 'বিবরণ প্রদর্শন' },
          sliderShowButton: { en: 'Action Button display', bn: 'অ্যাকশন বোতাম প্রদর্শন' },
        };

        showToast(
          isBn
            ? `${labels[key].bn} ${nextVal ? 'চালু করা হয়েছে' : 'বন্ধ করা হয়েছে'}`
            : `${labels[key].en} ${nextVal ? 'enabled' : 'disabled'}`,
          'success'
        );
      } else {
        showToast('Failed to update display option', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error', 'error');
    } finally {
      setDisplayToggleLoading(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      buttonText_en: 'Explore Directory',
      buttonText_bn: 'প্রাক্তনদের খুঁজুন',
      buttonLink: '/directory',
      image: '',
      sortOrder: slides.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (slide: any) => {
    setEditingSlide(slide);
    setFormData({
      title_en: slide.title_en || '',
      title_bn: slide.title_bn || '',
      description_en: slide.description_en || '',
      description_bn: slide.description_bn || '',
      buttonText_en: slide.buttonText_en || '',
      buttonText_bn: slide.buttonText_bn || '',
      buttonLink: slide.buttonLink || '',
      image: slide.image || '',
      sortOrder: slide.sortOrder || 0,
      isActive: slide.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en || !formData.title_bn || !formData.description_en || !formData.description_bn) {
      showAlert({
        title: isBn ? 'তথ্য পূরণ করুন' : 'Missing Required Fields',
        text: isBn ? 'ইংরেজি ও বাংলা শিরোনাম এবং বিবরণ আবশ্যক।' : 'Title and Description in both English and Bengali are required.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const url = editingSlide ? `/api/admin/slider/${editingSlide._id}` : '/api/admin/slider';
      const method = editingSlide ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          editingSlide
            ? (isBn ? 'স্লাইড আপডেট সম্পন্ন হয়েছে' : 'Slide updated successfully')
            : (isBn ? 'নতুন স্লাইড যুক্ত করা হয়েছে' : 'New slide created successfully'),
          'success'
        );
        setModalOpen(false);
        fetchSlides();
      } else {
        showAlert({
          title: 'Error',
          text: data.error || 'Failed to save slide',
          type: 'error',
        });
      }
    } catch (e: any) {
      console.error(e);
      showAlert({
        title: 'Error',
        text: e.message || 'Network error',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = (id: string) => {
    showConfirm({
      title: isBn ? 'আপনি কি নিশ্চিত?' : 'Delete Slide?',
      text: isBn ? 'এই স্লাইডার আইটেমটি স্থায়ীভাবে মুছে ফেলা হবে।' : 'This slide item will be permanently deleted.',
      type: 'warning',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast(isBn ? 'স্লাইড মুছে ফেলা হয়েছে' : 'Slide deleted successfully', 'success');
            fetchSlides();
          } else {
            showToast('Failed to delete slide', 'error');
          }
        } catch (e) {
          console.error(e);
          showToast('Network error', 'error');
        }
      },
    });
  };

  const handleToggleItemActive = async (slide: any) => {
    const nextState = !slide.isActive;
    try {
      const res = await fetch(`/api/admin/slider/${slide._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
      if (res.ok) {
        setSlides((prev) =>
          prev.map((s) => (s._id === slide._id ? { ...s, isActive: nextState } : s))
        );
        showToast(
          nextState
            ? (isBn ? 'স্লাইড সক্রিয় করা হয়েছে' : 'Slide activated')
            : (isBn ? 'স্লাইড নিষ্ক্রিয় করা হয়েছে' : 'Slide deactivated'),
          'success'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isBn ? 'হোমপেজ ডাইনামিক স্লাইডার' : 'Homepage Dynamic Slider'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isBn ? 'হিরো স্লাইডার কনফিগারেশন' : 'Hero Slider Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isBn
              ? 'হোমপেজের শীর্ষ স্লাইডার সেকশন সক্রিয়/নিষ্ক্রিয় করুন, টাইটেল/বিবরণ/বোতাম প্রদর্শন নিয়ন্ত্রণ করুন ও নতুন স্লাইড ইমেজ তৈরি করুন।'
              : 'Enable or disable the dynamic homepage slider, control title/description/button visibility over slider images, and manage banner slides.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={fetchSlides}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 shadow-lg shadow-primary/20 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন স্লাইড যোগ করুন' : 'Add New Slide'}</span>
          </Button>
        </div>
      </div>

      {/* Global Slider Master Switch & Display Elements Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Global Master Switch */}
        <Card className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSliderEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {isBn ? 'স্লাইডার মাস্টার সুইচ' : 'Slider Master Status'}
                </CardTitle>
              </div>
              <Badge variant={isSliderEnabled ? 'default' : 'secondary'} className="text-[11px]">
                {isSliderEnabled
                  ? (isBn ? 'সক্রিয়' : 'Enabled')
                  : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-2 text-slate-500">
              {isSliderEnabled
                ? (isBn
                    ? 'স্লাইডার ১ নম্বর সেকশনে প্রদর্শিত হচ্ছে।'
                    : 'Slider is currently active as the 1st section on public homepage.')
                : (isBn
                    ? 'স্লাইডার বন্ধ। ডিফল্ট সেন্টার্ড হিরো প্রদর্শিত হচ্ছে।'
                    : 'Slider is disabled. Centered hero is shown.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <Button
              onClick={handleToggleGlobalSlider}
              disabled={toggleLoading}
              variant={isSliderEnabled ? 'outline' : 'default'}
              className={`w-full text-xs gap-2 font-bold ${
                isSliderEnabled
                  ? 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSliderEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                  <span>{isBn ? 'স্লাইডার নিষ্ক্রিয় করুন' : 'Disable Slider'}</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>{isBn ? 'স্লাইডার সক্রিয় করুন' : 'Enable Slider'}</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Display Elements Overlay Controls */}
        <Card className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'স্লাইডারে টেক্সট উপাদান প্রদর্শন নিয়ন্ত্রণ' : 'Slider Display Elements Controls'}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'স্লাইডার ইমেজের উপর টাইটেল, বিবরণ বা বোতাম দেখাবেন কিনা তা আলাদাভাবে নিয়ন্ত্রণ করুন। কোনো টেক্সট সক্রিয় থাকলে টেক্সট স্পষ্ট দেখতে ব্যাকগ্রাউন্ড ইমেজে সূক্ষ্ম ব্লার যোগ হবে।'
                : 'Control whether Title, Description, or Action Button are overlaid on slider images. If active, a subtle background blur is applied for optimal readability.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Show Title */}
              <button
                onClick={() => handleToggleDisplayOption('sliderShowTitle')}
                disabled={displayToggleLoading === 'sliderShowTitle'}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  sliderShowTitle
                    ? 'border-primary-300 bg-primary-50/70 dark:bg-primary-950/30 dark:border-primary-800 ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${sliderShowTitle ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <Type className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sliderShowTitle ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {sliderShowTitle ? (isBn ? 'অন' : 'ON') : (isBn ? 'অফ' : 'OFF')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {isBn ? 'শিরোনাম (Title)' : 'Show Title'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {sliderShowTitle ? (isBn ? 'স্লাইডারে প্রদর্শিত হবে' : 'Visible on slider') : (isBn ? 'লুকানো থাকবে' : 'Hidden')}
                </div>
              </button>

              {/* Option 2: Show Description */}
              <button
                onClick={() => handleToggleDisplayOption('sliderShowDescription')}
                disabled={displayToggleLoading === 'sliderShowDescription'}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  sliderShowDescription
                    ? 'border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${sliderShowDescription ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <AlignLeft className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sliderShowDescription ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {sliderShowDescription ? (isBn ? 'অন' : 'ON') : (isBn ? 'অফ' : 'OFF')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {isBn ? 'বিবরণ (Description)' : 'Show Description'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {sliderShowDescription ? (isBn ? 'স্লাইডারে প্রদর্শিত হবে' : 'Visible on slider') : (isBn ? 'লুকানো থাকবে' : 'Hidden')}
                </div>
              </button>

              {/* Option 3: Show Button */}
              <button
                onClick={() => handleToggleDisplayOption('sliderShowButton')}
                disabled={displayToggleLoading === 'sliderShowButton'}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  sliderShowButton
                    ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${sliderShowButton ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sliderShowButton ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {sliderShowButton ? (isBn ? 'অন' : 'ON') : (isBn ? 'অফ' : 'OFF')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {isBn ? 'বোতাম (Button)' : 'Show Button'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {sliderShowButton ? (isBn ? 'স্লাইডারে প্রদর্শিত হবে' : 'Visible on slider') : (isBn ? 'লুকানো থাকবে' : 'Hidden')}
                </div>
              </button>

            </div>
          </CardContent>
        </Card>

      </div>

      {/* Slide Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'স্লাইডার আইটেম তালিকা' : 'Slide Items'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {isBn ? `${toBengaliNumerals(slides.length)} টি` : `${slides.length} Items`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <span>Loading slides...</span>
          </div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <Sliders className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isBn ? 'কোনো স্লাইডার আইটেম পাওয়া যায়নি' : 'No Slide Items Configured'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isBn
                ? 'হোমপেজে স্লাইডার চালাতে অন্তত একটি স্লাইড যোগ করুন।'
                : 'Add a new slide to display dynamic promotional content on the homepage.'}
            </p>
            <Button onClick={handleOpenCreateModal} size="sm" className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রথম স্লাইড তৈরি করুন' : 'Create First Slide'}</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {slides.map((slide, index) => (
              <Card
                key={slide._id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  slide.isActive
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
                }`}
              >
                <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Slide Order Badge */}
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0 border border-primary/20">
                      #{slide.sortOrder || index + 1}
                    </div>

                    {/* Preview Thumbnail if present */}
                    {slide.image && (
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Slide Information */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {slide.title_en}
                        </h4>
                        <Badge variant={slide.isActive ? 'default' : 'secondary'} className="text-[10px]">
                          {slide.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">বাংলা: </span>
                        {slide.title_bn}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1">
                        {slide.description_en}
                      </p>

                      {slide.buttonLink && (
                        <div className="pt-1 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium text-slate-600 dark:text-slate-300">Button:</span>
                            {slide.buttonText_en || 'Explore'} ({slide.buttonLink})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleItemActive(slide)}
                      title={slide.isActive ? 'Deactivate' : 'Activate'}
                      className={`p-2 rounded-xl border text-xs transition-colors ${
                        slide.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800'
                          : 'border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <Button
                      onClick={() => handleOpenEditModal(slide)}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 h-8 rounded-xl font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                    </Button>

                    <Button
                      onClick={() => handleDeleteSlide(slide._id)}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 h-8 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Slide Modal (Badge and Secondary Button removed) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSlide
                      ? (isBn ? 'স্লাইডার সম্পাদনা করুন' : 'Edit Slider Item')
                      : (isBn ? 'নতুন স্লাইডার তৈরি করুন' : 'Create New Slider Item')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'দ্বিভাষিক শিরোনাম, বিবরণ, বোতাম ও ব্যাকগ্রাউন্ড ইমেজ দিন' : 'Configure bilingual headlines, description, button, and image'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSlide} className="space-y-4">
              
              {/* Title EN & BN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Headline Title (English) *
                  </label>
                  <Input
                    required
                    placeholder="Building Lifelong Bonds & Global Opportunities"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="text-xs rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    শিরোনাম (বাংলা) *
                  </label>
                  <Input
                    required
                    placeholder="আজীবন সৌহার্দ্য ও বিশ্বমানের সুযোগের মেলবন্ধন"
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    className="text-xs rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Description EN & BN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Description (English) *
                  </label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Participate in annual reunions, mentorship programs, student emergency relief..."
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    বিবরণ (বাংলা) *
                  </label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="বার্ষিক পুনর্মিলনী, মেন্টরশিপ প্রোগ্রাম ও সেবামূলক উদ্যোগে অংশ নিন..."
                    value={formData.description_bn}
                    onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* CTA Action Button Configuration (Single Action Button) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'অ্যাকশন বোতাম কনফিগারেশন' : 'Action Button Configuration'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Button Text (EN)
                    </label>
                    <Input
                      placeholder="Explore Directory"
                      value={formData.buttonText_en}
                      onChange={(e) => setFormData({ ...formData, buttonText_en: e.target.value })}
                      className="text-xs rounded-xl h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      বোতামের লেখা (বাংলা)
                    </label>
                    <Input
                      placeholder="প্রাক্তনদের খুঁজুন"
                      value={formData.buttonText_bn}
                      onChange={(e) => setFormData({ ...formData, buttonText_bn: e.target.value })}
                      className="text-xs rounded-xl h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Target Link
                    </label>
                    <Input
                      placeholder="/directory"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="text-xs rounded-xl h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Slide Background Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isBn ? 'স্লাইড ব্যাকগ্রাউন্ড কভার ইমেজ' : 'Slide Background Cover Image'}
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  shape="rectangle"
                  helperText={isBn ? 'স্লাইডার ব্যানার ইমেজ আপলোড করুন' : 'Upload slide banner image (1920x600 recommended)'}
                />
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'ক্রমিক নম্বর (Sort Order)' : 'Sort Order'}
                  </label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="text-xs rounded-xl h-8"
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-end">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'সক্রিয় থাকবে' : 'Active Status'}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 rounded-xl font-bold"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Slide')}</span>
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
