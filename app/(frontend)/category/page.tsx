import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { serverApi } from '@/lib/api/server';
import { getBaseUrl } from '@/lib/seo';
import {
  Scale,
  Settings2,
  Shield,
  TrendingUp,
  Calculator,
  Landmark,
  Lightbulb,
  Receipt,
  PiggyBank,
  Shuffle,
  Layers,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Topics - WealthAlgor',
  description:
    'Browse all topic areas on WealthAlgor. Explore robo-advisor comparisons, automated investing mechanics, alternatives to pure robo-advisors, and automated money habits.',
  alternates: {
    canonical: '/category',
  },
  openGraph: {
    title: 'All Topics - WealthAlgor',
    description:
      'Browse all topic areas on WealthAlgor. Practical guides on tech, finance, and more.',
    url: '/category',
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
    title: 'All Topics - WealthAlgor',
    description: 'Browse all topics on WealthAlgor.',
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

function generateCategoriesSchema(
  categories: Array<{ name: string; slug: string }>,
) {
  const siteUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Topics',
    description: 'Browse all topics on WealthAlgor',
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
    isPartOf: { '@type': 'WebSite', name: 'WealthAlgor', url: siteUrl },
  };
}

// One consistent card treatment (not a rainbow per category) reads as a
// research site, not a tutorial index — the icon alone carries the meaning.
const CATEGORY_STYLES: {
  keywords: string[];
  icon: React.ElementType;
}[] = [
  { keywords: ['compar', 'vs', 'review', 'rank'], icon: Scale },
  {
    keywords: ['algorithm', 'mechanic', 'rebalanc', 'tax-loss', 'tax loss', 'how it works'],
    icon: Settings2,
  },
  { keywords: ['security', 'privacy', 'safe', 'protect', 'sipc', 'insur'], icon: Shield },
  {
    keywords: ['portfolio', 'invest', 'etf', 'stock', 'asset', 'allocation', 'wealth'],
    icon: TrendingUp,
  },
  { keywords: ['calculator', 'tool', 'estimate', 'planner'], icon: Calculator },
  { keywords: ['retire', '401k', 'ira', 'pension'], icon: Landmark },
  { keywords: ['beginner', 'basics', 'getting started', 'guide'], icon: Lightbulb },
  { keywords: ['fee', 'cost', 'pricing', 'price'], icon: Receipt },
  { keywords: ['budget', 'habit', 'saving', 'save', 'money'], icon: PiggyBank },
  { keywords: ['alternative', 'diy', 'self-directed', 'hybrid'], icon: Shuffle },
];

const DEFAULT_STYLE = { icon: Layers };

function getCategoryStyle(name: string) {
  const lower = name.toLowerCase();
  for (const style of CATEGORY_STYLES) {
    if (style.keywords.some((kw) => lower.includes(kw))) return style;
  }
  return DEFAULT_STYLE;
}

export default async function CategoriesPage() {
  const response = await serverApi.getCategories();
  const categories = response.data || [];
  const structuredData = generateCategoriesSchema(categories);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PageHeader
        title='Explore All Topics'
        description='Choose a subject area to browse guides and tutorials.'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Topics', href: '/category' },
        ]}
      />

      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {categories.length === 0 ? (
          <div className='flex flex-col items-center py-20 text-center'>
            <BookOpen className='h-12 w-12 text-muted-foreground/30 mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              No topics yet
            </h3>
            <p className='text-muted-foreground text-sm'>
              Check back soon for new content.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {categories.map((category) => {
              const style = getCategoryStyle(category.name);
              const Icon = style.icon;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className='group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:shadow-sm hover:border-primary/40 transition-all duration-200'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h2 className='font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug'>
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className='h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5' />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
