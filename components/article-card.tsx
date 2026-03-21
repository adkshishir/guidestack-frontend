import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image as ImageIcon, Eye } from 'lucide-react';

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
  titleTag: TitleTag = 'h3',
  analytics,
}: ArticleCardProps) {
  const hasImage = image && image !== '/placeholder.svg' && image.trim() !== '';

  return (
    <article className='group bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300 flex flex-col h-full'>
      <Link
        href={`/blog/${slug}`}
        aria-label={`Read ${title}`}
        className='block overflow-hidden aspect-[16/10] relative bg-muted'>
        {hasImage ? (
          <Image
            src={image}
            alt={title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <ImageIcon className='h-10 w-10 text-muted-foreground/30' />
          </div>
        )}
      </Link>

      <div className='p-5 flex-1 flex flex-col'>
        {/* Meta */}
        <div className='flex items-center gap-2 text-xs text-muted-foreground mb-3'>
          <span>{date}</span>
          {analytics?.views !== undefined && (
            <>
              <span>·</span>
              <span className='inline-flex items-center gap-1'>
                <Eye className='h-3 w-3' />
                {analytics.views}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`}>
          <TitleTag className='font-bold text-lg text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors'>
            {title}
          </TitleTag>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className='text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4'>
            {excerpt}
          </p>
        )}

        {/* Author */}
        <div className='mt-auto pt-4 border-t border-border flex items-center gap-2.5'>
          <Avatar className='h-7 w-7'>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium text-foreground'>
            {author.name}
          </span>
        </div>
      </div>
    </article>
  );
}
