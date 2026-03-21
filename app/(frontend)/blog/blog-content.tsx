'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BlogPost } from '@/lib/api/blog';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';
import { AdUnit, MultiplexAd } from '@/components/adsense';
import { ArrowUpDown, Calendar, Eye, MessageCircle } from 'lucide-react';
import { Pagination } from '@/components/pagination';

export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first', icon: Calendar },
  { value: 'date-asc', label: 'Oldest first', icon: Calendar },
  { value: 'views-desc', label: 'Most views', icon: Eye },
  { value: 'views-asc', label: 'Least views', icon: Eye },
  { value: 'comments-desc', label: 'Most comments', icon: MessageCircle },
  { value: 'comments-asc', label: 'Least comments', icon: MessageCircle },
] as const;

function sortBlogPosts(posts: BlogPost[], sort: string): BlogPost[] {
  const list = [...posts];
  const getDate = (p: BlogPost) =>
    new Date(p.publishedAt || p.createdAt || 0).getTime();
  const getViews = (p: BlogPost) => p.blogAnalytics?.views ?? 0;
  const getComments = (p: BlogPost) => p.comments?.length ?? 0;

  switch (sort) {
    case 'date-asc':
      list.sort((a, b) => getDate(a) - getDate(b));
      break;
    case 'date-desc':
    case 'latest':
      list.sort((a, b) => getDate(b) - getDate(a));
      break;
    case 'views-desc':
    case 'featured':
      list.sort((a, b) => getViews(b) - getViews(a));
      break;
    case 'views-asc':
      list.sort((a, b) => getViews(a) - getViews(b));
      break;
    case 'comments-desc':
      list.sort((a, b) => getComments(b) - getComments(a));
      break;
    case 'comments-asc':
      list.sort((a, b) => getComments(a) - getComments(b));
      break;
    default:
      list.sort((a, b) => getDate(b) - getDate(a));
  }
  return list;
}

interface BlogContentProps {
  initialPosts: BlogPost[];
  sort?: string;
  searchQuery?: string;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
}

export function BlogContent({
  initialPosts,
  sort = 'date-desc',
  searchQuery = '',
  currentPage = 1,
  totalPages = 1,
  total = 0,
  limit = 12,
}: BlogContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filteredAndSortedPosts = useMemo(() => {
    const sorted = sortBlogPosts(initialPosts, sort);
    const transformed = sorted.map(transformBlogPostForDisplay);
    if (!searchQuery.trim()) return transformed;
    const q = searchQuery.trim().toLowerCase();
    return transformed.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)),
    );
  }, [initialPosts, sort, searchQuery]);

  const transformedPosts = filteredAndSortedPosts;
  const totalFiltered = filteredAndSortedPosts.length;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', String(page));
    if (sort && sort !== 'date-desc') params.set('sort', sort);
    if (searchQuery) params.set('search', searchQuery);
    router.push(`/blog?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('sort', newSort);
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PageHeader
        title='Blog'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
      />

      {initialPosts.length > 0 ? (
        <>
          {/* Featured Post - show first post (by current sort) when not searching or when search has results */}
          {filteredAndSortedPosts[0] && !searchQuery && (
            <div className='mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8'>
              <Link href={`/blog/${filteredAndSortedPosts[0].slug}`}>
                <div className='relative overflow-hidden rounded-2xl bg-slate-900 cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300'>
                  <img
                    src={filteredAndSortedPosts[0].image}
                    alt={filteredAndSortedPosts[0].title}
                    className='h-72 md:h-96 w-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/50 to-transparent'></div>
                  <div className='absolute inset-0 flex flex-col justify-end p-6 md:p-8'>
                    <span className='inline-block px-3 py-1 mb-4 text-xs font-medium bg-primary/90 text-white rounded-full w-fit'>
                      Featured
                    </span>
                    <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors'>
                      {filteredAndSortedPosts[0].title}
                    </h2>
                    <div className='flex items-center gap-3'>
                      <img
                        src={filteredAndSortedPosts[0].author.avatar}
                        alt={filteredAndSortedPosts[0].author.name}
                        className='h-10 w-10 rounded-full border-2 border-white/30'
                      />
                      <div>
                        <span className='text-sm font-medium text-white'>
                          {filteredAndSortedPosts[0].author.name}
                        </span>
                        <span className='text-sm text-slate-300 block'>
                          {filteredAndSortedPosts[0].date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Ad Placement: Display Ad after Featured Post */}
          <div className='mx-auto max-w-7xl px-4 mt-12 sm:px-6 lg:px-8 flex flex-col items-center'>
            <span className='text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-medium'>
              Advertisement
            </span>
            <AdUnit
              slot='5504087311'
              format='auto'
              responsive
              className='w-full'
            />
          </div>

          {/* Section Header + Sort */}
          <div className='mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8'>
            <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-4'>
              <div>
                <h2 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-white'>
                  {searchQuery
                    ? `Search results${totalFiltered > 0 ? ` (${totalFiltered})` : ''}`
                    : 'Articles'}
                </h2>
                {searchQuery && (
                  <p className='mt-1 text-slate-600 dark:text-slate-400'>
                    Results for &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
              <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                <label className='flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400'>
                  <ArrowUpDown className='h-4 w-4' />
                  Sort by
                </label>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className='rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary'>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className='text-slate-600 dark:text-slate-400 mb-6'>
              {searchQuery
                ? 'Matching articles from GuideStack.'
                : 'Browse through our collection of articles covering various topics and insights from GuideStack.'}
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className='mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8'>
            {totalFiltered === 0 ? (
              <div className='text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
                <p className='text-slate-500 dark:text-slate-400'>
                  {searchQuery
                    ? `No articles match "${searchQuery}". Try a different search.`
                    : 'No blog posts found. Check back soon!'}
                </p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {transformedPosts.map((post) => (
                    <ArticleCard key={post.id} {...post} slug={post.slug} analytics={post.analytics} />
                  ))}
                </div>

                {/* Multiplex Ad after the grid */}
                <div className='mt-16 pt-8'>
                  <MultiplexAd containerClassName='' />
                </div>

                {/* Pagination */}
                {totalPages > 1 && !searchQuery && (
                  <div className='mt-12 flex flex-col items-center gap-4'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      Page {currentPage} of {totalPages}
                      {total > 0 && ` · ${total} articles`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
            <p className='text-slate-500 dark:text-slate-400'>
              No blog posts found. Check back soon!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
