'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleCard } from './article-card';
import { TrendingSidebar } from './trending-sidebar';
import { Pagination } from './pagination';
import { Image as ImageIcon } from 'lucide-react';

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

  if (!posts || posts.length === 0) {
    return (
      <section className='py-20 text-center'>
        <div className='mx-auto max-w-7xl px-4'>
          <p className='text-muted-foreground'>
            No articles yet. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  const featuredHero = posts[0];
  const otherPosts = posts.slice(1);

  const trendingPosts = [...otherPosts]
    .sort((a, b) => {
      const viewsA = (a as any).analytics?.views || 0;
      const viewsB = (b as any).analytics?.views || 0;
      return viewsB - viewsA;
    })
    .slice(0, 6);

  const trendingSlugs = new Set(trendingPosts.map((p) => p.slug));
  const mainGridPosts = otherPosts.filter((p) => !trendingSlugs.has(p.slug));

  const totalPages = Math.ceil(mainGridPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedGridPosts = mainGridPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById('latest-articles')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasHeroImage =
    featuredHero.image &&
    featuredHero.image !== '/placeholder.svg' &&
    featuredHero.image.trim() !== '';

  return (
    <section className='pb-16 bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Featured Hero */}
        <div className='mb-16'>
          <Link href={`/blog/${featuredHero.slug}`}>
            <article className='group relative overflow-hidden rounded-2xl bg-card border border-border transition-shadow duration-300 hover:shadow-lg'>
              <div className='grid lg:grid-cols-2 gap-0'>
                {/* Image */}
                <div className='relative h-72 lg:h-[28rem] overflow-hidden bg-muted'>
                  {hasHeroImage ? (
                    <Image
                      src={featuredHero.image}
                      alt={featuredHero.title}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                      sizes='(max-width: 1024px) 100vw, 50vw'
                      priority
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <ImageIcon className='h-20 w-20 text-muted-foreground/30' />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className='flex flex-col justify-center p-8 md:p-12 lg:p-14'>
                  <div className='flex items-center gap-3 mb-5'>
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary'>
                      {featuredHero.category || 'Featured'}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      {featuredHero.date}
                    </span>
                  </div>

                  <h1 className='text-2xl md:text-3xl font-extrabold mb-4 leading-tight text-foreground group-hover:text-primary transition-colors'>
                    {featuredHero.title || 'Untitled Article'}
                  </h1>

                  <p className='text-muted-foreground text-base leading-relaxed mb-6 line-clamp-3'>
                    {featuredHero.excerpt ||
                      'Discover the latest insights and step-by-step guides...'}
                  </p>

                  <div className='flex items-center gap-3 pt-5 border-t border-border'>
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm'>
                      {featuredHero.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='font-medium text-foreground text-sm'>
                        {featuredHero.author.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {featuredHero.readTime || '5 min read'}
                      </p>
                    </div>
                    <span className='ml-auto text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1'>
                      Read Guide
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* Latest Articles */}
        <div className='mb-10' id='latest-articles'>
          <h2 className='text-2xl md:text-3xl font-bold text-foreground'>
            Latest Guides
          </h2>
          <p className='mt-2 text-muted-foreground'>
            Step-by-step tutorials and in-depth technical articles.
          </p>
        </div>

        <div className='grid lg:grid-cols-3 gap-10'>
          {/* Main Grid */}
          <div className='lg:col-span-2'>
            {paginatedGridPosts.length > 0 ? (
              <>
                <div className='grid sm:grid-cols-2 gap-6'>
                  {paginatedGridPosts.map((post: any) => (
                    <ArticleCard
                      key={post.id}
                      image={post.image}
                      title={post.title}
                      author={post.author}
                      date={post.date}
                      slug={post.slug}
                      excerpt={post.excerpt}
                      titleTag='h3'
                      analytics={post.analytics}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className='pt-10 border-t border-border mt-10'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border'>
                <p className='text-muted-foreground'>
                  More guides coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className='lg:col-span-1'>
            <TrendingSidebar
              trendingPosts={trendingPosts}
              featuredPosts={trendingPosts}
              tags={tags}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
