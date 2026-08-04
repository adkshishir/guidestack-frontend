import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Calculator } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { RelatedPosts } from '@/components/related-posts';
import { AuthorByline } from '@/components/author-byline';
import { FeeComparisonCalculator } from '@/components/tools/fee-comparison-calculator';
import { RetirementSavingsCalculator } from '@/components/tools/retirement-savings-calculator';
import { TaxLossHarvestingEstimator } from '@/components/tools/tax-loss-harvesting-estimator';
import { RiskToleranceQuiz } from '@/components/tools/risk-tolerance-quiz';
import { DcaVsLumpSumSimulator } from '@/components/tools/dca-vs-lump-sum-simulator';
import { RoundUpInvestingEstimator } from '@/components/tools/round-up-investing-estimator';
import { getToolBySlug, TOOLS } from '@/lib/tools-data';
import { serverApi } from '@/lib/api/server';
import { transformBlogPostForDisplay } from '@/lib/blog-utils';
import { getBaseUrl } from '@/lib/seo';
import { FEE_DATA_VERIFIED } from '@/lib/site-config';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'robo-advisor-fee-calculator': FeeComparisonCalculator,
  'robo-advisor-retirement-calculator': RetirementSavingsCalculator,
  'tax-loss-harvesting-calculator': TaxLossHarvestingEstimator,
  'risk-tolerance-quiz': RiskToleranceQuiz,
  'dca-vs-lump-sum-calculator': DcaVsLumpSumSimulator,
  'round-up-investing-calculator': RoundUpInvestingEstimator,
};

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The tool you are looking for does not exist.',
    };
  }

  const siteUrl = getBaseUrl();
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;

  return {
    title: `${tool.title}`,
    description: tool.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: toolUrl,
    },
    openGraph: {
      title: `${tool.title} - WealthAlgor`,
      description: tool.description,
      url: toolUrl,
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
      title: `${tool.title} - WealthAlgor`,
      description: tool.description,
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
}

function generateToolSchema(tool: (typeof TOOLS)[number]) {
  const siteUrl = getBaseUrl();
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    url: toolUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any (web browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isPartOf: { '@type': 'WebSite', name: 'WealthAlgor', url: siteUrl },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${siteUrl}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.shortTitle,
        item: toolUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return {
    webApplication: webApplicationSchema,
    breadcrumb: breadcrumbSchema,
    faq: faqSchema,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const ToolComponent = TOOL_COMPONENTS[slug];

  if (!tool || !ToolComponent) {
    notFound();
  }

  const otherTools = TOOLS.filter((t) => t.slug !== tool.slug);
  const structuredData = generateToolSchema(tool);

  const categoryResponse = await serverApi.getBlogPostsByCategorySlug(
    tool.categorySlug,
  );
  const relatedPosts = (categoryResponse.data?.posts || [])
    .slice(0, 3)
    .map(transformBlogPostForDisplay);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.webApplication),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />
      {tool.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.faq),
          }}
        />
      )}

      <main className="min-h-screen bg-background">
        <PageHeader
          title={tool.title}
          description={tool.description}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/tools' },
            { label: tool.shortTitle, href: `/tools/${tool.slug}` },
          ]}
        />

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <ToolComponent />

          {tool.usesPlatformFeeData && (
            <p className='mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground'>
              <strong className='text-foreground'>Fee data last verified:</strong>{' '}
              <time dateTime={FEE_DATA_VERIFIED}>{FEE_DATA_VERIFIED}</time>. Advisory
              fees are read from each provider&apos;s own published pricing page
              (linked beside each platform above) and re-checked quarterly.
              Providers can change pricing at any time — confirm at source before
              acting on these numbers.
            </p>
          )}

          <AuthorByline reviewedOn={FEE_DATA_VERIFIED} className='mt-10' />

          {tool.faqs.length > 0 && (
            <section className='mt-12 border-t border-border pt-8'>
              <h2 className='text-xl font-bold text-foreground mb-5'>
                Frequently Asked Questions
              </h2>
              <div className='space-y-3'>
                {tool.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className='group border border-border rounded-lg bg-card'>
                    <summary className='cursor-pointer p-4 font-medium flex items-center justify-between text-foreground hover:text-primary transition-colors'>
                      <span>{faq.question}</span>
                      <span className='transition-transform group-open:rotate-180 ml-4 shrink-0'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'>
                          <polyline points='6 9 12 15 18 9'></polyline>
                        </svg>
                      </span>
                    </summary>
                    <p className='px-4 pb-4 text-muted-foreground leading-relaxed text-sm'>
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

          <section className='mt-12 border-t border-border pt-8'>
            <h2 className='text-xl font-bold text-foreground mb-5'>
              More Free Tools
            </h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              {otherTools.map((otherTool) => (
                <Link
                  key={otherTool.slug}
                  href={`/tools/${otherTool.slug}`}
                  className='group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <Calculator className='h-4 w-4' />
                    </div>
                    <h3 className='font-semibold text-sm text-foreground leading-snug'>
                      {otherTool.shortTitle}
                    </h3>
                  </div>
                  <span className='inline-flex items-center gap-1 text-xs font-medium text-primary'>
                    Open calculator
                    <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
