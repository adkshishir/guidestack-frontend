import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { serverApi } from '@/lib/api/server';
import { getBaseUrl } from '@/lib/seo';
import { Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Tags - GuideStack',
  description:
    'Browse all tags on GuideStack. Discover topics and find articles by tag.',
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/tag',
  },
  openGraph: {
    title: 'All Tags - GuideStack',
    description:
      'Browse all tags on GuideStack. Discover topics and find articles by tag.',
    url: '/tag',
    siteName: 'GuideStack',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Tags - GuideStack',
    description:
      'Browse all tags on GuideStack. Discover topics and find articles by tag.',
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
    description: 'Browse all tags on GuideStack',
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
      name: 'GuideStack',
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
        title='All Tags'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tags', href: '/tag' },
        ]}
      />

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {tags.length === 0 ? (
          <div className='text-center py-12'>
            <Tag className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-4 text-lg font-medium text-foreground'>
              No tags found
            </h3>
            <p className='mt-2 text-muted-foreground'>
              Check back later for new content.
            </p>
          </div>
        ) : (
          <div className='flex flex-wrap gap-3'>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:text-primary'>
                <Tag className='h-4 w-4' />
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
