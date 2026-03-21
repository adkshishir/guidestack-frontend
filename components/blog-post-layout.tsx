'use client';

import { SidebarAd } from '@/components/adsense/sidebar-ad';

interface BlogPostLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
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
}: BlogPostLayoutProps) {
  return (
    <div className='grid lg:grid-cols-4 gap-8'>
      {/* Main article column */}
      <div className='lg:col-span-3'>{children}</div>

      {/* Sidebar with ads (desktop only) */}
      {showSidebar && (
        <aside className='hidden lg:block lg:col-span-1'>
          <div className='sticky top-12 space-y-8'>
            {/* Top sidebar ad */}
            <SidebarAd containerClassName='' />
          </div>
        </aside>
      )}
    </div>
  );
}
