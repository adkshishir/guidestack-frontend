import Link from 'next/link';
import Image from 'next/image';
import { SITE_AUTHOR } from '@/lib/site-config';

/**
 * Named-human byline block. On a YMYL (financial) site this is an E-E-A-T
 * signal, so it belongs on every content page — calculators included — and
 * always links back to the full /about profile.
 */
export function AuthorByline({
  reviewedOn,
  className = '',
}: {
  /** ISO date shown as "Reviewed/verified on" when the page carries dated data. */
  reviewedOn?: string;
  className?: string;
}) {
  return (
    <aside
      className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className='flex items-start gap-4'>
        <Image
          src={SITE_AUTHOR.image}
          alt={SITE_AUTHOR.name}
          width={56}
          height={56}
          style={{ objectPosition: SITE_AUTHOR.imagePosition }}
          className='h-14 w-14 shrink-0 rounded-full object-cover border border-border'
        />
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-widest text-muted-foreground'>
            Written and reviewed by
          </p>
          <Link
            href='/about'
            className='mt-1 block text-sm font-semibold text-foreground hover:text-primary transition-colors'>
            {SITE_AUTHOR.name}
          </Link>
          <p className='text-xs text-muted-foreground'>{SITE_AUTHOR.role}</p>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            {SITE_AUTHOR.bio}
          </p>
          <p className='mt-3 text-xs text-muted-foreground'>
            {reviewedOn && (
              <>
                Data last verified{' '}
                <time dateTime={reviewedOn}>{reviewedOn}</time> ·{' '}
              </>
            )}
            <Link href='/about#methodology' className='text-primary hover:underline'>
              How we verify our data
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
