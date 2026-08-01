'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
    } catch {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <section className='py-14 bg-background border-t border-border'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative overflow-hidden rounded-2xl bg-primary px-8 py-12 md:px-14 md:py-16 shadow-lg border-t-2 border-highlight'>
          {/* Fine grid pattern — precision/data motif, not a marketing gradient */}
          <div
            className='absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className='relative max-w-2xl mx-auto text-center'>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 mb-5'>
              <Sparkles className='h-3.5 w-3.5 text-white/80' />
              <span className='text-xs font-semibold uppercase tracking-widest text-white/80'>
                Weekly Digest
              </span>
            </div>

            <h2 className='text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight'>
              Stay Ahead of Robo-Advisor Changes
            </h2>
            <p className='text-base md:text-lg text-white/75 mb-8 leading-relaxed'>
              New comparisons, calculator updates, and plain-English
              breakdowns of how the algorithms actually work — delivered
              every week. No noise.
            </p>

            <form
              onSubmit={handleSubmit}
              className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
              <Input
                type='email'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/40 focus-visible:border-white/50'
                disabled={isLoading || status === 'success'}
                aria-label='Email address'
              />
              <Button
                type='submit'
                size='lg'
                disabled={isLoading || status === 'success'}
                className='shrink-0 bg-white text-primary font-bold hover:bg-white/90 transition-colors shadow-md'>
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
                  'Subscribe Free'
                )}
              </Button>
            </form>

            {message && (
              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                  status === 'success'
                    ? 'bg-green-400/20 text-green-100'
                    : 'bg-red-400/20 text-red-100'
                }`}>
                {status === 'success' ? (
                  <CheckCircle2 className='h-4 w-4 shrink-0' />
                ) : (
                  <AlertCircle className='h-4 w-4 shrink-0' />
                )}
                <span>{message}</span>
              </div>
            )}

            <p className='text-xs text-white/50 mt-5'>
              No spam, ever. Unsubscribe with one click anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
