'use client';

import Link from 'next/link';
import {
  Code2,
  Brain,
  Shield,
  TrendingUp,
  Wrench,
  Globe,
  BookOpen,
  Cpu,
  Database,
  Lightbulb,
  BarChart2,
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

// Map category name keywords to icons and accent colors
const CATEGORY_STYLES: {
  keywords: string[];
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    keywords: ['develop', 'code', 'program', 'engineer', 'software', 'web', 'frontend', 'backend'],
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
                className={`group flex flex-col gap-3 rounded-xl border border-border border-l-4 ${style.border} ${style.bg} p-4 hover:shadow-sm hover:border-primary/30 transition-all duration-200`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 ${style.color}`}>
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
