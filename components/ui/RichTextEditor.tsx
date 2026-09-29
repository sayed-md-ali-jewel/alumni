'use client';

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Quote,
  Minus,
  Eye,
  Edit3,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  isBn?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  label,
  rows = 8,
  required = false,
  className,
  isBn = false,
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to wrap or insert text at cursor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultPlaceholder;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    const newValue = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleHeading = (level: number) => {
    insertFormatting(`<h${level}>`, `</h${level}>`, isBn ? `শিরোনাম স্তর ${level}` : `Heading Level ${level}`);
  };

  const handleBold = () => {
    insertFormatting('<b>', '</b>', isBn ? 'বোল্ড টেক্সট' : 'Bold Text');
  };

  const handleUnderline = () => {
    insertFormatting('<u>', '</u>', isBn ? 'আন্ডারলাইন টেক্সট' : 'Underlined Text');
  };

  const handleItalic = () => {
    insertFormatting('<i>', '</i>', isBn ? 'ইটালিক টেক্সট' : 'Italic Text');
  };

  const handleBulletList = () => {
    const sample = `\n<ul>\n  <li>${isBn ? 'প্রথম গুরুত্বপূর্ণ বিষয়' : 'Key Highlight Item 1'}</li>\n  <li>${isBn ? 'দ্বিতীয় গুরুত্বপূর্ণ বিষয়' : 'Key Highlight Item 2'}</li>\n  <li>${isBn ? 'তৃতীয় গুরুত্বপূর্ণ বিষয়' : 'Key Highlight Item 3'}</li>\n</ul>\n`;
    insertFormatting(sample, '', '');
  };

  const handleOrderedList = () => {
    const sample = `\n<ol>\n  <li>${isBn ? 'প্রথম ধাপ / এজেন্ডা' : 'Step 1 / Agenda Item 1'}</li>\n  <li>${isBn ? 'দ্বিতীয় ধাপ / এজেন্ডা' : 'Step 2 / Agenda Item 2'}</li>\n  <li>${isBn ? 'তৃতীয় ধাপ / এজেন্ডা' : 'Step 3 / Agenda Item 3'}</li>\n</ol>\n`;
    insertFormatting(sample, '', '');
  };

  const handleLink = () => {
    const url = prompt(isBn ? 'ওয়েবসাইট বা পেজের লিঙ্ক (URL) দিন:' : 'Enter Link URL:', 'https://');
    if (url) {
      insertFormatting(`<a href="${url}">`, '</a>', isBn ? 'ক্লিক করে বিস্তারিত দেখুন' : 'Learn More / Visit Link');
    }
  };

  const handleQuote = () => {
    insertFormatting(
      '<blockquote>\n  ',
      '\n</blockquote>\n',
      isBn ? '"আমাদের অ্যাসোসিয়েশন আমাদের সকলের গর্ব ও পরিচয়ের প্রতীক।"' : '"Our alumni network is the cornerstone of lifelong excellence and fellowship."'
    );
  };

  const handleDivider = () => {
    insertFormatting('\n<hr />\n', '', '');
  };

  const insertTemplate = (type: 'article' | 'schedule' | 'spotlight') => {
    let tpl = '';
    if (type === 'article') {
      tpl = isBn
        ? `<h2>অনুষ্ঠানের মূল পটভূমি ও অর্জন</h2>\n<p>এখানে বিস্তারিত পটভূমি ও ঘটনা বর্ণনা করুন। <b>বিশেষ অবদান</b> রেখেছেন আমাদের সম্মানিত সদস্যবৃন্দ।</p>\n\n<h3>মূল উল্লেখযোগ্য কার্যক্রম</h3>\n<ul>\n  <li>নতুন স্কলারশিপ তহবিলের আনুষ্ঠানিক উদ্বোধন।</li>\n  <li>আন্তর্জাতিক এক্সচেঞ্জ ফেলোশিপের ঘোষণা।</li>\n  <li>প্রাক্তন ও বর্তমান শিক্ষার্থীদের যৌথ প্রজেক্ট প্রদর্শনী।</li>\n</ul>\n\n<blockquote>"একতাবদ্ধ থাকলে আমাদের এই অ্যাসোসিয়েশন যেকোনো অসম্ভবকে সম্ভব করতে পারে।" - সভাপতি</blockquote>\n\n<p>আরো তথ্যের জন্য <a href="https://alumni.ac.bd">আমাদের পোর্টাল ভিজিট করুন</a>।</p>`
        : `<h2>Background & Key Milestones</h2>\n<p>Provide the detailed narrative of the news or event story here. <b>Special contributions</b> were recognized during the grand session.</p>\n\n<h3>Key Highlights & Initiatives</h3>\n<ul>\n  <li>Inauguration of the new Innovation Endowment Fund.</li>\n  <li>Announcement of the Global Alumni Fellowship program.</li>\n  <li>Interactive collaborative showcase between alumni & current students.</li>\n</ul>\n\n<blockquote>"United in our shared heritage, our community continues to inspire generations of future leaders."</blockquote>\n\n<p>For more details, <a href="https://alumni.ac.bd">visit the official platform</a>.</p>`;
    } else if (type === 'schedule') {
      tpl = isBn
        ? `<h2>ইভেন্টের বিস্তারিত সময়সূচী ও কর্মসূচি</h2>\n<p>সকল নিবন্ধিত সদস্যদের সময়মতো উপস্থিত থাকার জন্য বিনীত অনুরোধ জানানো হচ্ছে।</p>\n\n<ol>\n  <li><b>সকাল ০৯:০০ - ১০:০০ :</b> নিবন্ধন ও প্রাতঃরাশ</li>\n  <li><b>সকাল ১০:০০ - ১২:০০ :</b> উদ্বোধনী অধিবেশন ও প্রধান অতিথির বক্তব্য</li>\n  <li><b>দুপুর ১২:০০ - ০১:৩০ :</b> মধ্যাহ্নভোজ ও নেটওয়ার্কিং</li>\n  <li><b>বিকাল ০৩:০০ - ০৫:০০ :</b> সাংস্কৃতিক সন্ধ্যা ও সমাপনী বক্তব্য</li>\n</ol>`
        : `<h2>Detailed Event Agenda & Schedule</h2>\n<p>All registered alumni are cordially invited to attend according to the following timeline:</p>\n\n<ol>\n  <li><b>09:00 AM - 10:00 AM :</b> Registration & Welcome Breakfast</li>\n  <li><b>10:00 AM - 12:00 PM :</b> Keynote Plenary & Leadership Address</li>\n  <li><b>12:00 PM - 01:30 PM :</b> Alumni Banquet & Networking Session</li>\n  <li><b>03:00 PM - 05:00 PM :</b> Cultural Gala & Closing Ceremony</li>\n</ol>`;
    }
    onChange(tpl);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && '*'}
          </label>
          <span className="text-[11px] text-slate-400">
            {isBn ? 'HTML & Markdown সমর্থিত' : 'Supports HTML elements (H1-H6, lists, b, u, a)'}
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex flex-wrap items-center gap-1">
            {/* Headings Selector */}
            <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleHeading(1)}
                title="Heading 1"
                className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleHeading(2)}
                title="Heading 2"
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleHeading(3)}
                title="Heading 3"
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => handleHeading(4)}
                title="Heading 4"
                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                H4
              </button>
            </div>

            {/* Basic Text Formatting */}
            <div className="flex items-center gap-0.5 px-1 border-r border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={handleBold}
                title="Bold (<b>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Bold className="w-3.5 h-3.5 font-bold" />
              </button>
              <button
                type="button"
                onClick={handleUnderline}
                title="Underline (<u>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleItalic}
                title="Italic (<i>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lists & Structural Elements */}
            <div className="flex items-center gap-0.5 px-1 border-r border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={handleBulletList}
                title="Bullet List (<ul>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 text-xs"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">UL</span>
              </button>
              <button
                type="button"
                onClick={handleOrderedList}
                title="Numbered List (<ol>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 text-xs"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OL</span>
              </button>
              <button
                type="button"
                onClick={handleLink}
                title="Insert Link (<a>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleQuote}
                title="Blockquote"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDivider}
                title="Divider (<hr>)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Template Presets */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => insertTemplate('article')}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 flex items-center gap-1"
                title="Insert Sample Article Structure"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isBn ? 'আর্টিকেল টেমপ্লেট' : 'Article Template'}</span>
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('schedule')}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
                title="Insert Event Schedule Structure"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isBn ? 'শিডিউল টেমপ্লেট' : 'Schedule'}</span>
              </button>
            </div>
          </div>

          {/* Edit / Preview Tabs */}
          <div className="flex items-center rounded-xl bg-slate-200 dark:bg-slate-700 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{isBn ? 'লিখুন' : 'Write'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{isBn ? 'লাইভ প্রিভিউ' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Editor Body */}
        {viewMode === 'edit' ? (
          <Textarea
            ref={textareaRef}
            rows={rows}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder ||
              (isBn
                ? 'এখানে সম্পূর্ণ বিবরণ বা সংবাদ লিখুন... (শিরোনাম, তালিকা, বোল্ড, লিঙ্ক ইত্যাদি ব্যবহার করতে পারেন)'
                : 'Write complete content here. You can use Headings, bullet lists, numbered lists, bold, underline, links...')
            }
            className="w-full border-0 focus-visible:ring-0 rounded-none text-xs sm:text-sm font-mono leading-relaxed p-4 bg-transparent resize-y"
          />
        ) : (
          <div className="p-5 min-h-[160px] bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto max-h-96">
            {value ? (
              <RichContentRenderer content={value} />
            ) : (
              <p className="text-xs text-slate-400 italic">
                {isBn ? 'প্রিভিউ দেখতে কিছু লিখুন...' : 'No content to preview yet. Start typing in Write mode.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
