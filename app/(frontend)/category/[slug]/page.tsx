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
    : [
        {
          url: `${siteUrl}/logo.png`,
          width: 1024,
          height: 1024,
          alt: 'WealthAlgor',
        },
      ];

  return {
    title: `${category.name} - WealthAlgor`,
    description:
      category.description ||
      `Browse all articles in the ${category.name} category on WealthAlgor.`,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${category.name} - WealthAlgor`,
      description:
        category.description ||
        `Browse all articles in the ${category.name} category on WealthAlgor.`,
      url: categoryUrl,
      siteName: 'WealthAlgor',
      locale: 'en_US',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - WealthAlgor`,
      description:
        category.description ||
        `Browse all articles in the ${category.name} category on WealthAlgor.`,
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
      name: 'WealthAlgor',
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

      <main className='min-h-screen bg-background'>
        {/* Category Hero with Image */}
        {category.featuredImage?.url || category.featuredImage?.filePath ? (
          <div className='relative h-56 md:h-72 w-full overflow-hidden'>
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
            <div className='absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-transparent' />
            <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8'>
              <div className='mx-auto max-w-7xl'>
                <nav className='mb-2 flex flex-wrap items-center gap-1.5 text-xs text-white/70'>
                  <a href='/' className='hover:text-white transition-colors'>Home</a>
                  <span>/</span>
                  <a href='/category' className='hover:text-white transition-colors'>Topics</a>
                  <span>/</span>
                  <span className='text-white font-medium'>{category.name}</span>
                </nav>
                <h1 className='text-2xl md:text-3xl font-bold text-white tracking-tight'>
                  {category.name}
                </h1>
                {category.description && (
                  <p className='mt-2 text-white/75 text-sm max-w-2xl'>
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <PageHeader
            title={category.name}
            description={category.description}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Topics', href: '/category' },
              { label: category.name, href: `/category/${category.slug}` },
            ]}
          />
        )}

        <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
          {/* Posts count row */}
          <p className='text-xs text-muted-foreground mb-6 font-medium uppercase tracking-widest'>
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'} in this topic
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
                        href={`/category/${slug}?page=${currentPage - 1}`}
                        className='rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors'>
                        ← Previous
                      </a>
                    )}
                    <span className='px-4 py-2 text-sm text-muted-foreground'>
                      {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <a
                        href={`/category/${slug}?page=${currentPage + 1}`}
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
                No guides found in this topic. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
