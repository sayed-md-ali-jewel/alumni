'use client';

import React, { useState, useEffect } from 'react';
import {
  Heading as HeadingIcon,
  Type,
  List as ListIcon,
  ListOrdered,
  CheckSquare,
  Quote,
  Layout,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
  Edit,
  Sparkles,
  Minus,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { cn } from '@/lib/utils';

export type SectionBlockType =
  | 'heading'
  | 'paragraph'
  | 'title_content'
  | 'list'
  | 'quote'
  | 'divider'
  | 'image';

export interface SectionBlock {
  id: string;
  type: SectionBlockType;
  // Heading properties
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  headingText?: string;
  headingSubtitle?: string;
  // Paragraph properties
  paragraphText?: string;
  // Title with Content properties
  boxTitle?: string;
  boxContent?: string;
  boxLinkText?: string;
  boxLinkUrl?: string;
  boxVariant?: 'card' | 'accent' | 'highlight';
  // List properties
  listType?: 'bullet' | 'numbered' | 'checklist';
  listItems?: string[];
  // Quote / Callout properties
  quoteText?: string;
  quoteAuthor?: string;
  quoteVariant?: 'quote' | 'alert' | 'info';
  // Image properties
  imageUrl?: string;
  imageCaption?: string;
}

export interface SectionBuilderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  isBn?: boolean;
  className?: string;
}

