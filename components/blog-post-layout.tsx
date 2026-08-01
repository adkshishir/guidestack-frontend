'use client';

import Link from 'next/link';
import { Calculator, ArrowRight } from 'lucide-react';
import { SidebarAd } from '@/components/adsense/sidebar-ad';
import { getToolByCategorySlug } from '@/lib/tools-data';

interface BlogPostLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  /** The post's primary category slug, used to surface a matching tool. */
  categorySlug?: string;
}

/**
 * BlogPostLayout component for wrapping the blog detail page with optional sidebar ads.
 * Provides a two-column layout on desktop with sidebar ads for additional revenue.
 *
 * Usage:
 * ```tsx
 * <BlogPostLayout>
 *   <BlogPostDetail post={post} />
 * </BlogPostLayout>
 * ```
 */
export function BlogPostLayout({
  children,
  showSidebar = true,
  categorySlug,
}: BlogPostLayoutProps) {
  const relatedTool = categorySlug
    ? getToolByCategorySlug(categorySlug)
    : undefined;

  return (
    <div className='grid lg:grid-cols-4 gap-8'>
      {/* Main article column */}
      <div className='lg:col-span-3'>{children}</div>

      {/* Sidebar with ads (desktop only) */}
      {showSidebar && (
        <aside className='hidden lg:block lg:col-span-1'>
          <div className='sticky top-12 space-y-8'>
            {relatedTool && (
              <Link
                href={`/tools/${relatedTool.slug}`}
                className='block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg'
              >
                <div className='mb-3 flex items-center gap-3'>
                  <div className='rounded-lg bg-primary/10 p-2 text-primary shrink-0'>
                    <Calculator className='h-5 w-5' />
                  </div>
                  <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Free tool
                  </p>
                </div>
                <p className='font-semibold text-foreground'>
                  {relatedTool.shortTitle}
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {relatedTool.description}
                </p>
                <span className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary'>
                  Try it
                  <ArrowRight className='h-3.5 w-3.5' />
                </span>
              </Link>
            )}

            {/* Top sidebar ad */}
            <SidebarAd containerClassName='' />
          </div>
        </aside>
      )}
    </div>
  );
}
