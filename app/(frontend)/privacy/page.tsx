import { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { MultiplexAd } from '@/components/adsense';
import { getBaseUrl } from '@/lib/seo';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Privacy Policy - WealthAlgor',
  description:
    'Learn about how WealthAlgor collects, uses, and protects your personal data. Read our privacy policy for complete information on your data rights.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - WealthAlgor',
    description:
      'Learn about how WealthAlgor collects, uses, and protects your personal data.',
    url: '/privacy',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'WealthAlgor',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - WealthAlgor',
    description:
      'Learn about how WealthAlgor collects, uses, and protects your personal data.',
    images: ['/logo.png'],
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

// Generate JSON-LD structured data
function generatePrivacyPageSchema() {
  return {
    breadcrumb: {
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
          name: 'Privacy Policy',
          item: `${siteUrl}/privacy`,
        },
      ],
    },
    webPage: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy Policy',
      description:
        'Learn about how WealthAlgor collects, uses, and protects your personal data.',
      url: `${siteUrl}/privacy`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'WealthAlgor',
        url: siteUrl,
      },
      about: {
        '@type': 'Thing',
        name: 'Privacy Policy',
      },
      lastReviewed: new Date().toISOString(),
    },
  };
}

export default function PrivacyPolicyPage() {
  const structuredData = generatePrivacyPageSchema();

  return (
    <>
      {/* Inject JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.webPage),
        }}
      />

      <main className='min-h-screen bg-white dark:bg-slate-950'>
        <PageHeader
          title='Privacy Policy'
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy', href: '/privacy' },
          ]}
        />

        <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='prose prose-lg max-w-none'>
            <div className='space-y-8'>
              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  1. Introduction
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  Welcome to WealthAlgor. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website and tell you about your
                  privacy rights and how the law protects you.
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  2. Information We Collect
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  We may collect, use, store, and transfer different kinds of
                  personal data about you:
                </p>
                <ul className='list-disc pl-6 space-y-2 text-gray-700'>
                  <li>
                    Identity Data: includes first name, last name, username, or
                    similar identifier
                  </li>
                  <li>
                    Contact Data: includes email address and telephone numbers
                  </li>
                  <li>
                    Technical Data: includes internet protocol (IP) address,
                    browser type and version, time zone setting
                  </li>
                  <li>
                    Usage Data: includes information about how you use our
                    website
                  </li>
                  <li>
                    Marketing and Communications Data: includes your preferences
                    in receiving marketing from us
                  </li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  3. How We Use Your Information
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className='list-disc pl-6 space-y-2 text-gray-700'>
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>
                    To gather analysis or valuable information so that we can
                    improve our service
                  </li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  4. Data Security
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  We have put in place appropriate security measures to prevent
                  your personal data from being accidentally lost, used, or
                  accessed in an unauthorized way. We limit access to your
                  personal data to those employees, agents, contractors, and
                  other third parties who have a business need to know.
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  5. Your Rights
                </h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  Under certain circumstances, you have rights under data
                  protection laws in relation to your personal data:
                </p>
                <ul className='list-disc pl-6 space-y-2 text-gray-700'>
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Request transfer of your personal data</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  6. Cookies
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  We use cookies and similar tracking technologies to track the
                  activity on our service and hold certain information. Cookies
                  are files with a small amount of data which may include an
                  anonymous unique identifier. You can instruct your browser to
                  refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  7. Changes to This Privacy Policy
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &quot;Last updated&quot; date at
                  the bottom of this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  8. Contact Us
                </h2>
                <p className='text-gray-700 leading-relaxed'>
                  If you have any questions about this Privacy Policy, please
                  contact us through our{' '}
                  <a
                    href='/contact'
                    className='text-blue-600 hover:text-blue-700 underline'>
                    contact page
                  </a>
                  .
                </p>
              </section>

              <div className='mt-8 pt-8 border-t border-gray-200'>
                <p className='text-sm text-gray-500'>
                  Last updated:{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className='mt-16 pt-8'>
              <MultiplexAd containerClassName='' />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
