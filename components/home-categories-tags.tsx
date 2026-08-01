'use client';

import Link from 'next/link';
import {
  Scale,
  Settings2,
  Shield,
  TrendingUp,
  Calculator,
  Landmark,
  BookOpen,
  Receipt,
  PiggyBank,
  Lightbulb,
  Shuffle,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

interface HomeCategoriesTagsProps {
  categories: Category[];
  tags: TagItem[];
}

// Map category name keywords to a semantic icon. One consistent card
// treatment (not a rainbow per category) reads as a research site, not a
// tutorial index — the icon alone carries the meaning.
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
    if (style.keywords.some((kw) => lower.includes(kw))) {
      return style;
    }
  }
  return DEFAULT_STYLE;
}

export function HomeCategoriesTags({ categories, tags }: HomeCategoriesTagsProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className='section-alt border-y border-border py-14'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Section header */}
        <div className='flex items-end justify-between mb-8'>
          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-foreground tracking-tight'>
              Explore by Topic
            </h2>
            <p className='mt-1.5 text-muted-foreground text-sm'>
              Choose a subject area to start learning.
            </p>
          </div>
          <Link
            href='/category'
            className='hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'>
            All topics
            <ArrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>

        {/* Category grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
          {categories.map((cat) => {
            const style = getCategoryStyle(cat.name);
            const Icon = style.icon;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className='group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-sm hover:border-primary/40 transition-all duration-200'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary'>
                  <Icon className='h-5 w-5' />
                </div>
                <div>
                  <p className={`font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug`}>
                    {cat.name}
                  </p>
                  {cat.post_count !== undefined && cat.post_count > 0 && (
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {cat.post_count} guide{cat.post_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}

          {/* "View all" card */}
          <Link
            href='/category'
            className='group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/50 p-4 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <BookOpen className='h-5 w-5 text-primary' />
            </div>
            <p className='text-sm font-semibold text-primary text-center leading-snug'>
              All Topics
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
