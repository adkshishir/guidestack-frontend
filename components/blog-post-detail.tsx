'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Share2,
  BookOpen,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableOfContents } from '@/components/table-of-contents';
import { blogApi } from '@/lib/api/blog';
import { trackEvent } from '@/lib/analytics';

interface BlogPostDetailProps {
  post: {
    id: number;
    slug: string;
    title: string;
    category: string;
    categorySlug?: string;
    image: string;
    author: {
      name: string;
      avatar: string;
      bio: string;
    };
    date: string;
    readTime: string;
    content: string;
    excerpt: string;
    tags: string[];
    faqs?: { question: string; answer: string }[];
    toc?: { id: string; text: string; level: number }[];
    analytics?: {
      views: number;
      likes: number;
    };
    commentCount?: number;
  };
}

function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function BlogPostDetail({ post }: BlogPostDetailProps) {
  const [helpfulVote, setHelpfulVote] = useState<'yes' | 'no' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleHelpfulVote = async (vote: 'yes' | 'no') => {
    if (helpfulVote || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      if (vote === 'yes') {
        await blogApi.incrementLike(post.id);
      }

      trackEvent('article_feedback_submitted', {
        article_id: post.id,
        article_slug: post.slug,
        article_title: post.title,
        feedback: vote,
        helpful: vote === 'yes',
      });

      setHelpfulVote(vote);
    } catch (err) {
      console.error('Failed to submit article feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const categorySlug = post.categorySlug || categoryToSlug(post.category);
  const hasImage =
    post.image && post.image !== '/placeholder.svg' && post.image.trim() !== '';

  return (
    <article className='mx-auto max-w-3xl px-4 sm:px-6'>
      {/* Header */}
      <header className='mb-8 pt-4'>
        {/* Category & Meta */}
        <div className='flex flex-wrap items-center gap-3 mb-5'>
          <Link href={`/category/${categorySlug}`}>
            <Badge
              variant='secondary'
              className='text-xs px-3 py-1 font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer'>
              {post.category}
            </Badge>
          </Link>
          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Calendar className='h-3.5 w-3.5' />
              {post.date}
            </span>
            {post.readTime && (
              <span className='flex items-center gap-1'>
                <Clock className='h-3.5 w-3.5' />
                {post.readTime}
              </span>
            )}
            <span className='flex items-center gap-1'>
              <Eye className='h-3.5 w-3.5' />
              {post.analytics?.views || 0} views
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className='text-3xl md:text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground mb-5'>
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className='text-lg leading-relaxed text-muted-foreground mb-6'>
            {post.excerpt}
          </p>
        )}

        {/* Author & Actions */}
        <div className='flex items-center justify-between border-y border-border py-4'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src={post.author.avatar || '/placeholder.svg'}
                alt={post.author.name}
              />
              <AvatarFallback className='bg-primary/10 text-primary font-semibold text-sm'>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-semibold text-foreground'>
                {post.author.name}
              </p>
              <p className='text-xs text-muted-foreground'>
                Published {post.date}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleShare}
              className='gap-1.5 text-xs h-8'>
              <Share2 className='h-3.5 w-3.5' />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {hasImage && (
        <div className='mb-10 overflow-hidden rounded-xl relative h-64 md:h-96 w-full bg-muted'>
          <Image
            src={post.image}
            alt={post.title}
            fill
            className='object-cover'
            priority
            sizes='(max-width: 768px) 100vw, 768px'
          />
        </div>
      )}

      {/* Table of Contents */}
      {post.toc && post.toc.length > 0 && (
        <nav className='my-8 rounded-xl border border-border bg-muted/30 p-6'>
          <TableOfContents items={post.toc} />
        </nav>
      )}

      {/* Article Content */}
      <div
        className='blog-content max-w-none'
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* FAQs */}
      {post.faqs && post.faqs.length > 0 && (
        <section className='mt-12 border-t border-border pt-8'>
          <h2 className='text-2xl font-bold mb-6 text-foreground'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-3'>
            {post.faqs.map((faq, index) => (
              <details
                key={index}
                className='group border border-border rounded-lg bg-card'>
                <summary className='cursor-pointer p-4 font-medium flex items-center justify-between text-foreground hover:text-primary transition-colors'>
                  <span>{faq.question}</span>
                  <span className='transition-transform group-open:rotate-180 ml-4 shrink-0'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'>
                      <polyline points='6 9 12 15 18 9'></polyline>
                    </svg>
                  </span>
                </summary>
                <div
                  className='px-4 pb-4 text-muted-foreground leading-relaxed'
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className='mt-10 border-t border-border pt-8'>
          <div className='flex items-center gap-2 mb-4'>
            <BookOpen className='h-4 w-4 text-primary' />
            <p className='text-sm font-semibold text-foreground'>
              Related Topics
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tag/${tagToSlug(tag)}`}>
                <Badge
                  variant='secondary'
                  className='text-xs px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer rounded-full'>
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className='mt-10 rounded-xl border border-border bg-muted/30 p-5 sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-base font-semibold text-foreground'>
              Was this article helpful?
            </h3>
            <p className='text-sm text-muted-foreground'>
              Your feedback helps us improve future guides.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant={helpfulVote === 'yes' ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleHelpfulVote('yes')}
              disabled={Boolean(helpfulVote) || isSubmittingFeedback}
              className='gap-1.5'>
              <ThumbsUp className='h-4 w-4' />
              Yes
            </Button>
            <Button
              variant={helpfulVote === 'no' ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleHelpfulVote('no')}
              disabled={Boolean(helpfulVote) || isSubmittingFeedback}
              className='gap-1.5'>
              <ThumbsDown className='h-4 w-4' />
              No
            </Button>
          </div>
        </div>
        {helpfulVote && (
          <p className='mt-3 text-sm text-muted-foreground'>
            Thanks for your feedback.
          </p>
        )}
      </section>

      {/* Author Bio */}
      <div className='mt-12 rounded-xl border border-border bg-muted/30 p-6 sm:p-8'>
        <div className='flex flex-col sm:flex-row gap-5'>
          <Avatar className='h-16 w-16 shrink-0'>
            <AvatarImage
              src={post.author.avatar || '/placeholder.svg'}
              alt={post.author.name}
            />
            <AvatarFallback className='bg-primary/10 text-primary font-bold text-xl'>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-1'>
              Written by
            </p>
            <h3 className='text-lg font-bold text-foreground mb-2'>
              {post.author.name}
            </h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              {post.author.bio ||
                'Writer and content creator focused on sharing practical knowledge and step-by-step guides.'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
