import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { serverApi } from '@/lib/api/server';
import { getBaseUrl } from '@/lib/seo';
import { FolderOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Categories - GuideStack',
  description:
    'Browse all categories on GuideStack. Explore our curated collection of topics covering wealth management, algorithmic trading, and technology trends.',
  alternates: {
    canonical: '/category',
  },
  openGraph: {
    title: 'All Categories - GuideStack',
    description:
      'Browse all categories on GuideStack. Explore our curated collection of topics covering wealth management, algorithmic trading, and technology trends.',
    url: '/category',
    siteName: 'GuideStack',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Categories - GuideStack',
    description:
      'Browse all categories on GuideStack. Explore our curated collection of topics.',
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

// Generate JSON-LD structured data
function generateCategoriesSchema(
  categories: Array<{ name: string; slug: string }>,
) {
  const siteUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Categories',
    description: 'Browse all categories on GuideStack',
    url: `${siteUrl}/category`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categories.length,
      itemListElement: categories.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/category/${category.slug}`,
        name: category.name,
      })),
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'GuideStack',
      url: siteUrl,
    },
  };
}

export default async function CategoriesPage() {
  const response = await serverApi.getCategories();
  const categories = response.data || [];

  const structuredData = generateCategoriesSchema(categories);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <PageHeader
        title='All Categories'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/category' },
        ]}
      />

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {categories.length === 0 ? (
          <div className='text-center py-12'>
            <FolderOpen className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-4 text-lg font-medium text-foreground'>
              No categories found
            </h3>
            <p className='mt-2 text-muted-foreground'>
              Check back later for new content.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map((category) => {
              const imageUrl =
                category.featuredImage?.url || category.featuredImage?.filePath;
              const hasImage = imageUrl && imageUrl !== '/placeholder.svg';

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className='group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50'>
                  {hasImage ? (
                    <div className='relative h-40 w-full overflow-hidden'>
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                      />
                      <div className='absolute inset-0 bg-linear-to-t from-black/60 to-transparent' />
                      <h2 className='absolute bottom-4 left-4 right-4 text-lg font-semibold text-white'>
                        {category.name}
                      </h2>
                    </div>
                  ) : (
                    <div className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                          <FolderOpen className='h-6 w-6' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h2 className='text-lg font-semibold text-foreground group-hover:text-primary transition-colors'>
                            {category.name}
                          </h2>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
