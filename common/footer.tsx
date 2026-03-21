'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { taxonomyApi, NavigationCategory } from '@/lib/api/taxonomy';
import { newsletterApi } from '@/lib/api/newsletter';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function Footer() {
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await taxonomyApi.navigation.getCategories();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setSubscribeStatus('idle');

    try {
      const response = await newsletterApi.subscribe({
        email,
        source: 'footer',
      });
      if (response.data?.success) {
        setSubscribeStatus('success');
        setStatusMessage(response.data.message);
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setStatusMessage(response.error?.message || 'Failed to subscribe.');
      }
    } catch {
      setSubscribeStatus('error');
      setStatusMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSubscribeStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  return (
    <footer className='bg-muted/30 border-t border-border'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>
          {/* About */}
          <div>
            <h3 className='text-base font-bold text-foreground mb-4'>
              About
            </h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              We publish step-by-step guides, tutorials, and in-depth articles
              on software development, AI, cybersecurity, personal finance,
              and productivity. Every article is designed to help you build
              real skills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-base font-bold text-foreground mb-4'>
              Quick Links
            </h3>
            <nav className='space-y-2.5'>
              <Link
                href='/'
                className='block text-sm text-muted-foreground hover:text-foreground transition'>
                Home
              </Link>
              <Link
                href='/blog'
                className='block text-sm text-muted-foreground hover:text-foreground transition'>
                All Guides
              </Link>
              <Link
                href='/privacy'
                className='block text-sm text-muted-foreground hover:text-foreground transition'>
                Privacy Policy
              </Link>
              <Link
                href='/contact'
                className='block text-sm text-muted-foreground hover:text-foreground transition'>
                Contact
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className='text-base font-bold text-foreground mb-4'>
              Topics
            </h3>
            <nav className='space-y-2.5'>
              {categories.length > 0 ? (
                categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className='block text-sm text-muted-foreground hover:text-foreground transition'>
                    {category.name}
                  </Link>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No categories yet
                </p>
              )}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className='text-base font-bold text-foreground mb-4'>
              Stay Updated
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Get new guides delivered to your inbox. No spam.
            </p>
            <form
              onSubmit={handleSubscribe}
              className='flex flex-col gap-2.5'>
              <Input
                type='email'
                placeholder='you@example.com'
                className='text-sm'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || subscribeStatus === 'success'}
                required
              />
              <Button
                type='submit'
                className='w-full'
                disabled={isLoading || subscribeStatus === 'success'}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Subscribing...
                  </>
                ) : subscribeStatus === 'success' ? (
                  <>
                    <CheckCircle2 className='mr-2 h-4 w-4' />
                    Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
              {statusMessage && (
                <p
                  className={`text-xs ${subscribeStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className='border-t border-border'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-xs text-muted-foreground'>
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            <div className='flex gap-5 text-xs text-muted-foreground'>
              <Link
                href='/privacy'
                className='hover:text-foreground transition'>
                Privacy
              </Link>
              <Link
                href='/contact'
                className='hover:text-foreground transition'>
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
