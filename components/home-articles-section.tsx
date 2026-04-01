'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleCard } from './article-card';
import { TrendingSidebar } from './trending-sidebar';
import { Pagination } from './pagination';
import { Search, BookOpen, Users, Layers } from 'lucide-react';
import { SearchModal } from '@/common/search-modal';
import { NavigationCategory, taxonomyApi } from '@/lib/api/taxonomy';

interface Post {
  id: number;
  slug: string;
  title: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  excerpt?: string;
  category?: string;
  readTime?: string;
  analytics?: {
    views: number;
    likes: number;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

interface HomeArticlesSectionProps {
  posts: Post[];
  categories?: Category[];
  tags?: TagItem[];
}

const POSTS_PER_PAGE = 6;

export function HomeArticlesSection({
  posts,
  categories = [],
  tags = [],
}: HomeArticlesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navigationCategories, setNavigationCategories] = useState<
    NavigationCategory[]
  >([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await taxonomyApi.navigation.getCategories();
    if (response.data) {
      setNavigationCategories(response.data);
    }
  };

  const totalGuides = posts.length;
  const totalTopics = categories.length;

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const viewsA = (a as any).analytics?.views || 0;
      const viewsB = (b as any).analytics?.views || 0;
      return viewsB - viewsA;
    })
    .slice(0, 6);

  const trendingSlugs = new Set(trendingPosts.map((p) => p.slug));
  const mainGridPosts = posts.filter((p) => !trendingSlugs.has(p.slug));

  const totalPages = Math.ceil(mainGridPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedGridPosts = mainGridPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById('latest-guides')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* ─── Educational Hero ─── */}
      <section className='relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/30 border-b border-border'>
        {/* Subtle grid pattern overlay */}
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage:
              'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <div className='max-w-3xl mx-auto text-center'>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 mb-6'>
              <BookOpen className='h-3.5 w-3.5 text-primary' />
              <span className='text-xs font-semibold uppercase tracking-widest text-primary'>
                Free Knowledge Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-5'>
              Learn Anything, <span className='text-primary'>Step by Step</span>
            </h1>

            <p className='text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto'>
              In-depth guides written for clarity. From software development and
              AI to personal finance — practical knowledge you can act on today.
            </p>

            {/* Search bar */}
            <div className='relative max-w-xl mx-auto mb-10'>
              <button
                onClick={() => setIsSearchOpen(true)}
                className='w-full flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3 shadow-md hover:border-primary transition-colors duration-200 text-left'>
                <Search className='h-5 w-5 text-muted-foreground shrink-0' />
                <input
                  type='text'
                  placeholder='Search guides, topics, tutorials...'
                  className='flex-1 bg-transparent text-sm text-muted-foreground outline-none pointer-events-none'
                  readOnly
                />
                <div className='hidden sm:flex items-center gap-1 shrink-0'>
                  <kbd className='inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground'>
                    ⌘K
                  </kbd>
                </div>
              </button>
            </div>

            {/* Stats row */}
            <div className='flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                  <BookOpen className='h-4 w-4 text-primary' />
                </div>
                <span>
                  <strong className='text-foreground font-bold'>
                    {totalGuides > 0 ? `${totalGuides}+` : '—'}
                  </strong>{' '}
                  Guides
                </span>
              </div>
              <div className='h-4 w-px bg-border hidden sm:block' />
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                  <Layers className='h-4 w-4 text-primary' />
                </div>
                <span>
                  <strong className='text-foreground font-bold'>
                    {totalTopics > 0 ? `${totalTopics}` : '—'}
                  </strong>{' '}
                  Topics
                </span>
              </div>
              <div className='h-4 w-px bg-border hidden sm:block' />
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                  <Users className='h-4 w-4 text-primary' />
                </div>
                <span>
                  <strong className='text-foreground font-bold'>Free</strong>{' '}
                  Forever
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={navigationCategories}
      />

      {/* ─── Latest Guides + Sidebar ─── */}
      <section className='py-14 bg-background' id='latest-guides'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          {/* Section header */}
          <div className='flex items-end justify-between mb-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-bold text-foreground tracking-tight'>
                Latest Guides
              </h2>
              <p className='mt-1.5 text-muted-foreground text-sm'>
                Practical, step-by-step tutorials updated regularly.
              </p>
            </div>
            <Link
              href='/blog'
              className='hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'>
              View all guides →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center'>
              <BookOpen className='h-10 w-10 text-muted-foreground/40 mx-auto mb-3' />
              <p className='text-muted-foreground'>
                No guides yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className='grid lg:grid-cols-3 gap-10'>
              {/* Main content grid */}
              <div className='lg:col-span-2'>
                {paginatedGridPosts.length > 0 ? (
                  <>
                    <div className='grid sm:grid-cols-2 gap-5'>
                      {paginatedGridPosts.map((post: any, index: number) => (
                        <ArticleCard
                          key={post.id}
                          image={post.image}
                          title={post.title}
                          author={post.author}
                          date={post.date}
                          slug={post.slug}
                          excerpt={post.excerpt}
                          category={post.category}
                          readTime={post.readTime}
                          titleTag='h3'
                          analytics={post.analytics}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className='mt-10 pt-8 border-t border-border'>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className='rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center'>
                    <p className='text-muted-foreground text-sm'>
                      More guides coming soon!
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className='lg:col-span-1 space-y-6'>
                <TrendingSidebar
                  trendingPosts={trendingPosts}
                  featuredPosts={trendingPosts}
                  tags={tags}
                />

                {/* Ad slot */}
                <div className='ad-slot min-h-[250px] flex items-center justify-center'>
                  <p className='text-xs text-muted-foreground/50'>
                    Your ad here
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
