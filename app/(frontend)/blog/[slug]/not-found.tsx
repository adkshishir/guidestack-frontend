import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'

export default function NotFound() {
  return (
    <main className='min-h-screen bg-white'>
      <PageHeader
        title='Post Not Found'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
      />
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>404</h1>
          <p className='mb-8 text-lg text-muted-foreground'>
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <div className='flex justify-center gap-4'>
            <Link href='/blog'>
              <Button size="lg">Back to Blog</Button>
            </Link>
            <Link href='/'>
              <Button variant="outline" size="lg">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

