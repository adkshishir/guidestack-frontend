import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ArticleCard } from '@/components/article-card';
import { AdUnit, MultiplexAd } from '@/components/adsense';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl } from '@/lib/seo';
import { Tag } from 'lucide-react';

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await serverApi.getBlogPostsByTagSlug(slug);

  if (!response.data) {
    return {
      title: 'Tag Not Found',
      description: 'The tag you are looking for does not exist.',
    };
  }

  const { tag } = response.data;
  const siteUrl = getBaseUrl();
  const tagUrl = `${siteUrl}/tag/${slug}`;

  return {
    title: `#${tag.name} - GuideStack`,
    description:
      tag.description ||
      `Browse all articles tagged with #${tag.name} on GuideStack.`,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: tagUrl,
    },
    openGraph: {
      title: `#${tag.name} - GuideStack`,
      description:
        tag.description ||
        `Browse all articles tagged with #${tag.name} on GuideStack.`,
      url: tagUrl,
      siteName: 'GuideStack',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${tag.name} - GuideStack`,
      description:
        tag.description ||
        `Browse all articles tagged with #${tag.name} on GuideStack.`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate JSON-LD structured data for tag page
function generateTagSchema(
  tag: { name: string; slug: string; description?: string },
  posts: any[],
) {
  const siteUrl = getBaseUrl();
  const tagUrl = `${siteUrl}/tag/${tag.slug}`;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${tag.name}`,
    description: tag.description || `Articles tagged with #${tag.name}`,
    url: tagUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
      })),
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'GuideStack',
      url: siteUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `#${tag.name}`,
        item: tagUrl,
      },
    ],
  };

  return {
    collectionPage: collectionPageSchema,
    breadcrumb: breadcrumbSchema,
  };
}

const POSTS_PER_PAGE = 9;

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);

  const response = await serverApi.getBlogPostsByTagSlug(slug);

  if (!response.data) {
    notFound();
  }

  const { tag, posts } = response.data;
  const transformedPosts = posts.map(transformBlogPostForDisplay);

  // Pagination
  const totalPages = Math.ceil(transformedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = transformedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  // Generate structured data
  const structuredData = generateTagSchema(tag, transformedPosts);

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.collectionPage),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />

      <main className='min-h-screen bg-slate-50 dark:bg-slate-950'>
        <PageHeader
          title={`#${tag.name}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Tags', href: '/blog' },
            { label: `#${tag.name}`, href: `/tag/${tag.slug}` },
          ]}
        />

        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          {/* Tag Badge */}
          <div className='flex items-center gap-2 mb-6'>
            <span className='inline-flex items-center gap-1.5 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium'>
              <Tag className='h-4 w-4' />
              {tag.name}
            </span>
          </div>

          {/* Tag Description */}
          {tag.description && (
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl'>
              {tag.description}
            </p>
          )}

          {/* Posts Count */}
          <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} found
          </p>

          {/* Posts Grid */}
          {paginatedPosts.length > 0 ? (
            <>
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {paginatedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    image={post.image}
                    title={post.title}
                    author={post.author}
                    date={post.date}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    titleTag='h2'
                    analytics={post.analytics}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-12 flex justify-center'>
                  <nav className='flex items-center gap-2'>
                    {currentPage > 1 && (
                      <a
                        href={`/tag/${slug}?page=${currentPage - 1}`}
                        className='px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors'>
                        Previous
                      </a>
                    )}

                    <span className='px-4 py-2 text-sm text-slate-600 dark:text-slate-400'>
                      Page {currentPage} of {totalPages}
                    </span>

                    {currentPage < totalPages && (
                      <a
                        href={`/tag/${slug}?page=${currentPage + 1}`}
                        className='px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors'>
                        Next
                      </a>
                    )}
                  </nav>
                </div>
              )}

              {/* Multiplex Ad after the grid */}
              <div className='mt-16 pt-8'>
                <MultiplexAd containerClassName='' />
              </div>
            </>
          ) : (
            <div className='text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
              <p className='text-slate-500 dark:text-slate-400'>
                No articles found with this tag. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
