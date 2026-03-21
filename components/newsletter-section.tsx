'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { newsletterApi } from '@/lib/api/newsletter';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || isLoading) return;

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await newsletterApi.subscribe({
        email,
        source: 'homepage',
      });

      if (response.data?.success) {
        setStatus('success');
        setMessage(response.data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(
          response.error?.message || 'Failed to subscribe. Please try again.',
        );
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='rounded-xl bg-primary/10 p-8 md:p-12 shadow-sm'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='flex justify-center mb-6'>
            <div className='rounded-full bg-primary/20 p-4 animate-pulse'>
              <Mail className='h-8 w-8 text-primary' />
            </div>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Stay Updated
          </h2>
          <p className='text-lg md:text-xl text-muted-foreground mb-8'>
            Get the latest articles, insights, and updates delivered straight to
            your inbox. Join our community of readers who never miss a story.
          </p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
            <Input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='flex-1 bg-white'
              disabled={isLoading || status === 'success'}
              aria-label='Email address'
            />
            <Button
              type='submit'
              size='lg'
              disabled={isLoading || status === 'success'}
              className='w-full sm:w-auto'>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Subscribing...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                  Subscribed!
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </form>

          {/* Status message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 text-sm ${
                status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
              {status === 'success' ? (
                <CheckCircle2 className='h-4 w-4' />
              ) : (
                <AlertCircle className='h-4 w-4' />
              )}
              <span>{message}</span>
            </div>
          )}

          <p className='text-sm text-muted-foreground mt-4'>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
