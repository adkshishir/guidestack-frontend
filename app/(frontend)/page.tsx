import { Metadata } from 'next';
import { HomeArticlesSection } from '@/components/home-articles-section';
import { HomeCategoriesTags } from '@/components/home-categories-tags';
import { NewsletterSection } from '@/components/newsletter-section';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl, toAbsoluteHttpsUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'WealthAlgor - Robo-Advisor Reviews, Tools & Automated Investing Guides',
  description:
    'Independent robo-advisor comparisons, the mechanics behind automated investing, and free calculators for fees, tax-loss harvesting, and rebalancing.',
  keywords: [
    'robo advisor',
    'robo advisor comparison',
    'automated investing',
    'tax loss harvesting calculator',
    'robo advisor fees',
    'betterment vs wealthfront',
    'best robo advisor',
    'hybrid robo advisor',
  ],
  authors: [{ name: 'WealthAlgor Team' }],
  creator: 'WealthAlgor',
  publisher: 'WealthAlgor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'WealthAlgor - Robo-Advisor Reviews, Tools & Automated Investing Guides',
    description:
      'Independent robo-advisor comparisons, mechanics explainers, and free calculators built around your own numbers.',
    url: '/',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/banner_wealthalgor.png',
        width: 702,
        height: 528,
        alt: 'WealthAlgor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WealthAlgor - Robo-Advisor Reviews, Tools & Automated Investing Guides',
    description:
      'Independent robo-advisor comparisons, mechanics explainers, and free calculators built around your own numbers.',
    images: ['/banner_wealthalgor.png'],
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

// Generate JSON-LD structured data (HTTPS URLs for Search Console)
function generateStructuredData(posts: any[], postCount: number) {
  const siteUrl = getBaseUrl();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WealthAlgor',
    url: siteUrl,
    description:
      'Independent robo-advisor comparisons, automated investing mechanics, and free financial calculators',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WealthAlgor',
    url: siteUrl,
    logo: `${siteUrl}/banner_wealthalgor.png`,
    sameAs: [],
  };

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'WealthAlgor',
    description:
      'Independent robo-advisor comparisons, automated investing mechanics, and free financial calculators',
    url: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'WealthAlgor',
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.title,
      image: post.image ? toAbsoluteHttpsUrl(post.image, siteUrl) : toAbsoluteHttpsUrl('/placeholder.svg', siteUrl),
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'WealthAlgor',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog/${post.slug}`,
      },
    })),
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'WealthAlgor Home',
    description: 'Latest robo-advisor comparisons, guides, and calculators from WealthAlgor',
    url: siteUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: postCount,
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${siteUrl}/blog/${post.slug}`,
        },
      })),
    },
  };

  return {
    website: websiteSchema,
    organization: organizationSchema,
    blog: blogSchema,
    collectionPage: collectionPageSchema,
  };
}

export default async function Home() {
  // Fetch published posts, categories, and tags
  let posts: any[] = [];
  let transformedPosts: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    const [postsRes, categoriesRes, tagsRes] = await Promise.all([
      serverApi.getBlogPosts('PUBLISHED'),
      serverApi.getCategories(),
      serverApi.getTags(),
    ]);
    const payload = postsRes.data;
    posts = payload?.data ?? [];
    transformedPosts = posts.map(transformBlogPostForDisplay);
    categories = categoriesRes.data || [];
    tags = tagsRes.data || [];
  } catch (error) {
    console.error('Error fetching home data:', error);
  }

  // Generate structured data
  const structuredData = generateStructuredData(transformedPosts, posts.length);

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.website),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.organization),
        }}
      />
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

      <main className='min-h-screen'>
        <HomeArticlesSection
          posts={transformedPosts}
          categories={categories}
          tags={tags}
        />
        <HomeCategoriesTags categories={categories} tags={tags} />
        <NewsletterSection />
      </main>
    </>
  );
}
