import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { TOOLS } from '@/lib/tools-data';
import { getBaseUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free Robo-Advisor Tools & Calculators - WealthAlgor',
  description:
    'Interactive calculators for automated investing decisions: compare robo-advisor fees, project retirement savings, and more.',
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: 'Free Robo-Advisor Tools & Calculators - WealthAlgor',
    description:
      'Interactive calculators for automated investing decisions: compare robo-advisor fees, project retirement savings, and more.',
    url: '/tools',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'WealthAlgor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Robo-Advisor Tools & Calculators - WealthAlgor',
    description:
      'Interactive calculators for automated investing decisions on WealthAlgor.',
    images: ['/logo.png'],
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

function generateToolsIndexSchema() {
  const siteUrl = getBaseUrl();

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Robo-Advisor Tools & Calculators',
    description:
      'Interactive calculators for automated investing decisions on WealthAlgor.',
    url: `${siteUrl}/tools`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/tools/${tool.slug}`,
        name: tool.title,
      })),
    },
    isPartOf: { '@type': 'WebSite', name: 'WealthAlgor', url: siteUrl },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${siteUrl}/tools`,
      },
    ],
  };

  return { collectionPage: collectionPageSchema, breadcrumb: breadcrumbSchema };
}

export default function ToolsIndexPage() {
  const structuredData = generateToolsIndexSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.collectionPage),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />

      <main className="min-h-screen bg-background">
        <PageHeader
          title="Free Robo-Advisor Tools & Calculators"
          description="Run the numbers yourself instead of taking a platform's marketing page at its word."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/tools' },
          ]}
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {tool.shortTitle}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open calculator
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
