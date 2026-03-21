import { Metadata } from 'next';
import { HomeArticlesSection } from '@/components/home-articles-section';
import { HomeCategoriesTags } from '@/components/home-categories-tags';
import { NewsletterSection } from '@/components/newsletter-section';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl, toAbsoluteHttpsUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'GuideStack - Step-by-Step Technical Guides & Tutorials',
  description:
    'Actionable step-by-step guides for software development, AI, cybersecurity, personal finance, and productivity. Learn by doing with practical tutorials.',
  keywords: [
    'step-by-step tutorials',
    'software development guides',
    'how to code',
    'AI tutorials',
    'cybersecurity guides',
    'personal finance tips',
    'developer tools',
    'programming tutorials',
  ],
  authors: [{ name: 'GuideStack Team' }],
  creator: 'GuideStack',
  publisher: 'GuideStack',
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
    title: 'GuideStack - Step-by-Step Technical Guides & Tutorials',
    description:
      'Actionable step-by-step guides for developers, creators, and curious minds. Learn by doing.',
    url: '/',
    siteName: 'GuideStack',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuideStack - Step-by-Step Technical Guides & Tutorials',
    description:
      'Actionable step-by-step guides for developers, creators, and curious minds.',
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
    name: 'GuideStack',
    url: siteUrl,
    description:
      'Step-by-step technical guides, tutorials, and practical how-to articles',
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
    name: 'GuideStack',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: [],
  };

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'GuideStack',
    description:
      'Step-by-step technical guides, tutorials, and practical how-to articles',
    url: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'GuideStack',
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
        name: 'GuideStack',
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
    name: 'GuideStack Home',
    description: 'Latest step-by-step guides and tutorials from GuideStack',
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
