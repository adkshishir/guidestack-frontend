'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Eye, Tag, MoveRight } from 'lucide-react';
import Image from 'next/image';
// import { SidebarAd } from '@/components/adsense/sidebar-ad';

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
  analytics?: {
    views: number;
    likes: number;
  };
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

interface TrendingSidebarProps {
  trendingPosts: Post[];
  featuredPosts: Post[];
  tags?: TagItem[];
}

export function TrendingSidebar({
  trendingPosts,
  featuredPosts,
  tags = [],
}: TrendingSidebarProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredPosts.length]);

  const currentFeatured = featuredPosts[currentSlide];

  return (
    <aside className='space-y-8'>
      {/* Trending Posts Section */}
      <div>
        <div className='mb-5 flex items-center justify-between border-b border-border pb-3'>
          <h2 className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>
            Popular Guides
          </h2>
          <Link
            href='/blog?sort=views-desc'
            className='text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1'>
            <span>See all</span>
            <MoveRight className='h-3.5 w-3.5' />
          </Link>
        </div>
        <div className='space-y-5'>
          {trendingPosts.slice(0, 4).map((post, index) => (
            <TrendingPostItem key={index} post={post} />
          ))}
        </div>
      </div>

      {/* Featured Carousel */}
      {featuredPosts.length > 0 && currentFeatured && (
        <div className='relative rounded-xl overflow-hidden aspect-4/5 group'>
          {/* Background Image */}
          {currentFeatured.image &&
          currentFeatured.image !== '/placeholder.svg' ? (
            <Image
              src={currentFeatured.image}
              alt={currentFeatured.title}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 400px'
            />
          ) : (
            <div className='absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900 flex items-center justify-center'>
              <ImageIcon className='h-16 w-16 text-slate-500' />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent' />

          {/* Content */}
          <div className='absolute bottom-0 left-0 right-0 p-5 text-white'>
            <span className='text-xs text-slate-300 mb-2 block'>
              {currentFeatured.date}
            </span>
            <Link href={`/blog/${currentFeatured.slug}`}>
              <h3 className='font-bold text-lg leading-snug mb-3 line-clamp-3 group-hover:text-blue-300 transition-colors'>
                {currentFeatured.title}
              </h3>
            </Link>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
                {currentFeatured.author.name.charAt(0).toUpperCase()}
              </div>
              <span className='text-sm text-white/80'>
                {currentFeatured.author.name}
              </span>
            </div>
          </div>

          {/* Carousel Dots */}
          {featuredPosts.length > 1 && (
            <div className='absolute bottom-5 right-5 flex gap-1.5'>
              {featuredPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3.5 h-3.5 rounded-full transition-all border-2 border-transparent hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags section */}
      {tags.length > 0 && (
        <div>
          <div className='mb-5 flex items-center gap-2 border-b border-border pb-3'>
            <Tag className='h-3.5 w-3.5 text-muted-foreground' />
            <h2 className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>
              Tags
            </h2>
          </div>
          <div className='flex flex-wrap gap-2'>
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className='inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/8 hover:text-primary transition-colors'>
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Ad — disabled while rebuilding content trust */}
      {/* <div className='hidden lg:block'>
        <SidebarAd containerClassName='' />
      </div> */}
    </aside>
  );
}

function TrendingPostItem({ post }: { post: Post }) {
  const hasImage =
    post.image && post.image !== '/placeholder.svg' && post.image.trim() !== '';

  return (
    <Link href={`/blog/${post.slug}`} className='flex gap-3 group'>
      {/* Thumbnail */}
      <div className='w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted relative'>
        {hasImage ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            sizes='64px'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <ImageIcon className='h-5 w-5 text-muted-foreground/30' />
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <h3 className='font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1'>
          {post.title}
        </h3>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{post.date}</span>
          {post.analytics?.views !== undefined && (
            <>
              <span>·</span>
              <span className='inline-flex items-center gap-1'>
                <Eye className='h-3 w-3' />
                {post.analytics.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
