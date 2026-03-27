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

      <main className='min-h-screen bg-background'>
        <PageHeader
          title={`#${tag.name}`}
          description={tag.description}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Tags', href: '/tag' },
            { label: `#${tag.name}`, href: `/tag/${tag.slug}` },
          ]}
        />

        <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
          {/* Posts count */}
          <p className='text-xs text-muted-foreground mb-6 font-medium uppercase tracking-widest'>
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'} tagged #{tag.name}
          </p>

          {/* Posts Grid */}
          {paginatedPosts.length > 0 ? (
            <>
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {paginatedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    image={post.image}
                    title={post.title}
                    author={post.author}
                    date={post.date}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    category={post.category}
                    readTime={post.readTime}
                    titleTag='h2'
                    analytics={post.analytics}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-10 flex justify-center'>
                  <nav className='flex items-center gap-2'>
                    {currentPage > 1 && (
                      <a
                        href={`/tag/${slug}?page=${currentPage - 1}`}
                        className='rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors'>
                        ← Previous
                      </a>
                    )}
                    <span className='px-4 py-2 text-sm text-muted-foreground'>
                      {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <a
                        href={`/tag/${slug}?page=${currentPage + 1}`}
                        className='rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors'>
                        Next →
                      </a>
                    )}
                  </nav>
                </div>
              )}

              {/* Ad after grid */}
              <div className='mt-14 ad-slot min-h-[200px] flex items-center justify-center'>
                <MultiplexAd containerClassName='w-full' />
              </div>
            </>
          ) : (
            <div className='rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center'>
              <p className='text-muted-foreground text-sm'>
                No guides found with this tag. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
