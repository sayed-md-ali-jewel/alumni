import React from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { NewsPost } from '@/models/NewsPost';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { FloatingSocialShareBar } from '@/components/shared/FloatingSocialShareBar';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  Newspaper,
  ChevronRight,
} from 'lucide-react';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  try {
    await connectToDatabase();
    const post = await NewsPost.findOne({ slug });
    if (!post) return { title: 'News Article | KHS Alumni' };

    const isBn = locale === 'bn';
    const title = isBn ? post.title_bn : post.title_en;
    const description = isBn ? post.summary_bn || post.title_bn : post.summary_en || post.title_en;

    return {
      title: `${title} | KHS Alumni`,
      description,
      openGraph: {
        title,
        description,
        images: post.image ? [{ url: post.image }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.image ? [post.image] : [],
      },
    };
  } catch (e) {
    return { title: 'News Article | KHS Alumni' };
  }
}

async function getArticle(slug: string) {
  try {
    await connectToDatabase();
    const post = await NewsPost.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('authorId', 'name image role');

    if (!post) return null;

    const related = await NewsPost.find({
      _id: { $ne: post._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3);

    return { post, related };
  } catch (e) {
    return null;
  }
}

export default async function NewsArticlePage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const data = await getArticle(slug);
  if (!data || !data.post) {
    notFound();
  }

  const post = data.post as any;
  const related = data.related as any[];
  const isBn = locale === 'bn';

  const title = isBn ? post.title_bn : post.title_en;
  const content = isBn ? post.content_bn : post.content_en;
  const summary = isBn ? post.summary_bn : post.summary_en;

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-4xl space-y-6 sm:space-y-8 relative">
      {/* Floating Sticky Social Share Bar (Desktop left vertical / Mobile bottom horizontal) */}
      {post.allowSharing !== false && (
        <FloatingSocialShareBar
          title={title}
          description={summary || content}
          locale={locale}
        />
      )}

      {/* Top Bar: Back button */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল সংবাদে ফিরে যান' : 'Back to News'}</span>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-primary text-white text-xs">{post.category}</Badge>
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 border-y border-slate-200 dark:border-slate-800 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Avatar src={post.authorId?.image} fallback={post.authorId?.name || 'AL'} size="sm" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{post.authorId?.name || 'Alumni Editor'}</span>
              <span className="mx-1.5">•</span>
              <span>{formatDate(post.publishedAt, locale)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views || 1} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {post.image && (
        <div className="relative h-48 xs:h-64 sm:h-96 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          <img src={post.image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Article Body Content */}
      <div className="p-4 xs:p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <RichContentRenderer content={content} />
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {isBn ? 'অন্যান্য সম্পর্কিত সংবাদ' : 'More Recent Stories'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel: any) => {
              const relTitle = isBn ? rel.title_bn : rel.title_en;
              return (
                <Link key={rel._id.toString()} href={`/news/${rel.slug}`}>
                  <Card className="hover:-translate-y-1 transition-all h-full border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-[10px] text-primary font-bold uppercase">{rel.category}</p>
                      <h4 className="font-bold text-sm line-clamp-2 text-slate-900 dark:text-white">
                        {relTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500">{formatDate(rel.publishedAt, locale)}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
