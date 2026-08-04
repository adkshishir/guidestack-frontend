import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
// Ads disabled — uncomment to re-enable
// import { GoogleAdSense } from '@/components/adsense';
import './globals.css';
import { getBaseUrl } from '@/lib/seo';
import { SITE_AUTHOR } from '@/lib/site-config';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

const siteUrl = getBaseUrl();
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// GTM container. Set NEXT_PUBLIC_GTM_ID to override (e.g. to disable it in a
// non-production environment by setting it empty).
const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-PMKKMRQK';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'WealthAlgor - Robo-Advisor Reviews, Tools & Automated Investing Guides',
    template: '%s | WealthAlgor',
  },
  description:
    'Independent robo-advisor comparisons, the mechanics behind automated investing, and free calculators — tax-loss harvesting, fees, rebalancing, and more — that use your own numbers.',
  authors: [{ name: SITE_AUTHOR.name, url: `${siteUrl}/about` }],
  creator: 'WealthAlgor',
  publisher: 'WealthAlgor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'WealthAlgor - Robo-Advisor Reviews, Tools & Automated Investing Guides',
    description:
      'Independent robo-advisor comparisons, mechanics explainers, and free calculators built around your own numbers.',
    url: siteUrl,
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
    ],
    apple: '/apple-icon.png',
  },
  verification: {
    google: googleSiteVerification || 'google96b37cac1dc2ce53',
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
    name: 'WealthAlgor',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/primary_wealthalgor.png`,
      width: 223,
      height: 250,
    },
    description:
      'Independent robo-advisor comparisons, automated investing mechanics, and free financial calculators.',
    foundingDate: '2026',
    // No `sameAs` here on purpose: the profiles below belong to the founder, not
    // to the organization. They live on the Person node, which `founder` links to.
    founder: {
      '@type': 'Person',
      '@id': `${siteUrl}/about#person`,
      name: SITE_AUTHOR.name,
      jobTitle: SITE_AUTHOR.role,
      url: `${siteUrl}/about`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      url: `${siteUrl}/contact`,
      ...(SITE_AUTHOR.email ? { email: SITE_AUTHOR.email } : {}),
    },
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'WealthAlgor',
    url: siteUrl,
    description:
      'Independent robo-advisor comparisons, automated investing mechanics, and free financial calculators.',
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
        {/* GTM noscript fallback — must be the first thing in <body> */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height='0'
              width='0'
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {gtmId && (
          <Script id='google-tag-manager' strategy='afterInteractive'>
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
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

        <Toaster />
      </body>
    </html>
  );
}