export function SectionBuilder({
  value,
  onChange,
  label,
  required = false,
  isBn = false,
  className,
}: SectionBuilderProps) {
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>('builder');

  // Parse existing content into structured SectionBlock array
  useEffect(() => {
    if (!value) {
      const initial: SectionBlock[] = [
        {
          id: `init-${Date.now()}`,
          type: 'paragraph',
          paragraphText: isBn
            ? 'এখানে আপনার বিস্তারিত তথ্য ও বিবরণ লিখুন...'
            : 'Write your detailed content and description here...',
        },
      ];
      setBlocks(initial);
      onChange(JSON.stringify(initial));
      return;
    }

    try {
      if (value.trim().startsWith('[') && value.trim().endsWith(']')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlocks(parsed);
          return;
        }
      }
    } catch (e) {
      // Not JSON, parse from raw text/HTML into blocks
    }

    // Convert raw text into blocks
    const convertedBlocks = convertRawTextToBlocks(value, isBn);
    setBlocks(convertedBlocks);
  }, [value, isBn]);

  // Update parent when blocks change
  const updateBlocksAndPropagate = (newBlocks: SectionBlock[]) => {
    setBlocks(newBlocks);
    onChange(JSON.stringify(newBlocks));
  };

  const addBlock = (type: SectionBlockType) => {
    const newBlock: SectionBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
    };

    switch (type) {
      case 'heading':
        newBlock.headingLevel = 'h2';
        newBlock.headingText = isBn ? 'নতুন সেকশন শিরোনাম' : 'Section Heading Title';
        break;
      case 'paragraph':
        newBlock.paragraphText = '';
        break;
      case 'title_content':
        newBlock.boxTitle = isBn ? 'বিশেষ অর্জন ও বিস্তারিত তথ্য' : 'Featured Highlight & Summary';
        newBlock.boxContent = isBn
          ? 'এখানে মূল বিষয়বস্তু, বিবরণ ও গুরুত্বপূর্ণ সিদ্ধান্ত উল্লেখ করুন।'
          : 'Detailed summary of this feature highlight, key initiative, or milestone.';
        newBlock.boxVariant = 'card';
        break;
      case 'list':
        newBlock.listType = 'bullet';
        newBlock.listItems = [
          isBn ? 'প্রথম গুরুত্বপূর্ণ বিষয় বা এজেন্ডা' : 'Key Highlight / Agenda Item 1',
          isBn ? 'দ্বিতীয় গুরুত্বপূর্ণ বিষয় বা এজেন্ডা' : 'Key Highlight / Agenda Item 2',
        ];
        break;
      case 'quote':
        newBlock.quoteText = isBn
          ? '"আমাদের প্রাক্তনদের ঐক্য ও মেলবন্ধন আগামী প্রজন্মের জন্য এক অনন্য প্রেরণা।"'
          : '"Our alumni legacy continues to empower and guide future generations of excellence."';
        newBlock.quoteAuthor = isBn ? 'সভাপতি, অ্যালামনাই অ্যাসোসিয়েশন' : 'President, Alumni Association';
        newBlock.quoteVariant = 'quote';
        break;
      case 'image':
        newBlock.imageUrl = '';
        newBlock.imageCaption = '';
        break;
      case 'divider':
        break;
    }

    const updated = [...blocks, newBlock];
    updateBlocksAndPropagate(updated);
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    updateBlocksAndPropagate(updated.length > 0 ? updated : []);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateBlocksAndPropagate(updated);
  };

  const duplicateBlock = (block: SectionBlock) => {
    const cloned: SectionBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const updated = [...blocks, cloned];
    updateBlocksAndPropagate(updated);
  };

  const updateBlockProp = (id: string, prop: keyof SectionBlock, val: any) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, [prop]: val };
      }
      return b;
    });
    updateBlocksAndPropagate(updated);
  };

  const updateListItem = (blockId: string, itemIdx: number, val: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        const items = [...(b.listItems || [])];
        items[itemIdx] = val;
        return { ...b, listItems: items };
      }
      return b;
    });
    updateBlocksAndPropagate(updated);
  };

  const addListItem = (blockId: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        const items = [...(b.listItems || []), ''];
        return { ...b, listItems: items };
      }
      return b;
    });
    updateBlocksAndPropagate(updated);
  };

  const removeListItem = (blockId: string, itemIdx: number) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        const items = (b.listItems || []).filter((_, i) => i !== itemIdx);
        return { ...b, listItems: items };
      }
      return b;
    });
    updateBlocksAndPropagate(updated);
  };

  // Quick Preset Templates
  const loadPresetTemplate = (preset: 'article' | 'schedule' | 'spotlight') => {
    let newBlocks: SectionBlock[] = [];

    if (preset === 'article') {
      newBlocks = [
        {
          id: 'b1',
          type: 'heading',
          headingLevel: 'h2',
          headingText: isBn ? 'মূল পটভূমি ও প্রেক্ষাপট' : 'Key Background & Context',
        },
        {
          id: 'b2',
          type: 'paragraph',
          paragraphText: isBn
            ? 'আমাদের বিশ্ববিদ্যালয়ের প্রাক্তনদের প্রত্যক্ষ অর্থায়ন ও কারিগরি সহায়তায় নির্মিত হলো বিশ্বমানের এই নতুন সুবিধা। এটি শিক্ষার্থীদের বাস্তব গবেষণায় যুগান্তকারী ভূমিকা পালন করবে।'
            : 'Built with the generous philanthropic endowment and direct technical mentorship of our alumni chapters, this landmark project marks a transformative milestone.',
        },
        {
          id: 'b3',
          type: 'title_content',
          boxTitle: isBn ? 'প্রকল্পের প্রধান সুবিধাসমূহ' : 'Key Facilities & Infrastructure',
          boxContent: isBn
            ? 'উন্নত হাই-পারফরম্যান্স কম্পিউটিং ক্লাস্টার, আধুনিক ল্যাবরেটরি এবং আন্তর্জাতিক এক্সচেঞ্জ প্রোগ্রাম।'
            : 'Equipped with cutting-edge computing servers, specialized labs, and dedicated incubator spaces for budding researchers.',
          boxLinkText: isBn ? 'সম্পূর্ণ প্রতিবেদন দেখুন' : 'Explore Initiative',
          boxLinkUrl: 'https://alumni.ac.bd',
          boxVariant: 'card',
        },
        {
          id: 'b4',
          type: 'list',
          listType: 'bullet',
          listItems: [
            isBn ? 'আন্তর্জাতিক মানসম্পন্ন গবেষণা ফেলোশিপ প্রদান' : 'Annual international research fellowships',
            isBn ? 'সরাসরি প্রাক্তন স্কলার ও বিজ্ঞানীদের সাথে মেন্টরশিপ' : 'Direct mentorship with renowned alumni scientists & industry leaders',
            isBn ? 'নতুন উদ্ভাবনের জন্য পেটেন্ট ও স্টার্টআপ ফান্ডিং' : 'Dedicated innovation grants and prototype incubation funding',
          ],
        },
        {
          id: 'b5',
          type: 'quote',
          quoteText: isBn
            ? '"আমাদের শিকড়ের প্রতি কৃতজ্ঞতা প্রকাশ এবং পরবর্তী প্রজন্মের পথ সুগম করাই আমাদের অ্যাসোসিয়েশনের মূল ব্রত।"'
            : '"Giving back to our alma mater and empowering future pioneers is the sacred pledge of our alumni family."',
          quoteAuthor: isBn ? 'সম্মানিত প্রধান অতিথি' : 'Keynote Patron, Alumni Association',
          quoteVariant: 'quote',
        },
      ];
    } else if (preset === 'schedule') {
      newBlocks = [
        {
          id: 's1',
          type: 'heading',
          headingLevel: 'h2',
          headingText: isBn ? 'ইভেন্টের বিস্তারিত সময়সূচী ও কর্মসূচি' : 'Official Event Itinerary & Schedule',
        },
        {
          id: 's2',
          type: 'paragraph',
          paragraphText: isBn
            ? 'সকল সম্মানিত নিবন্ধিত অ্যালামনাই সদস্যদের নির্ধারিত সময় অনুযায়ী কেন্দ্রীয় অডিটোরিয়ামে উপস্থিত থাকার জন্য বিনীতভাবে অনুরোধ করা হচ্ছে।'
            : 'All registered alumni members and distinguished guests are requested to arrive on time at the Central Auditorium.',
        },
        {
          id: 's3',
          type: 'list',
          listType: 'numbered',
          listItems: [
            isBn ? 'সকাল ০৯:০০ - ১০:০০ : আগমন, কিউআর কোড চেক-ইন ও প্রাতঃরাশ' : '09:00 AM - 10:00 AM : Check-in, Welcome Kit Collection & Breakfast',
            isBn ? 'সকাল ১০:০০ - ১২:০০ : উদ্বোধনী অধিবেশন ও প্রধান অতিথির ভাষণ' : '10:00 AM - 12:00 PM : Inaugural Plenary & Distinguished Keynote',
            isBn ? 'দুপুর ১২:০০ - ০১:৩০ : মধ্যাহ্নভোজ ও ব্যাচভিত্তিক নেটওয়ার্কিং' : '12:00 PM - 01:30 PM : Grand Alumni Banquet & Networking Lunch',
            isBn ? 'বিকাল ০২:০০ - ০৪:৩০ : স্মৃতিচারণ, সাংস্কৃতিক সন্ধ্যা ও সমাপনী বক্তব্য' : '02:00 PM - 04:30 PM : Reminiscence Session, Cultural Gala & Concluding Remarks',
          ],
        },
        {
          id: 's4',
          type: 'title_content',
          boxTitle: isBn ? 'জরুরি নির্দেশনা ও পার্কিং তথ্য' : 'Important Instructions & Parking Pass',
          boxContent: isBn
            ? 'অনুষ্ঠানে প্রবেশের জন্য আপনার ইমেইলে প্রেরিত ডিজিটাল পাস সাথে রাখুন। ক্যাম্পাস গেট-২ এ উন্মুক্ত পার্কিং সুবিধা রয়েছে।'
            : 'Please carry your digital admission ticket/pass. Free valet & covered parking is available at Campus Gate 2.',
          boxVariant: 'accent',
        },
      ];
    } else if (preset === 'spotlight') {
      newBlocks = [
        {
          id: 'p1',
          type: 'heading',
          headingLevel: 'h2',
          headingText: isBn ? 'প্রাক্তন কৃতি শিক্ষার্থীর বিশেষ অর্জন' : 'Distinguished Alumni Spotlight',
        },
        {
          id: 'p2',
          type: 'paragraph',
          paragraphText: isBn
            ? 'আন্তর্জাতিক পরিমণ্ডলে আমাদের বিদ্যালয়ের গৌরবময় ঐতিহ্যকে সমুন্নত রেখে যিনি নিরলসভাবে কাজ করে চলেছেন।'
            : 'Celebrating the outstanding global contributions, leadership, and community impact of our alumni pioneers.',
        },
        {
          id: 'p3',
          type: 'list',
          listType: 'checklist',
          listItems: [
            isBn ? 'গ্লোবাল ইনোভেশন লিডারশিপ অ্যাওয়ার্ড বিজয়ী' : 'Winner of Global Innovation Leadership Award',
            isBn ? '১০০+ নতুন শিক্ষার্থীর জন্য সম্পূর্ণ শিক্ষাবৃত্তি প্রদান' : 'Full endowment of 100+ student academic scholarships',
            isBn ? 'আন্তর্জাতিক জার্নালে শীর্ষস্থানীয় গবেষণা প্রকাশনা' : 'Author of top-cited international research publications',
          ],
        },
      ];
    }

    updateBlocksAndPropagate(newBlocks);
  };

  const getBlockHeaderInfo = (block: SectionBlock) => {
    switch (block.type) {
      case 'heading':
        return {
          title: isBn ? `হেডিং (${block.headingLevel?.toUpperCase() || 'H2'})` : `Heading (${block.headingLevel?.toUpperCase() || 'H2'})`,
          icon: HeadingIcon,
          color: 'text-primary bg-primary/10 border-primary/20',
        };
      case 'paragraph':
        return {
          title: isBn ? 'প্যারাগ্রাফ / সাধারণ লেখা' : 'Paragraph Text Block',
          icon: Type,
          color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        };
      case 'title_content':
        return {
          title: isBn ? 'টাইটেল ও বিস্তারিত কার্ড (Box)' : 'Title with Content Box',
          icon: Layout,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'list':
        return {
          title: isBn
            ? block.listType === 'numbered'
              ? 'নাম্বারযুক্ত তালিকা (OL)'
              : block.listType === 'checklist'
              ? 'চেকলিস্ট (Checklist)'
              : 'বুলেট তালিকা (UL)'
            : block.listType === 'numbered'
            ? 'Numbered List (OL)'
            : block.listType === 'checklist'
            ? 'Checklist Items'
            : 'Bullet List (UL)',
          icon: block.listType === 'numbered' ? ListOrdered : block.listType === 'checklist' ? CheckSquare : ListIcon,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'quote':
        return {
          title: isBn ? 'উদ্ধৃতি / হাইলাইট কলআউট' : 'Quote / Highlight Callout',
          icon: Quote,
          color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'image':
        return {
          title: isBn ? 'ছবি ও ক্যাপশন' : 'Image with Caption',
          icon: ImageIcon,
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        };
      case 'divider':
        return {
          title: isBn ? 'সেকশন ডিভাইডার' : 'Section Divider',
          icon: Minus,
          color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          {label && (
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{label}</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          <p className="text-[11px] text-slate-500">
            {isBn
              ? 'এলিমেন্টর-স্টাইল সেকশন বিল্ডার: আলাদা আলাদা হেডিং, প্যারাগ্রাফ, টাইটেল কার্ড ও তালিকা যুক্ত করুন।'
              : 'Elementor-style Section Builder: Compose content with modular Headings, Text, Feature Cards, and Lists.'}
          </p>
        </div>

        {/* View Mode Toggle & Preset buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Preset Dropdown/buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 uppercase tracking-wider">
              {isBn ? 'টেমপ্লেট:' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() => loadPresetTemplate('article')}
              className="px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              {isBn ? 'আর্টিকেল' : 'Article'}
            </button>
            <button
              type="button"
              onClick={() => loadPresetTemplate('schedule')}
              className="px-2 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
            >
              {isBn ? 'সময়সূচী' : 'Schedule'}
            </button>
            <button
              type="button"
              onClick={() => loadPresetTemplate('spotlight')}
              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              {isBn ? 'স্পটলাইট' : 'Spotlight'}
            </button>
          </div>

          {/* Builder vs Preview */}
          <div className="flex items-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'builder'
                  ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isBn ? 'সেকশন বিল্ডার' : 'Visual Builder'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Builder Mode */}
      {viewMode === 'builder' ? (
        <div className="space-y-4">
          {/* Section Blocks List */}
          <div className="space-y-3.5">
            {blocks.map((block, index) => {
              const headerInfo = getBlockHeaderInfo(block);
              const Icon = headerInfo.icon;

              return (
                <div
                  key={block.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all group"
                >
                  {/* Block Header & Action Controls */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border', headerInfo.color)}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{headerInfo.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">#{index + 1}</span>
                    </div>

                    {/* Controls: Up, Down, Duplicate, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === blocks.length - 1}
                        title="Move Down"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(block)}
                        title="Duplicate Section"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        title="Delete Section"
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Content Inputs */}
                  <div className="p-4 space-y-3.5">
                    {/* 1. HEADING BLOCK */}
                    {block.type === 'heading' && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{isBn ? 'হেডিং লেভেল:' : 'Heading Level:'}</span>
                          {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => updateBlockProp(block.id, 'headingLevel', lvl)}
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-black transition-all',
                                (block.headingLevel || 'h2') === lvl
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              )}
                            >
                              {lvl.toUpperCase()}
                            </button>
                          ))}
                        </div>

                        <Input
                          value={block.headingText || ''}
                          onChange={(e) => updateBlockProp(block.id, 'headingText', e.target.value)}
                          placeholder={isBn ? 'শিরোনাম লিখুন (যেমন: প্রকল্পের বিস্তারিত পটভূমি)...' : 'Enter section heading title...'}
                          className="rounded-xl text-sm font-bold"
                        />
                      </div>
                    )}

                    {/* 2. PARAGRAPH BLOCK */}
                    {block.type === 'paragraph' && (
                      <div className="space-y-1.5">
                        <Textarea
                          rows={3}
                          value={block.paragraphText || ''}
                          onChange={(e) => updateBlockProp(block.id, 'paragraphText', e.target.value)}
                          placeholder={
                            isBn
                              ? 'এখানে আপনার প্যারাগ্রাফ বা অনুচ্ছেদ লিখুন... (বোল্ড, আন্ডারলাইন, লিঙ্ক ইত্যাদি সাধারণ টেক্সট)'
                              : 'Write paragraph description text here...'
                          }
                          className="rounded-xl text-xs sm:text-sm leading-relaxed"
                        />
                      </div>
                    )}

                    {/* 3. TITLE WITH CONTENT (BOX / CARD) */}
                    {block.type === 'title_content' && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isBn ? 'বক্সের শিরোনাম (Title)' : 'Card / Box Title'} *
                          </label>
                          <Input
                            value={block.boxTitle || ''}
                            onChange={(e) => updateBlockProp(block.id, 'boxTitle', e.target.value)}
                            placeholder={isBn ? 'যেমন: প্রধান উদ্দেশ্য ও সুবিধা' : 'e.g. Key Facilities & Strategic Milestones'}
                            className="rounded-xl text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isBn ? 'বক্সের মূল বিবরণ (Content)' : 'Card Content Description'} *
                          </label>
                          <Textarea
                            rows={3}
                            value={block.boxContent || ''}
                            onChange={(e) => updateBlockProp(block.id, 'boxContent', e.target.value)}
                            placeholder={isBn ? 'কার্ডের ভেতরের বিস্তারিত বিবরণ...' : 'Detailed description inside this card...'}
                            className="rounded-xl text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500">
                              {isBn ? 'বাটন / লিঙ্কের টেক্সট (ঐচ্ছিক)' : 'Action Link Text (Optional)'}
                            </label>
                            <Input
                              value={block.boxLinkText || ''}
                              onChange={(e) => updateBlockProp(block.id, 'boxLinkText', e.target.value)}
                              placeholder="e.g. Learn More / রেজিস্টার করুন"
                              className="rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500">
                              {isBn ? 'লিঙ্ক URL (ঐচ্ছিক)' : 'Link URL (Optional)'}
                            </label>
                            <Input
                              value={block.boxLinkUrl || ''}
                              onChange={(e) => updateBlockProp(block.id, 'boxLinkUrl', e.target.value)}
                              placeholder="https://alumni.ac.bd/register"
                              className="rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. LIST BLOCK (UL / OL / Checklist) */}
                    {block.type === 'list' && (
                      <div className="space-y-3">
                        {/* List type selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{isBn ? 'তালিকার ধরন:' : 'List Style:'}</span>
                          <button
                            type="button"
                            onClick={() => updateBlockProp(block.id, 'listType', 'bullet')}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                              (block.listType || 'bullet') === 'bullet'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            )}
                          >
                            <ListIcon className="w-3.5 h-3.5" />
                            <span>{isBn ? 'বুলেট তালিকা (UL)' : 'Bullets (UL)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateBlockProp(block.id, 'listType', 'numbered')}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                              block.listType === 'numbered'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            )}
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                            <span>{isBn ? 'নাম্বারযুক্ত (OL)' : 'Numbered (OL)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateBlockProp(block.id, 'listType', 'checklist')}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                              block.listType === 'checklist'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            )}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{isBn ? 'চেকলিস্ট (Checklist)' : 'Checklist'}</span>
                          </button>
                        </div>

                        {/* List Items editor */}
                        <div className="space-y-2">
                          {(block.listItems || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                                {block.listType === 'numbered' ? itemIdx + 1 : block.listType === 'checklist' ? '✓' : '•'}
                              </span>
                              <Input
                                value={item}
                                onChange={(e) => updateListItem(block.id, itemIdx, e.target.value)}
                                placeholder={isBn ? `তালিকার আইটেম ${itemIdx + 1}...` : `List item #${itemIdx + 1}...`}
                                className="rounded-xl text-xs flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => removeListItem(block.id, itemIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addListItem(block.id)}
                            className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 rounded-xl"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isBn ? 'নতুন আইটেম যোগ করুন' : 'Add List Item'}</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 5. QUOTE / CALLOUT BLOCK */}
                    {block.type === 'quote' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isBn ? 'উদ্ধৃতি বা বক্তব্য (Quote Text)' : 'Quote / Highlight Message'} *
                          </label>
                          <Textarea
                            rows={3}
                            value={block.quoteText || ''}
                            onChange={(e) => updateBlockProp(block.id, 'quoteText', e.target.value)}
                            placeholder={isBn ? '"উদ্ধৃতি বা গুরুত্বপূর্ণ বক্তব্য লিখুন..."' : '"Quote or statement text..."'}
                            className="rounded-xl text-xs italic"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isBn ? 'বক্তা / উৎস (Author / Attribution)' : 'Author / Attribution (Optional)'}
                          </label>
                          <Input
                            value={block.quoteAuthor || ''}
                            onChange={(e) => updateBlockProp(block.id, 'quoteAuthor', e.target.value)}
                            placeholder="e.g. Dr. John Doe, President of Alumni Association"
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* 6. IMAGE BLOCK */}
                    {block.type === 'image' && (
                      <div className="space-y-3">
                        <ImageUpload
                          shape="rectangle"
                          value={block.imageUrl}
                          onChange={(url) => updateBlockProp(block.id, 'imageUrl', url)}
                          helperText={isBn ? 'সেকশনের ছবি আপলোড করুন' : 'Upload section image (JPG, PNG, WEBP)'}
                        />
                        <Input
                          value={block.imageCaption || ''}
                          onChange={(e) => updateBlockProp(block.id, 'imageCaption', e.target.value)}
                          placeholder={isBn ? 'ছবির ক্যাপশন (ঐচ্ছিক)...' : 'Image caption (Optional)...'}
                          className="rounded-xl text-xs"
                        />
                      </div>
                    )}

                    {/* 7. DIVIDER BLOCK */}
                    {block.type === 'divider' && (
                      <div className="py-2 text-center text-xs text-slate-400">
                        <hr className="border-t border-slate-200 dark:border-slate-800" />
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">
                          {isBn ? '― সেকশন ডিভাইডার রেখা ―' : '― Section Divider Line ―'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* "+ Add Section" Floating Toolbar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 via-primary-50/40 to-slate-100 dark:from-slate-900 dark:via-primary-950/20 dark:to-slate-900 border-2 border-dashed border-primary/30 space-y-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন সেকশন এলিমেন্ট যুক্ত করুন' : 'Add New Section Component'}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('heading')}
                className="gap-1.5 text-xs rounded-xl border-primary/40 bg-white dark:bg-slate-800 text-primary font-bold shadow-xs hover:bg-primary hover:text-white"
              >
                <HeadingIcon className="w-3.5 h-3.5" />
                <span>+ Heading (H1-H6)</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('paragraph')}
                className="gap-1.5 text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs hover:bg-slate-100"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ Paragraph</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('title_content')}
                className="gap-1.5 text-xs rounded-xl border-amber-400/50 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs hover:bg-amber-500 hover:text-slate-950"
              >
                <Layout className="w-3.5 h-3.5" />
                <span>+ Title with Content Card</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('list')}
                className="gap-1.5 text-xs rounded-xl border-emerald-400/50 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs hover:bg-emerald-600 hover:text-white"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>+ List (UL / OL)</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('quote')}
                className="gap-1.5 text-xs rounded-xl border-rose-400/50 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold shadow-xs hover:bg-rose-600 hover:text-white"
              >
                <Quote className="w-3.5 h-3.5" />
                <span>+ Quote / Callout</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('image')}
                className="gap-1.5 text-xs rounded-xl border-indigo-400/50 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs hover:bg-indigo-600 hover:text-white"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Image</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock('divider')}
                className="gap-1.5 text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs hover:bg-slate-100"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>+ Divider</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Live Render Preview Tab */
        <div className="p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-inner">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>{isBn ? 'লাইভ পেজ প্রিভিউ (ব্যবহারকারীরা যেমন দেখবে):' : 'Live Render Output (As seen on public page):'}</span>
            <span className="text-emerald-500">● Real-time</span>
          </div>

          <RichContentRenderer content={JSON.stringify(blocks)} />
        </div>
      )}
    </div>
  );
}

/**
 * Helper to convert raw legacy HTML / text into initial structured blocks
 */
function convertRawTextToBlocks(raw: string, isBn: boolean): SectionBlock[] {
  if (!raw) return [];

  const lines = raw.split(/\n\n+/);
  const blocks: SectionBlock[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('# ')) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'heading',
        headingLevel: 'h1',
        headingText: trimmed.replace(/^#\s+/, ''),
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'heading',
        headingLevel: 'h2',
        headingText: trimmed.replace(/^##\s+/, ''),
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'heading',
        headingLevel: 'h3',
        headingText: trimmed.replace(/^###\s+/, ''),
      });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'quote',
        quoteText: trimmed.replace(/^>\s+/, ''),
        quoteVariant: 'quote',
      });
    } else if (trimmed.split('\n').every((l) => /^[*-]\s/.test(l.trim()))) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'list',
        listType: 'bullet',
        listItems: trimmed.split('\n').map((l) => l.trim().replace(/^[*-]\s+/, '')),
      });
    } else if (trimmed.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
      blocks.push({
        id: `gen-${idx}`,
        type: 'list',
        listType: 'numbered',
        listItems: trimmed.split('\n').map((l) => l.trim().replace(/^\d+\.\s+/, '')),
      });
    } else {
      blocks.push({
        id: `gen-${idx}`,
        type: 'paragraph',
        paragraphText: trimmed,
      });
    }
  });

  return blocks.length > 0
    ? blocks
    : [
        {
          id: 'init-1',
          type: 'paragraph',
          paragraphText: raw,
        },
      ];
}
