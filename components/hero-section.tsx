import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

interface TransformedPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
}

interface HeroSectionProps {
  featuredPost: TransformedPost | null;
}

export function HeroSection({ featuredPost: post }: HeroSectionProps) {
  return (
    <section className='w-full bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20'>
        {post ? (
          <div className='grid gap-10 lg:grid-cols-2 lg:gap-16 items-center'>
            {/* Content */}
            <div className='flex flex-col justify-center space-y-6'>
              <Badge
                variant='secondary'
                className='text-xs px-3 py-1 w-fit font-medium uppercase tracking-wide'>
                Featured Guide
              </Badge>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight text-foreground'>
                {post.title}
              </h1>
              <p className='text-lg leading-relaxed text-muted-foreground max-w-xl'>
                {post.excerpt ||
                  'Discover step-by-step guides, tutorials, and insights that help you build real skills.'}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className='inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all w-fit'>
                Read the full guide
                <ArrowRight className='h-4 w-4' />
              </Link>

              <div className='flex items-center gap-4 border-t border-border pt-6'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback className='bg-primary/10 text-primary font-semibold text-sm'>
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium text-foreground'>
                    {post.author.name}
                  </p>
                  <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {post.date}
                    </span>
                    {post.readTime && (
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {post.readTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <Link
              href={`/blog/${post.slug}`}
              className='block relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted group'>
              <img
                src={post.image || '/placeholder.svg'}
                alt={post.title}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                loading='eager'
              />
            </Link>
          </div>
        ) : (
          <div className='text-center py-16'>
            <h1 className='text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight'>
              Learn by Doing
            </h1>
            <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Step-by-step guides for developers, creators, and curious minds.
            </p>
            <Link
              href='/blog'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity'>
              Browse Guides
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
