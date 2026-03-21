'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Loader2, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { newsletterApi } from '@/lib/api/newsletter';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(
        'Invalid unsubscribe link. Please check your email and try again.',
      );
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await newsletterApi.unsubscribe(token);
        if (response.data?.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(response.error?.message || 'Failed to unsubscribe.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while processing your request.');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-8 text-center'>
      {status === 'loading' && (
        <>
          <div className='flex justify-center mb-6'>
            <div className='rounded-full bg-blue-100 dark:bg-blue-900/30 p-4'>
              <Loader2 className='h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin' />
            </div>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
            Processing Your Request...
          </h1>
          <p className='text-slate-600 dark:text-slate-400'>
            Please wait while we unsubscribe you from our newsletter.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className='flex justify-center mb-6'>
            <div className='rounded-full bg-amber-100 dark:bg-amber-900/30 p-4'>
              <MailX className='h-8 w-8 text-amber-600 dark:text-amber-400' />
            </div>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
            You've Been Unsubscribed
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mb-6'>{message}</p>
          <p className='text-slate-500 dark:text-slate-500 text-sm mb-6'>
            Changed your mind? You can always re-subscribe from our homepage.
          </p>
          <div className='flex flex-col gap-3'>
            <Link href='/'>
              <Button className='w-full'>Go to Homepage</Button>
            </Link>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className='flex justify-center mb-6'>
            <div className='rounded-full bg-red-100 dark:bg-red-900/30 p-4'>
              <XCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
            Something Went Wrong
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mb-6'>{message}</p>
          <div className='flex flex-col gap-3'>
            <Link href='/'>
              <Button className='w-full'>Go to Homepage</Button>
            </Link>
            <Link href='/contact'>
              <Button variant='outline' className='w-full'>
                Contact Support
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-8 text-center'>
      <div className='flex justify-center mb-6'>
        <div className='rounded-full bg-blue-100 dark:bg-blue-900/30 p-4'>
          <Loader2 className='h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin' />
        </div>
      </div>
      <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        Loading...
      </h1>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        <Suspense fallback={<LoadingFallback />}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </main>
  );
}
