import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { serverApi } from '@/lib/api/server';
import { getBaseUrl } from '@/lib/seo';
import { Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Tags',
  description:
    'Browse all tags on WealthAlgor. Discover topics and find articles by tag.',
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/tag',
  },
  openGraph: {
    title: 'All Tags',
    description:
      'Browse all tags on WealthAlgor. Discover topics and find articles by tag.',
    url: '/tag',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/banner_wealthalgor.png',
        width: 702,
        height: 528,
        alt: 'WealthAlgor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Tags',
    description:
      'Browse all tags on WealthAlgor. Discover topics and find articles by tag.',
    images: ['/banner_wealthalgor.png'],
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
function generateTagsSchema(tags: Array<{ name: string; slug: string }>) {
  const siteUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Tags',
    description: 'Browse all tags on WealthAlgor',
    url: `${siteUrl}/tag`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tags.length,
      itemListElement: tags.map((tag, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/tag/${tag.slug}`,
        name: tag.name,
      })),
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'WealthAlgor',
      url: siteUrl,
    },
  };
}

export default async function TagsPage() {
  const response = await serverApi.getTags();
  const tags = response.data || [];

  const structuredData = generateTagsSchema(tags);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <PageHeader
        title='Browse by Tag'
        description='Find guides by topic tag. Click any tag to explore related content.'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tags', href: '/tag' },
        ]}
      />

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {tags.length === 0 ? (
          <div className='flex flex-col items-center py-20 text-center'>
            <Tag className='h-12 w-12 text-muted-foreground/30 mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              No tags yet
            </h3>
            <p className='text-sm text-muted-foreground'>
              Check back soon for new content.
            </p>
          </div>
        ) : (
          <div className='flex flex-wrap gap-2.5'>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className='inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/8 hover:text-primary transition-all duration-150 shadow-sm'>
                <Tag className='h-3.5 w-3.5' />
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
