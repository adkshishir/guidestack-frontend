import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center p-4 text-center'>
      <div className='mb-6 rounded-full bg-slate-100 p-6 dark:bg-slate-800'>
        <FileQuestion className='h-12 w-12 text-slate-400' />
      </div>
      <h1 className='text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl'>
        Page not found
      </h1>
      <p className='mt-4 max-w-lg text-lg text-slate-600 dark:text-slate-400'>
        Sorry, we couldn't find the page you're looking for. It might have been
        moved, deleted, or never existed.
      </p>
      <div className='mt-8 flex gap-4'>
        <Button asChild>
          <Link href='/'>Go to Home</Link>
        </Button>
        <Button variant='outline' asChild>
          <Link href='/blog'>Browse Articles</Link>
        </Button>
      </div>
    </div>
  );
}
