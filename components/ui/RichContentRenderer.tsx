'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Quote as QuoteIcon,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SectionBlock } from './SectionBuilder';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export function RichContentRenderer({ content, className }: RichContentRendererProps) {
  if (!content) return null;

  // 1. Try parsing structured SectionBlock[] JSON from Elementor-style builder
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) {
        return (
          <div className={cn('rich-content-container space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed', className)}>
            {renderSectionBlocks(parsed as SectionBlock[])}
          </div>
        );
      }
    }
  } catch (e) {
    // Not valid JSON, fallback to HTML / Markdown parsing
  }

  // 2. Render HTML safely if content contains HTML tags
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    return (
      <div
        className={cn(
          'rich-content-container text-slate-700 dark:text-slate-300 leading-relaxed space-y-4',
          className
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeAndEnhanceHtml(content) }}
      />
    );
  }

  // 3. Otherwise, parse markdown / formatted text
  return (
    <div className={cn('rich-content-container space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed', className)}>
      {parseFormattedText(content)}
    </div>
  );
}

/**
 * Renders structured SectionBlock components (Elementor-style modular components)
 */
function renderSectionBlocks(blocks: SectionBlock[]): React.ReactNode {
  return blocks.map((block, idx) => {
    switch (block.type) {
      case 'heading': {
        const level = block.headingLevel || 'h2';
        const text = block.headingText || '';
        if (!text) return null;

        if (level === 'h1') {
          return (
            <h1
              key={block.id || idx}
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-3.5 flex items-center gap-3"
            >
              <span className="w-2.5 h-8 rounded-full bg-primary inline-block shrink-0 shadow-xs" />
              <span>{renderInline(text)}</span>
            </h1>
          );
        }
        if (level === 'h2') {
          return (
            <h2
              key={block.id || idx}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-7 mb-3 tracking-tight flex items-center gap-2.5"
            >
              <span className="w-2 h-6 rounded-full bg-amber-500 inline-block shrink-0 shadow-xs" />
              <span>{renderInline(text)}</span>
            </h2>
          );
        }
        if (level === 'h3') {
          return (
            <h3
              key={block.id || idx}
              className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-400 mt-6 mb-2.5 flex items-center gap-2"
            >
              <span className="w-1.5 h-5 rounded-full bg-primary/60 inline-block shrink-0" />
              <span>{renderInline(text)}</span>
            </h3>
          );
        }
        if (level === 'h4') {
          return (
            <h4
              key={block.id || idx}
              className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2 flex items-center gap-2"
            >
              <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span>{renderInline(text)}</span>
            </h4>
          );
        }
        if (level === 'h5') {
          return (
            <h5
              key={block.id || idx}
              className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-4 mb-1.5"
            >
              {renderInline(text)}
            </h5>
          );
        }
        return (
          <h6
            key={block.id || idx}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-3 mb-1"
          >
            {renderInline(text)}
          </h6>
        );
      }

      case 'paragraph': {
        if (!block.paragraphText) return null;
        return (
          <p
            key={block.id || idx}
            className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 my-4"
          >
            {renderInline(block.paragraphText)}
          </p>
        );
      }

      case 'title_content': {
        if (!block.boxTitle && !block.boxContent) return null;
        return (
          <div
            key={block.id || idx}
            className="my-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-850 dark:to-amber-950/20 border border-amber-500/20 shadow-xs space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-amber-500" />
            {block.boxTitle && (
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{renderInline(block.boxTitle)}</span>
              </h4>
            )}
            {block.boxContent && (
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {renderInline(block.boxContent)}
              </p>
            )}
            {block.boxLinkUrl && (
              <div className="pt-2">
                <a
                  href={block.boxLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs hover:shadow-amber-500/20 transition-all"
                >
                  <span>{block.boxLinkText || 'Learn More'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        );
      }

      case 'list': {
        const items = block.listItems || [];
        if (items.length === 0) return null;

        if (block.listType === 'numbered') {
          return (
            <ol key={block.id || idx} className="my-5 space-y-3">
              {items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-3 text-base sm:text-lg text-slate-700 dark:text-slate-300"
                >
                  <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                    {itemIdx + 1}
                  </span>
                  <span className="pt-0.5">{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.listType === 'checklist') {
          return (
            <div key={block.id || idx} className="my-5 space-y-2.5">
              {items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-base sm:text-lg text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{renderInline(item)}</span>
                </div>
              ))}
            </div>
          );
        }

        // Bullet List (UL)
        return (
          <ul key={block.id || idx} className="my-5 pl-2 space-y-2.5">
            {items.map((item, itemIdx) => (
              <li
                key={itemIdx}
                className="flex items-start gap-3 text-base sm:text-lg text-slate-700 dark:text-slate-300"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-xs" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      }

      case 'quote': {
        if (!block.quoteText) return null;
        return (
          <div
            key={block.id || idx}
            className="my-7 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary space-y-2.5 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <QuoteIcon className="w-6 h-6 text-primary/60 shrink-0 mt-1" />
              <div className="space-y-2">
                <blockquote className="text-base sm:text-lg italic font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {renderInline(block.quoteText)}
                </blockquote>
                {block.quoteAuthor && (
                  <p className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-wider">
                    — {block.quoteAuthor}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'image': {
        if (!block.imageUrl) return null;
        return (
          <div key={block.id || idx} className="my-6 space-y-2 text-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src={block.imageUrl}
                alt={block.imageCaption || 'Section visual'}
                className="w-full h-auto max-h-[480px] object-cover mx-auto"
              />
            </div>
            {block.imageCaption && (
              <p className="text-xs text-slate-500 italic">
                {block.imageCaption}
              </p>
            )}
          </div>
        );
      }

      case 'divider': {
        return (
          <div key={block.id || idx} className="my-8 flex items-center justify-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          </div>
        );
      }

      default:
        return null;
    }
  });
}

/**
 * Clean & enhance raw HTML strings with tailored Tailwind styling classes for all elements
 */
function sanitizeAndEnhanceHtml(html: string): string {
  if (!html) return '';

  let enhanced = html
    // Headings H1 - H6
    .replace(
      /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi,
      '<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2"><span class="w-2 h-7 rounded-full bg-primary inline-block"></span>$1</h1>'
    )
    .replace(
      /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi,
      '<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-7 mb-3.5 tracking-tight flex items-center gap-2"><span class="w-1.5 h-6 rounded-full bg-amber-500 inline-block"></span>$1</h2>'
    )
    .replace(
      /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi,
      '<h3 class="text-xl sm:text-2xl font-bold text-primary dark:text-primary-400 mt-6 mb-2.5">$1</h3>'
    )
    .replace(
      /<h4\b[^>]*>([\s\S]*?)<\/h4>/gi,
      '<h4 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2">$1</h4>'
    )
    .replace(
      /<h5\b[^>]*>([\s\S]*?)<\/h5>/gi,
      '<h5 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h5>'
    )
    .replace(
      /<h6\b[^>]*>([\s\S]*?)<\/h6>/gi,
      '<h6 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-4 mb-1.5">$1</h6>'
    )
    // Paragraphs
    .replace(
      /<p\b[^>]*>([\s\S]*?)<\/p>/gi,
      '<p class="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 my-4">$1</p>'
    )
    // Bold / Strong
    .replace(
      /<strong\b[^>]*>([\s\S]*?)<\/strong>/gi,
      '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>'
    )
    .replace(
      /<b\b[^>]*>([\s\S]*?)<\/b>/gi,
      '<b class="font-bold text-slate-900 dark:text-white">$1</b>'
    )
    // Underline
    .replace(
      /<u\b[^>]*>([\s\S]*?)<\/u>/gi,
      '<u class="underline decoration-primary/70 decoration-2 underline-offset-4 font-medium">$1</u>'
    )
    // Italic
    .replace(
      /<em\b[^>]*>([\s\S]*?)<\/em>/gi,
      '<em class="italic text-slate-800 dark:text-slate-200">$1</em>'
    )
    .replace(
      /<i\b[^>]*>([\s\S]*?)<\/i>/gi,
      '<i class="italic text-slate-800 dark:text-slate-200">$1</i>'
    )
    // Lists & List Items
    .replace(
      /<ul\b[^>]*>([\s\S]*?)<\/ul>/gi,
      '<ul class="my-5 pl-2 space-y-2.5 list-none">$1</ul>'
    )
    .replace(
      /<ol\b[^>]*>([\s\S]*?)<\/ol>/gi,
      '<ol class="my-5 pl-2 space-y-3 list-none counter-reset">$1</ol>'
    )
    .replace(
      /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
      '<li class="flex items-start gap-2.5 text-base sm:text-lg text-slate-700 dark:text-slate-300"><span class="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></span><span>$1</span></li>'
    )
    // Links
    .replace(
      /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
      '<a $1 class="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/40 inline-flex items-center gap-1 transition-colors" target="_blank" rel="noopener noreferrer">$2</a>'
    )
    // Blockquote
    .replace(
      /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi,
      '<blockquote class="p-4 sm:p-5 my-6 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-2xl text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">$1</blockquote>'
    )
    // Divider
    .replace(
      /<hr\b[^>]*>/gi,
      '<hr class="my-8 border-t border-slate-200 dark:border-slate-800" />'
    )
    // Highlights
    .replace(
      /<mark\b[^>]*>([\s\S]*?)<\/mark>/gi,
      '<mark class="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg font-medium">$1</mark>'
    );

  return enhanced;
}

/**
 * Parses markdown / formatted plain text into rich React elements
 */
function parseFormattedText(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // H1
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
          <span className="w-2 h-7 rounded-full bg-primary inline-block" />
          <span>{renderInline(trimmed.slice(2))}</span>
        </h1>
      );
    }

    // H2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-7 mb-3.5 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block" />
          <span>{renderInline(trimmed.slice(3))}</span>
        </h2>
      );
    }

    // H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-400 mt-6 mb-2.5">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
    }

    // H4
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2">
          {renderInline(trimmed.slice(5))}
        </h4>
      );
    }

    // H5
    if (trimmed.startsWith('##### ')) {
      return (
        <h5 key={idx} className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">
          {renderInline(trimmed.slice(6))}
        </h5>
      );
    }

    // H6
    if (trimmed.startsWith('###### ')) {
      return (
        <h6 key={idx} className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-4 mb-1.5">
          {renderInline(trimmed.slice(7))}
        </h6>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} className="p-4 sm:p-5 my-6 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-2xl text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
    }

    // Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return <hr key={idx} className="my-8 border-t border-slate-200 dark:border-slate-800" />;
    }

    // Unordered List
    if (trimmed.split('\n').every((l) => /^[*-]\s/.test(l.trim()))) {
      const items = trimmed.split('\n').map((l) => l.trim().replace(/^[*-]\s+/, ''));
      return (
        <ul key={idx} className="my-5 pl-2 space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base sm:text-lg text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Ordered List
    if (trimmed.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
      const items = trimmed.split('\n').map((l) => l.trim().replace(/^\d+\.\s+/, ''));
      return (
        <ol key={idx} className="my-5 pl-2 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-slate-700 dark:text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Regular paragraph
    return (
      <p key={idx} className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 my-4">
        {renderInline(trimmed)}
      </p>
    );
  });
}

/**
 * Handles inline formatting: **bold**, *italic*, <u>underline</u>, [links](url), <mark>, etc.
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by markdown link pattern [text](url) or bold **text** or italic *text*
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Markdown link: [Title](URL)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // Bold: **text** or <b>text</b> or <strong>text</strong>
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*|<b>([\s\S]*?)<\/b>|<strong>([\s\S]*?)<\/strong>/);
    // Underline: <u>text</u>
    const underlineMatch = remaining.match(/<u>([\s\S]*?)<\/u>/);
    // Italic: *text* or <i>text</i> or <em>text</em>
    const italicMatch = remaining.match(/\*([^*]+)\*|<i>([\s\S]*?)<\/i>|<em>([\s\S]*?)<\/em>/);

    // Find earliest match
    const matches = [
      linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      underlineMatch ? { type: 'underline', match: underlineMatch, index: underlineMatch.index! } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
    ].filter(Boolean) as Array<{ type: string; match: RegExpMatchArray; index: number }>;

    if (matches.length === 0) {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Push text before match
    if (earliest.index > 0) {
      parts.push(<span key={keyIdx++}>{remaining.slice(0, earliest.index)}</span>);
    }

    if (earliest.type === 'link') {
      const linkText = earliest.match[1];
      const linkUrl = earliest.match[2];
      parts.push(
        <a
          key={keyIdx++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/40 inline-flex items-center gap-1 transition-colors"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      );
    } else if (earliest.type === 'bold') {
      const boldText = earliest.match[1] || earliest.match[2] || earliest.match[3];
      parts.push(
        <strong key={keyIdx++} className="font-bold text-slate-900 dark:text-white">
          {boldText}
        </strong>
      );
    } else if (earliest.type === 'underline') {
      const uText = earliest.match[1];
      parts.push(
        <u key={keyIdx++} className="underline decoration-primary/70 decoration-2 underline-offset-4 font-medium">
          {uText}
        </u>
      );
    } else if (earliest.type === 'italic') {
      const itText = earliest.match[1] || earliest.match[2] || earliest.match[3];
      parts.push(
        <em key={keyIdx++} className="italic text-slate-800 dark:text-slate-200">
          {itText}
        </em>
      );
    }

    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return <>{parts}</>;
}

