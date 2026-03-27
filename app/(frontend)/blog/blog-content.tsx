'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BlogPost } from '@/lib/api/blog';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleCard } from '@/components/article-card';
import { AdUnit, MultiplexAd } from '@/components/adsense';
import { ArrowUpDown, Calendar, Eye, MessageCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
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

  const featuredPost = filteredAndSortedPosts[0];
  const hasFeaturedImage =
    featuredPost?.image &&
    featuredPost.image !== '/placeholder.svg' &&
    featuredPost.image.trim() !== '';

  return (
    <main className='min-h-screen bg-background'>
      <PageHeader
        title='All Guides'
        description='Browse our full library of practical, step-by-step guides.'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'All Guides', href: '/blog' },
        ]}
      />

      {initialPosts.length > 0 ? (
        <>
          {/* Featured Guide — shown when not in search mode */}
          {featuredPost && !searchQuery && (
            <div className='mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8'>
              <Link href={`/blog/${featuredPost.slug}`}>
                <article className='group relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow duration-300'>
                  <div className='grid lg:grid-cols-5 gap-0'>
                    {/* Image */}
                    <div className='lg:col-span-2 relative h-56 lg:h-72 overflow-hidden bg-muted'>
                      {hasFeaturedImage ? (
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className='object-cover group-hover:scale-105 transition-transform duration-500'
                          sizes='(max-width: 1024px) 100vw, 40vw'
                          priority
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <ImageIcon className='h-16 w-16 text-muted-foreground/20' />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='lg:col-span-3 flex flex-col justify-center p-7 md:p-10'>
                      <div className='flex items-center gap-3 mb-4'>
                        <span className='inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary tracking-wide'>
                          Featured Guide
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {featuredPost.date}
                        </span>
                      </div>

                      <h2 className='text-xl md:text-2xl font-extrabold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors'>
                        {featuredPost.title}
                      </h2>

                      {featuredPost.excerpt && (
                        <p className='text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-5'>
                          {featuredPost.excerpt}
                        </p>
                      )}

                      <div className='flex items-center gap-3 pt-4 border-t border-border'>
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold'>
                          {featuredPost.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className='text-sm font-medium text-foreground'>
                          {featuredPost.author.name}
                        </span>
                        {featuredPost.readTime && (
                          <>
                            <span className='text-muted-foreground'>·</span>
                            <span className='text-xs text-muted-foreground'>
                              {featuredPost.readTime}
                            </span>
                          </>
                        )}
                        <span className='ml-auto text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1'>
                          Read guide →
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          )}

          {/* Ad between featured and grid */}
          <div className='mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8'>
            <div className='ad-slot min-h-[90px] flex items-center justify-center'>
              <AdUnit slot='5504087311' format='auto' responsive className='w-full' />
            </div>
          </div>

          {/* Section header + sort */}
          <div className='mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
              <div>
                <h2 className='text-xl font-bold text-foreground tracking-tight'>
                  {searchQuery
                    ? `Search results${totalFiltered > 0 ? ` (${totalFiltered})` : ''}`
                    : `All Guides${total > 0 ? ` · ${total} total` : ''}`}
                </h2>
                {searchQuery && (
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Results for &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <ArrowUpDown className='h-4 w-4 text-muted-foreground shrink-0' />
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className='rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none'>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className='mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8'>
            {totalFiltered === 0 ? (
              <div className='rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center'>
                <BookOpen className='h-10 w-10 text-muted-foreground/30 mx-auto mb-3' />
                <p className='text-muted-foreground text-sm'>
                  {searchQuery
                    ? `No guides match "${searchQuery}". Try a different search.`
                    : 'No guides found. Check back soon!'}
                </p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
                  {transformedPosts.map((post) => (
                    <ArticleCard
                      key={post.id}
                      {...post}
                      slug={post.slug}
                      analytics={post.analytics}
                    />
                  ))}
                </div>

                {/* In-feed ad after grid */}
                <div className='mt-12 ad-slot min-h-[200px] flex items-center justify-center'>
                  <MultiplexAd containerClassName='w-full' />
                </div>

                {/* Pagination */}
                {totalPages > 1 && !searchQuery && (
                  <div className='mt-10 flex flex-col items-center gap-3'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                    <p className='text-xs text-muted-foreground'>
                      Page {currentPage} of {totalPages}
                      {total > 0 && ` · ${total} guides`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
          <div className='rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center'>
            <BookOpen className='h-10 w-10 text-muted-foreground/30 mx-auto mb-3' />
            <p className='text-muted-foreground'>
              No guides found. Check back soon!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
