import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { serverApi } from '@/lib/api/server';
import { getBaseUrl } from '@/lib/seo';
import {
  Code2,
  Brain,
  Shield,
  TrendingUp,
  Wrench,
  Globe,
  Lightbulb,
  BarChart2,
  Database,
  Cpu,
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Topics - WealthAlgor',
    description: 'Browse all topics on WealthAlgor.',
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

const CATEGORY_STYLES: {
  keywords: string[];
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    keywords: ['develop', 'code', 'program', 'engineer', 'software', 'frontend', 'backend'],
    icon: Code2,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-l-blue-500',
  },
  {
    keywords: ['ai', 'machine', 'learn', 'ml', 'deep', 'neural', 'llm', 'gpt'],
    icon: Brain,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-l-violet-500',
  },
  {
    keywords: ['security', 'cyber', 'hack', 'privacy', 'safe', 'protect'],
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-l-red-500',
  },
  {
    keywords: ['finance', 'money', 'invest', 'crypto', 'budget', 'wealth', 'stock'],
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-l-green-500',
  },
  {
    keywords: ['tool', 'devops', 'infra', 'cloud', 'docker', 'kubernetes', 'deploy'],
    icon: Wrench,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-l-orange-500',
  },
  {
    keywords: ['data', 'database', 'sql', 'analytics', 'bigdata'],
    icon: Database,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-l-cyan-500',
  },
  {
    keywords: ['product', 'design', 'ux', 'ui', 'creative'],
    icon: Lightbulb,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-l-yellow-500',
  },
  {
    keywords: ['productivity', 'career', 'growth', 'skill', 'self'],
    icon: BarChart2,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-l-pink-500',
  },
  {
    keywords: ['web', 'internet', 'network', 'api', 'rest'],
    icon: Globe,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-l-teal-500',
  },
  {
    keywords: ['hardware', 'embedded', 'iot', 'raspberry', 'arduino'],
    icon: Cpu,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-950/40',
    border: 'border-l-slate-500',
  },
];

const DEFAULT_STYLE = {
  icon: Layers,
  color: 'text-primary',
  bg: 'bg-primary/8',
  border: 'border-l-primary',
};

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
                  className={`group flex items-start gap-4 rounded-xl border border-border border-l-4 ${style.border} ${style.bg} p-5 hover:shadow-sm hover:border-primary/30 transition-all duration-200`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/70 ${style.color}`}>
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
