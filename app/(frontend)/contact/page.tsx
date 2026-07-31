import { Metadata } from 'next';
import { ContactContent } from './page-content';
import { getBaseUrl } from '@/lib/seo';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Contact Us - WealthAlgor',
  description:
    'Have a question or want to get in touch? Send us a message and the WealthAlgor team will respond as soon as possible.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - WealthAlgor',
    description:
      'Get in touch with the WealthAlgor team for inquiries about robo-advisors, automated investing, or the site.',
    url: '/contact',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - WealthAlgor',
    description:
      'Get in touch with the WealthAlgor team for inquiries about robo-advisors, automated investing, or the site.',
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
function generateContactPageSchema() {
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
          name: 'Contact',
          item: `${siteUrl}/contact`,
        },
      ],
    },
    contactPage: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Us',
      description:
        'Get in touch with the WealthAlgor team for inquiries about robo-advisors, automated investing, or the site.',
      url: `${siteUrl}/contact`,
      mainEntity: {
        '@type': 'Organization',
        name: 'WealthAlgor',
        url: siteUrl,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
      },
    },
  };
}

export default function ContactPage() {
  const structuredData = generateContactPageSchema();

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
          __html: JSON.stringify(structuredData.contactPage),
        }}
      />
      <ContactContent />
    </>
  );
}
