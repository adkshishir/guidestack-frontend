'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { newsletterApi } from '@/lib/api/newsletter';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Interactive half of the footer. Split out of `Footer` so the footer itself can
 * be a server component and emit its topic links into the initial HTML.
 */
export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

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
    <form onSubmit={handleSubscribe} className='space-y-2.5'>
      <Input
        type='email'
        placeholder='your@email.com'
        className='bg-background/10 border-background/15 text-background placeholder:text-background/35 focus-visible:border-primary focus-visible:ring-0 text-sm'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading || subscribeStatus === 'success'}
        required
      />
      <Button
        type='submit'
        className='w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm'
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
          'Subscribe Free'
        )}
      </Button>
      {statusMessage && (
        <p
          className={`text-xs ${
            subscribeStatus === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
          {statusMessage}
        </p>
      )}
    </form>
  );
}
