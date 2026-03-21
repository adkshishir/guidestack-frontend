'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <div className='mb-6 pb-2 border-b-2 border-primary flex justify-between items-center'>
          <h2 className='text-lg font-bold text-foreground'>
            Popular Guides
          </h2>
          <Link
            href='/blog?sort=views-desc'
            className='text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1'>
            <span>View all</span>
            <MoveRight className='h-4 w-4' />
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
              <Avatar className='h-7 w-7 border-2 border-white/30'>
                <AvatarImage
                  src={currentFeatured.author.avatar}
                  alt={currentFeatured.author.name}
                />
                <AvatarFallback className='bg-blue-600 text-white text-xs'>
                  {currentFeatured.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm text-slate-200'>
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

      {/* Tags section - below carousel, above ads */}
      {tags.length > 0 && (
        <div>
          <h2 className='text-lg font-bold text-foreground mb-4 pb-2 border-b-2 border-primary flex items-center gap-2'>
            <Tag className='h-4 w-4 text-primary' />
            Tags
          </h2>
          <div className='flex flex-wrap gap-2'>
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className='inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors'>
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
    <Link href={`/blog/${post.slug}`} className='flex gap-4 group'>
      {/* Thumbnail */}
      <div className='w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative'>
        {hasImage ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            sizes='80px'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <ImageIcon className='h-6 w-6 text-slate-300 dark:text-slate-600' />
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <span className='text-xs text-slate-500 dark:text-slate-400 block mb-1'>
          {post.date}
        </span>
        <h3 className='font-semibold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
          {post.title}
        </h3>
        <div className='flex items-center gap-2 mt-2'>
          <Avatar className='h-5 w-5'>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className='bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px]'>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className='text-xs text-slate-500 dark:text-slate-400'>
            {post.author.name}
          </span>
          {post.analytics?.views !== undefined && (
            <div className='flex items-center gap-1 ml-auto text-slate-400'>
              <Eye className='h-3 w-3' />
              <span className='text-[10px]'>{post.analytics.views}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
