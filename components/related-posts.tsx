import { ArticleCard } from './article-card';

interface RelatedPostsProps {
  posts: Array<{
    id: number;
    slug: string;
    title: string;
    category: string;
    image: string;
    author: {
      name: string;
      avatar: string;
    };
    date: string;
    excerpt?: string;
    analytics?: { views: number; likes: number };
  }>;
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className='mt-12 pt-12'>
      <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-4'>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-white'>
          Related Posts
        </h2>
        <p className='text-slate-600 dark:text-slate-400 lg:max-w-sm lg:text-right'>
          Explore more articles that might interest you.
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {posts.map((post, index) => (
          <ArticleCard key={index} {...post} slug={post.slug} analytics={post.analytics} />
        ))}
      </div>
    </section>
  );
}
