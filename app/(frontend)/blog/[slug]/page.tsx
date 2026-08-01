import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BlogPostDetail } from '@/components/blog-post-detail';
import { BlogPostLayout } from '@/components/blog-post-layout';
import { RelatedPosts } from '@/components/related-posts';
import { CommentsSection } from '@/components/comments-section';
import { ViewTracker } from '@/components/view-tracker';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl, stripHtmlForSchema, toAbsoluteHttpsUrl } from '@/lib/seo';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await serverApi.getBlogPostBySlug(slug);

  if (!response.data) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  const post = response.data;
  const transformedPost = transformBlogPostForDisplay(post);
  const siteUrl = getBaseUrl();
  const postUrl = `${siteUrl}/blog/${slug}`;

  // Get the best available image (post's own image or category fallback) — always HTTPS for SEO
  const postImage = transformedPost.image;
  const hasValidImage = postImage && postImage !== '/placeholder.svg';
  const imageUrl = hasValidImage
    ? toAbsoluteHttpsUrl(postImage, siteUrl)
    : toAbsoluteHttpsUrl('/placeholder.svg', siteUrl);

  const excerpt = post.excerpt || transformedPost.excerpt || post.title;
  const publishedDate = post.publishedAt || post.createdAt || new Date().toISOString();
  const authorName = transformedPost.author.name;

  return {
    title: post.title,
    description: excerpt,
    keywords:
      transformedPost.tags.length > 0 ? transformedPost.tags : undefined,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: 'WealthAlgor',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: excerpt,
      url: postUrl,
      siteName: 'WealthAlgor',
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedDate,
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: transformedPost.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerpt,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate JSON-LD structured data for blog post (all URLs HTTPS for Search Console)
function generateBlogPostSchema(post: any, transformedPost: any) {
  const siteUrl = getBaseUrl();
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const postImage = transformedPost.image;
  const hasValidImage =
    postImage && postImage !== '/placeholder.svg' && postImage !== '';
  const imageUrl = hasValidImage
    ? toAbsoluteHttpsUrl(postImage, siteUrl)
    : toAbsoluteHttpsUrl('/placeholder.svg', siteUrl);
  const publishedDate = post.publishedAt || post.createdAt || new Date().toISOString();
  // Always provide a valid dateModified — fall back to publishedDate so schema never has null
  const modifiedDate = post.updatedAt || publishedDate;

  // Use actual stored image dimensions when available; never claim wrong dimensions to Google
  const imageWidth = post.featuredImage?.width || null;
  const imageHeight = post.featuredImage?.height || null;

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    name: post.title,
    description: post.excerpt || post.title,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      ...(imageWidth ? { width: imageWidth } : {}),
      ...(imageHeight ? { height: imageHeight } : {}),
    },
    thumbnailUrl: imageUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: transformedPost.author.name,
      url: `${siteUrl}/author/${transformedPost.author.name.toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WealthAlgor',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: transformedPost.category,
    keywords: transformedPost.tags.join(', '),
    wordCount: post.blogContent?.wordCount || 0,
    inLanguage: post.language || 'en-US',
    isAccessibleForFree: true,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article', '.blog-content', 'h1'],
    },
  };

  // BreadcrumbList: every item must be an absolute HTTPS URL (Google requirement)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // FAQPage: acceptedAnswer.text must be plain text (no HTML) or rich results can drop
  let faqSchema = null;
  if (transformedPost.faqs && transformedPost.faqs.length > 0) {
    const validFaqs = transformedPost.faqs
      .filter(
        (faq: { question?: string; answer?: string }) =>
          faq?.question?.trim() && faq?.answer?.trim(),
      )
      .map((faq: { question: string; answer: string }) => ({
        '@type': 'Question' as const,
        name: faq.question.trim(),
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: stripHtmlForSchema(faq.answer),
        },
      }));
    if (validFaqs.length > 0) {
      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: validFaqs,
      };
    }
  }

  return {
    blogPosting: blogPostingSchema,
    breadcrumb: breadcrumbSchema,
    faq: faqSchema,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const response = await serverApi.getBlogPostBySlug(slug);

  if (!response.data) {
    notFound();
  }

  const post = response.data;
  const transformedPost = transformBlogPostForDisplay(post);

  // Get related posts — fetch only 4 so we can filter out current and keep 3
  const allPostsResponse = await serverApi.getBlogPosts('PUBLISHED', 1, 4);
  const allPosts = allPostsResponse.data?.data ?? [];
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3)
    .map(transformBlogPostForDisplay);

  // Generate structured data
  const structuredData = generateBlogPostSchema(post, transformedPost);

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.blogPosting),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />
      {/* FAQ Schema for rich snippets */}
      {structuredData.faq && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.faq),
          }}
        />
      )}

      <main className='min-h-screen bg-background'>
        <PageHeader
          title={post.title}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'All Guides', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        <div className='mx-auto max-w-7xl lg:p-6'>
          <BlogPostLayout categorySlug={post.blogCategories?.[0]?.category?.slug}>
            <div className='bg-card rounded-xl border border-border shadow-sm py-4'>
              <ViewTracker postId={post.id} />
              <BlogPostDetail post={transformedPost} />
            </div>
          </BlogPostLayout>
          <CommentsSection blogPostId={post.id} />
          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        </div>
      </main>
    </>
  );
}
