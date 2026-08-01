import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { TOOLS } from '@/lib/tools-data';

export function ToolsShowcaseSection() {
  return (
    <section className='py-14 bg-muted/20 border-y border-border'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-end justify-between mb-8'>
          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-foreground tracking-tight'>
              Free Robo-Advisor Calculators
            </h2>
            <p className='mt-1.5 text-muted-foreground text-sm'>
              Run the numbers yourself, using your own inputs — not a sample
              portfolio.
            </p>
          </div>
          <Link
            href='/tools'
            className='hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'>
            View all tools →
          </Link>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className='group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Calculator className='h-5 w-5' />
                </div>
                <h3 className='font-semibold text-sm text-foreground leading-snug'>
                  {tool.shortTitle}
                </h3>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
                {tool.description}
              </p>
              <span className='mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary'>
                Open calculator
                <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href='/tools'
          className='mt-6 flex sm:hidden items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline'>
          View all tools →
        </Link>
      </div>
    </section>
  );
}
