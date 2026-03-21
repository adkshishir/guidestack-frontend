import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { ArticleCard } from '@/components/article-card';
import { Pagination } from '@/components/pagination';
import { AdUnit, MultiplexAd } from '@/components/adsense';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl, toAbsoluteHttpsUrl } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await serverApi.getBlogPostsByCategorySlug(slug);

  if (!response.data) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const { category } = response.data;
  const siteUrl = getBaseUrl();
  const categoryUrl = `${siteUrl}/category/${slug}`;

  // Get category image for OG (HTTPS for Search Console)
  const categoryImageUrl =
    category.featuredImage?.url || category.featuredImage?.filePath;
  const ogImages = categoryImageUrl
    ? [
        {
          url: toAbsoluteHttpsUrl(categoryImageUrl, siteUrl),
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ]
    : undefined;

  return {
    title: `${category.name} - GuideStack`,
    description:
      category.description ||
      `Browse all articles in the ${category.name} category on GuideStack.`,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${category.name} - GuideStack`,
      description:
        category.description ||
        `Browse all articles in the ${category.name} category on GuideStack.`,
      url: categoryUrl,
      siteName: 'GuideStack',
      locale: 'en_US',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - GuideStack`,
      description:
        category.description ||
        `Browse all articles in the ${category.name} category on GuideStack.`,
      images: ogImages,
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

// Generate JSON-LD structured data for category page
function generateCategorySchema(
  category: { name: string; slug: string; description?: string },
  posts: any[],
) {
  const siteUrl = getBaseUrl();
  const categoryUrl = `${siteUrl}/category/${category.slug}`;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description:
      category.description || `Articles in the ${category.name} category`,
    url: categoryUrl,
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
        name: category.name,
        item: categoryUrl,
      },
    ],
  };

  return {
    collectionPage: collectionPageSchema,
    breadcrumb: breadcrumbSchema,
  };
}

const POSTS_PER_PAGE = 9;

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);

  const response = await serverApi.getBlogPostsByCategorySlug(slug);

  if (!response.data) {
    notFound();
  }

  const { category, posts } = response.data;
  const transformedPosts = posts.map(transformBlogPostForDisplay);

  // Pagination
  const totalPages = Math.ceil(transformedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = transformedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  // Generate structured data
  const structuredData = generateCategorySchema(category, transformedPosts);

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
        {/* Category Hero with Image */}
        {category.featuredImage?.url || category.featuredImage?.filePath ? (
          <div className='relative h-64 md:h-80 w-full overflow-hidden'>
            <Image
              src={
                category.featuredImage.url || category.featuredImage.filePath!
              }
              alt={category.name}
              fill
              className='object-cover'
              priority
              sizes='100vw'
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent' />
            <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8'>
              <div className='mx-auto max-w-7xl'>
                <nav className='mb-2 flex flex-wrap gap-2 text-sm'>
                  <a
                    href='/'
                    className='text-white/80 hover:text-white transition-colors'>
                    Home
                  </a>
                  <span className='text-white/50'>/</span>
                  <a
                    href='/category'
                    className='text-white/80 hover:text-white transition-colors'>
                    Categories
                  </a>
                  <span className='text-white/50'>/</span>
                  <span className='text-white'>{category.name}</span>
                </nav>
                <h1 className='text-3xl md:text-4xl font-bold text-white'>
                  {category.name}
                </h1>
              </div>
            </div>
          </div>
        ) : (
          <PageHeader
            title={category.name}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Categories', href: '/category' },
              { label: category.name, href: `/category/${category.slug}` },
            ]}
          />
        )}

        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          {/* Category Description */}
          {category.description && (
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl'>
              {category.description}
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
                        href={`/category/${slug}?page=${currentPage - 1}`}
                        className='px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors'>
                        Previous
                      </a>
                    )}

                    <span className='px-4 py-2 text-sm text-slate-600 dark:text-slate-400'>
                      Page {currentPage} of {totalPages}
                    </span>

                    {currentPage < totalPages && (
                      <a
                        href={`/category/${slug}?page=${currentPage + 1}`}
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
                No articles found in this category. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
