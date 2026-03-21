'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { newsletterApi } from '@/lib/api/newsletter';

function VerificationContent() {
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
        'Invalid verification link. Please check your email and try again.',
      );
      return;
    }

    const verifySubscription = async () => {
      try {
        const response = await newsletterApi.verifySubscription(token);
        if (response.data?.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(
            response.error?.message || 'Failed to verify subscription.',
          );
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your subscription.');
      }
    };

    verifySubscription();
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
            Verifying Your Subscription...
          </h1>
          <p className='text-slate-600 dark:text-slate-400'>
            Please wait while we confirm your email address.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className='flex justify-center mb-6'>
            <div className='rounded-full bg-green-100 dark:bg-green-900/30 p-4'>
              <CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
            Subscription Verified!
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mb-6'>{message}</p>
          <div className='flex flex-col gap-3'>
            <Link href='/blog'>
              <Button className='w-full'>Explore Our Blog</Button>
            </Link>
            <Link href='/'>
              <Button variant='outline' className='w-full'>
                Go to Homepage
              </Button>
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
            Verification Failed
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

export default function VerifySubscriptionPage() {
  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        <Suspense fallback={<LoadingFallback />}>
          <VerificationContent />
        </Suspense>
      </div>
    </main>
  );
}
