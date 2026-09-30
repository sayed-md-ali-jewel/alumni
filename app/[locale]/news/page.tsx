'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Newspaper,
  Calendar,
  Eye,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function NewsPage() {
  const t = useTranslations('news');
  const common = useTranslations('common');
  const locale = useLocale();

  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const isBn = locale === 'bn';

  const categories = ['all', 'Spotlight', 'Announcement', 'Achievement', 'Campus', 'Story'];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/news?category=${category}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (e) {
        console.error('Failed to load news:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Newspaper className="w-4 h-4" />
          <span>{isBn ? 'খবর ও অর্জন' : 'Media & Updates'}</span>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-3xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? (isBn ? 'সকল সংবাদ' : 'All Stories') : cat}
          </button>
        ))}
      </div>

      {/* Magazine Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো সংবাদ প্রকাশনা পাওয়া যায়নি' : 'No news articles found'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const title = isBn ? post.title_bn : post.title_en;
            const summary = isBn ? post.summary_bn : post.summary_en;

            return (
              <Card
                key={post._id}
                className="group hover:-translate-y-1 transition-all duration-200 overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {post.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={post.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary/90 text-white text-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.publishedAt, locale)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {summary || post.content_en?.slice(0, 150)}
                    </p>
                  </div>

                  <Link href={`/news/${post.slug}`} className="pt-2 block">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      <span>{isBn ? 'সম্পূর্ণ পড়ুন' : 'Read Story'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
