import { Metadata } from 'next';
import { serverApi } from '@/lib/api/server';
import { BlogContent } from './blog-content';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';

import { getBaseUrl, toAbsoluteHttpsUrl } from '@/lib/seo';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Blog - GuideStack',
  description:
    'Explore the latest articles on AI, finance, and technology from GuideStack. Insights to help you stay ahead in a rapidly evolving world.',
  keywords: [
    'GuideStack blog',
    'financial technology',
    'AI insights',
    'algorithmic trading',
    'wealth management',
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Blog - GuideStack',
    description:
      'Explore the latest articles on AI, finance, and technology from GuideStack.',
    url: `${siteUrl}/blog`,
    siteName: 'GuideStack',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - GuideStack',
    description:
      'Explore the latest articles on AI, finance, and technology from GuideStack.',
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

// Generate JSON-LD structured data for blog listing
// rawPosts = original API response (for ISO dates); transformedPosts = display-ready (for author, image)
function generateBlogListingSchema(rawPosts: any[], transformedPosts: any[], totalCount: number) {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'GuideStack Blog',
    description:
      'Explore the latest articles on AI, finance, and technology from GuideStack.',
    url: `${siteUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'GuideStack',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    // Use raw posts for ISO 8601 dates (required by schema.org); transformedPosts for display fields
    blogPost: rawPosts.slice(0, 10).map((rawPost, i) => {
      const tp = transformedPosts[i];
      return {
        '@type': 'BlogPosting',
        headline: rawPost.title,
        description: rawPost.excerpt || rawPost.title,
        url: `${siteUrl}/blog/${rawPost.slug}`,
        image: tp?.image ? toAbsoluteHttpsUrl(tp.image, siteUrl) : toAbsoluteHttpsUrl('/placeholder.svg', siteUrl),
        datePublished: rawPost.publishedAt || rawPost.createdAt,
        author: {
          '@type': 'Person',
          name: tp?.author?.name || 'GuideStack Team',
        },
      };
    }),
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GuideStack Blog',
    description:
      'Browse all articles on AI, finance, and technology from GuideStack.',
    url: `${siteUrl}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalCount,
      itemListElement: rawPosts.slice(0, 20).map((rawPost, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/blog/${rawPost.slug}`,
        name: rawPost.title,
      })),
    },
  };

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
    ],
  };

  return {
    blog: blogSchema,
    collectionPage: collectionPageSchema,
    breadcrumb: breadcrumbSchema,
  };
}

const POSTS_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: Promise<{ sort?: string; search?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolved = await searchParams;
  const sort = resolved.sort ?? 'date-desc';
  const searchQuery = resolved.search ?? '';
  const pageParam = resolved.page ?? '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);

  const response = await serverApi.getBlogPosts(
    'PUBLISHED',
    currentPage,
    POSTS_PER_PAGE,
  );
  const payload = response.data; // API returns { data, total, page, limit, totalPages }
  const posts = payload?.data ?? [];
  const total = payload?.total ?? posts.length;
  const totalPages = payload?.totalPages ?? 1;
  const limit = payload?.limit ?? POSTS_PER_PAGE;

  // Generate structured data (pass raw posts for ISO dates, transformed for display fields)
  const transformedPosts = posts.map(transformBlogPostForDisplay);
  const structuredData = generateBlogListingSchema(posts, transformedPosts, total);

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.blog),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.collectionPage),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />
      <BlogContent
        initialPosts={posts}
        sort={sort}
        searchQuery={searchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
      />
    </>
  );
}
