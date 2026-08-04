import Link from 'next/link';
import Image from 'next/image';
import { serverApi } from '@/lib/api/server';
import { FooterNewsletter } from './footer-newsletter';
import { Scale, Calculator, Shuffle, PiggyBank, Layers } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Tools & Calculators', href: '/tools' },
  { label: 'All Guides', href: '/blog' },
  { label: 'Topics', href: '/category' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

/**
 * Server component: the topic links must exist in the initial HTML. Fetching
 * them client-side left `Loading topics...` in the server response, so Googlebot
 * saw no internal links here at all.
 */
export async function Footer() {
  const { data } = await serverApi.getNavigationCategories();
  const categories = data ?? [];

  return (
    <footer className='bg-foreground text-background'>
      {/* Main footer content */}
      <div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>

          {/* Brand column */}
          <div className='lg:col-span-1'>
            <Link href='/' className='inline-flex items-center gap-2.5 mb-5'>
              {/* Footer bg inverts relative to page mode, so the logo mapping is
                  reversed from the header: white mark by default (light-mode's
                  dark footer), navy mark in dark mode (dark-mode's light footer). */}
              <Image
                src='/icon_white_wealthalgor.png'
                alt=''
                width={240}
                height={240}
                className='h-9 w-auto dark:hidden'
              />
              <Image
                src='/primary_wealthalgor.png'
                alt=''
                width={223}
                height={250}
                className='hidden h-9 w-auto dark:block'
              />
              <span className='text-lg font-bold text-background tracking-tight'>
                WealthAlgor
              </span>
            </Link>
            <p className='text-sm leading-relaxed text-background/65 mb-6'>
              Independent research on robo-advisors and automated investing —
              honest comparisons, the mechanics behind the algorithms, and
              calculators that use your own numbers instead of a sample
              portfolio. Not financial advice.
            </p>
            {/* Trust signals */}
            <div className='flex flex-wrap gap-3'>
              {[
                { icon: Scale, label: 'Comparisons' },
                { icon: Calculator, label: 'Mechanics' },
                { icon: Shuffle, label: 'Alternatives' },
                { icon: PiggyBank, label: 'Money Habits' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className='flex items-center gap-1.5 rounded-full border border-background/15 bg-background/8 px-3 py-1 text-xs text-background/60'>
                  <Icon className='h-3 w-3' />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className='mb-5 text-xs font-bold uppercase tracking-widest text-background/50'>
              Navigation
            </h3>
            <nav className='space-y-3'>
              {QUICK_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className='block text-sm text-background/65 hover:text-background transition-colors duration-150'>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Topics */}
          <div>
            <h3 className='mb-5 text-xs font-bold uppercase tracking-widest text-background/50'>
              Topics
            </h3>
            <nav className='space-y-3'>
              {categories.slice(0, 7).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className='flex items-center gap-2 text-sm text-background/65 hover:text-background transition-colors duration-150 group'>
                  <Layers className='h-3.5 w-3.5 text-background/30 group-hover:text-background/60 transition-colors' />
                  {category.name}
                </Link>
              ))}
              {categories.length > 7 && (
                <Link
                  href='/category'
                  className='text-xs font-semibold text-primary hover:underline'>
                  View all topics →
                </Link>
              )}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className='mb-5 text-xs font-bold uppercase tracking-widest text-background/50'>
              Weekly Digest
            </h3>
            <p className='text-sm text-background/65 mb-4 leading-relaxed'>
              New robo-advisor comparisons and calculator updates delivered
              weekly. No spam.
            </p>
            <FooterNewsletter />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className='border-t border-background/10'>
        <div className='mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-xs text-background/70'>
              &copy; {new Date().getFullYear()} WealthAlgor. All rights reserved.
            </p>
            <div className='flex gap-5 text-xs text-background/70'>
              <Link href='/about' className='hover:text-background transition-colors'>
                About
              </Link>
              <Link href='/privacy' className='hover:text-background transition-colors'>
                Privacy Policy
              </Link>
              <Link href='/contact' className='hover:text-background transition-colors'>
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
