import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
}: PageHeaderProps) {
  return (
    <div className='section-alt border-b border-border'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {breadcrumbs.length > 0 && (
          <nav
            aria-label='Breadcrumb'
            className='mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground'>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className='flex items-center gap-1'>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <Link
                      href={crumb.href}
                      className='hover:text-primary transition-colors'>
                      {crumb.label}
                    </Link>
                    <ChevronRight className='h-3 w-3 shrink-0' />
                  </>
                ) : (
                  <span className='text-foreground font-medium truncate max-w-[200px]'>
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className='text-2xl md:text-3xl font-bold text-foreground tracking-tight'>
          {title}
        </h1>
        {description && (
          <p className='mt-2 text-muted-foreground text-sm max-w-2xl'>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
