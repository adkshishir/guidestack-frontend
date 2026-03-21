'use client';

import Link from 'next/link';
import { FolderOpen, Tag, ArrowRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
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



export function HomeCategoriesTags({
  categories,
  tags,
}: HomeCategoriesTagsProps) {
  const showCategories = categories.length > 0;

  if (!showCategories) return null;

  return (
    <section className='py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10'>
          {/* Categories */}
          {showCategories && (
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                  <FolderOpen className='h-5 w-5 text-primary' />
                  Categories
                </h2>
                <Link
                  href='/category'
                  className='text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1'>
                  View all
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
              <div className='flex flex-wrap gap-2'>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className='inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors'>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
