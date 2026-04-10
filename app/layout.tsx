import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { ConditionalLayout } from '@/components/admin/conditional-layout';
// Ads disabled — uncomment to re-enable
// import { GoogleAdSense } from '@/components/adsense';
import './globals.css';
import { getBaseUrl } from '@/lib/seo';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

const siteUrl = getBaseUrl();
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GuideStack - Step-by-Step Technical Guides & Tutorials',
    template: '%s | GuideStack',
  },
  description:
    'Actionable step-by-step guides for software development, AI, cybersecurity, personal finance, and productivity. Learn by doing.',
  keywords: [
    'step-by-step tutorials',
    'software development guides',
    'programming tutorials',
    'AI tutorials',
    'cybersecurity guides',
    'developer tools',
    'how to code',
    'tech guides',
  ],
  authors: [{ name: 'GuideStack Team' }],
  creator: 'GuideStack',
  publisher: 'GuideStack',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'GuideStack - Step-by-Step Technical Guides & Tutorials',
    description:
      'Actionable step-by-step guides for developers, creators, and curious minds. Learn by doing.',
    url: siteUrl,
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
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  verification: {
    google: googleSiteVerification || 'googlee5a6779efc4b2448',
    ...(bingSiteVerification
      ? {
          other: {
            'msvalidate.01': bingSiteVerification,
          },
        }
      : {}),
  },
  // Ads disabled — uncomment when re-enabling monetization
  // other: {
  //   'google-adsense-account': 'ca-pub-5060645674260174',
  // },
};

// Global JSON-LD structured data for the entire site
const globalStructuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'GuideStack',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.svg`,
      width: 512,
      height: 512,
    },
    description:
      'Step-by-step technical guides, tutorials, and practical how-to articles.',
    foundingDate: '2024',
    sameAs: [],
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'GuideStack',
    url: siteUrl,
    description:
      'Step-by-step technical guides, tutorials, and practical how-to articles.',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        {/* Global JSON-LD structured data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalStructuredData.organization),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalStructuredData.website),
          }}
        />
        {/* <GoogleAdSense /> */}
      </head>
      <body className={`font-sans antialiased`}>
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy='afterInteractive'
            />
            <Script id='google-analytics-init' strategy='afterInteractive'>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        {children}

        {/* Google AdSense - loaded after page is interactive for better Core Web Vitals */}

        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
