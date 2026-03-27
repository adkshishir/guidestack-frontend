import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';

interface ArticleCardProps {
  image: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  slug: string;
  excerpt?: string;
  category?: string;
  readTime?: string;
  titleTag?: 'h2' | 'h3' | 'h4';
  analytics?: {
    views: number;
    likes: number;
  };
}

export function ArticleCard({
  image,
  title,
  author,
  date,
  slug,
  excerpt,
  category,
  readTime,
  titleTag: TitleTag = 'h3',
  analytics,
}: ArticleCardProps) {
  const hasImage = image && image !== '/placeholder.svg' && image.trim() !== '';

  return (
    <article className='group relative flex flex-col bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden h-full'>
      {/* Hover left accent bar */}
      <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-r-full' />

      {/* Optional thumbnail — compact, top-right corner feel */}
      {hasImage && (
        <Link
          href={`/blog/${slug}`}
          aria-label={`Read ${title}`}
          className='block relative aspect-16/7 overflow-hidden bg-muted shrink-0'>
          <Image
            src={image}
            alt={title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent' />
        </Link>
      )}

      <div className='flex flex-col flex-1 p-5'>
        {/* Top meta: category + read time */}
        <div className='flex items-center justify-between gap-2 mb-3'>
          {category ? (
            <span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary tracking-wide'>
              {category}
            </span>
          ) : (
            <span />
          )}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            {readTime && (
              <span className='inline-flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {readTime}
              </span>
            )}
            {analytics?.views !== undefined && (
              <span className='inline-flex items-center gap-1'>
                <Eye className='h-3 w-3' />
                {analytics.views.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`} className='block flex-1'>
          <TitleTag className='font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150 mb-2.5'>
            {title}
          </TitleTag>

          {/* Excerpt */}
          {excerpt && (
            <p className='text-muted-foreground text-sm leading-relaxed line-clamp-2'>
              {excerpt}
            </p>
          )}
        </Link>

        {/* Footer: author + date */}
        <div className='mt-4 pt-3.5 border-t border-border flex items-center gap-2.5'>
          <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold'>
            {author.name.charAt(0).toUpperCase()}
          </div>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground min-w-0'>
            <span className='font-medium text-foreground truncate'>
              {author.name}
            </span>
            <span>·</span>
            <span className='shrink-0'>{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
