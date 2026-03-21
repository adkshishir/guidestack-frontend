import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Eye, Image as ImageIcon } from 'lucide-react';

interface BlogPostCardProps {
  image: string;
  category: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime?: string;
  slug?: string;
  excerpt?: string;
  analytics?: {
    views: number;
    likes: number;
  };
}

export function BlogPostCard({
  image,
  category,
  title,
  author,
  date,
  readTime,
  slug,
  excerpt,
  analytics,
}: BlogPostCardProps) {
  const hasImage =
    image && image !== '/placeholder.svg' && image.trim() !== '';

  const cardContent = (
    <div className='group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md cursor-pointer h-full flex flex-col'>
      <div className='relative overflow-hidden aspect-video bg-muted'>
        {hasImage ? (
          <img
            src={image}
            alt={title}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='h-full w-full flex items-center justify-center'>
            <ImageIcon className='h-10 w-10 text-muted-foreground/30' />
          </div>
        )}
        <div className='absolute top-3 left-3'>
          <Badge
            variant='secondary'
            className='backdrop-blur-sm bg-background/80 text-xs font-medium'>
            {category}
          </Badge>
        </div>
      </div>
      <div className='p-5 flex-1 flex flex-col'>
        <h3 className='mb-2 line-clamp-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug'>
          {title}
        </h3>
        {excerpt && (
          <p className='mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed'>
            {excerpt}
          </p>
        )}
        <div className='mt-auto pt-4 border-t border-border'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <Avatar className='h-7 w-7'>
                <AvatarImage
                  src={author.avatar || '/placeholder.svg'}
                  alt={author.name}
                />
                <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs'>
                  {author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium text-foreground'>
                  {author.name}
                </p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {date}
                  </span>
                  {readTime && (
                    <>
                      <span>·</span>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {readTime}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {analytics?.views !== undefined && (
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Eye className='h-3 w-3' />
                {analytics.views}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (slug) {
    return (
      <Link href={`/blog/${slug}`} className='block h-full'>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
