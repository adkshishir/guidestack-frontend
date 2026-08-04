import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { getBaseUrl } from '@/lib/seo';
import { SITE_AUTHOR, FEE_DATA_VERIFIED } from '@/lib/site-config';
import { TOOLS } from '@/lib/tools-data';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who runs WealthAlgor, how we verify robo-advisor fee data, how the site makes money, and what we are not: independent research, not licensed financial advice.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About WealthAlgor',
    description:
      'Who runs WealthAlgor, how we verify our data, and how we make money.',
    url: '/about',
    siteName: 'WealthAlgor',
    locale: 'en_US',
    type: 'profile',
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
    title: 'About WealthAlgor',
    description:
      'Who runs WealthAlgor, how we verify our data, and how we make money.',
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

/**
 * AboutPage + Person schema. For YMYL topics the named, described human is the
 * E-E-A-T signal that matters most — this must stay in sync with the visible
 * page content.
 */
function generateAboutSchema() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/about#person`,
    name: SITE_AUTHOR.name,
    jobTitle: SITE_AUTHOR.role,
    description: SITE_AUTHOR.bio,
    url: `${siteUrl}/about`,
    image: `${siteUrl}${SITE_AUTHOR.image}`,
    ...(SITE_AUTHOR.email ? { email: SITE_AUTHOR.email } : {}),
    // Every URL here is also a visible link on the page — `sameAs` is an identity
    // claim Google can cross-check, so it must be verifiable, not decorative.
    ...(SITE_AUTHOR.sameAs.length > 0 ? { sameAs: SITE_AUTHOR.sameAs } : {}),
    knowsAbout: [
      'Robo-advisors',
      'Automated investing',
      'Investment fee analysis',
      'Full-stack web development',
    ],
    worksFor: { '@id': `${siteUrl}/#organization` },
  };

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About WealthAlgor',
    url: `${siteUrl}/about`,
    description:
      'Who runs WealthAlgor, how we verify robo-advisor fee data, how the site makes money, and what we are not.',
    mainEntity: { '@id': `${siteUrl}/about#person` },
    isPartOf: { '@id': `${siteUrl}/#website` },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${siteUrl}/about`,
      },
    ],
  };

  return {
    person: personSchema,
    aboutPage: aboutPageSchema,
    breadcrumb: breadcrumbSchema,
  };
}

/**
 * Labelled versions of `SITE_AUTHOR.sameAs`, rendered with `rel="me"` so the
 * on-page links and the schema identity claim agree.
 */
const PROFILE_LINKS = [
  { label: 'Personal site', href: SITE_AUTHOR.website },
  { label: 'GitHub', href: 'https://github.com/adkshishir' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shishir-adhikari-917432254/',
  },
  { label: 'Facebook', href: 'https://www.facebook.com/shishir0605' },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className='mt-12 border-t border-border pt-8 first:mt-0 first:border-0 first:pt-0'>
      <h2 className='text-xl font-bold text-foreground mb-4'>{title}</h2>
      <div className='space-y-4 text-sm leading-relaxed text-muted-foreground'>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const structuredData = generateAboutSchema();

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.person),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.aboutPage),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />

      <main className='min-h-screen bg-background'>
        <PageHeader
          title='About WealthAlgor'
          description='Independent research on robo-advisors and automated investing — who writes it, how it is verified, and how it is paid for.'
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]}
        />

        <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
          {/* 1. Who runs this site */}
          <Section id='who' title='Who runs this site'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
              <Image
                src={SITE_AUTHOR.image}
                alt={SITE_AUTHOR.name}
                width={112}
                height={112}
                style={{ objectPosition: SITE_AUTHOR.imagePosition }}
                className='h-28 w-28 shrink-0 rounded-full object-cover border border-border'
              />
              <div>
                <p className='text-base font-semibold text-foreground'>
                  {SITE_AUTHOR.name}
                </p>
                <p className='text-xs uppercase tracking-widest text-muted-foreground mt-0.5'>
                  {SITE_AUTHOR.role}
                </p>
                <p className='mt-3'>{SITE_AUTHOR.bioLong}</p>
                <p className='mt-3'>
                  Everything on WealthAlgor — the calculators, the fee models,
                  the site itself — is built and maintained by one person. If a
                  number here is wrong, there is exactly one person to hold
                  responsible for it.
                </p>
                {/* Visible profile links: `sameAs` in the Person schema is only
                    a credible identity claim if the same links exist on-page. */}
                <ul className='mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm'>
                  {PROFILE_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target='_blank'
                        rel='me noopener noreferrer'
                        className='text-primary hover:underline'>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* 2. Why this site exists */}
          <Section id='why' title='Why this site exists'>
            <p>
              Most robo-advisor coverage is a fee table copied from a press
              release and a referral link. That tells you what a platform
              charges, but not what it costs <em>you</em> — on your balance,
              over your time horizon, against the alternative you were actually
              considering.
            </p>
            <p>
              WealthAlgor exists to close that gap. Every guide here is written
              to answer a specific question with your own numbers, and each one
              is paired with a calculator that runs the arithmetic rather than
              asking you to trust a rounded example.
            </p>
            <p>
              The calculators are the point, not decoration around an affiliate
              link. They are written from the providers&apos; own published fee
              schedules, and the assumptions behind each one are stated on its
              page so you can decide whether the model fits your situation
              before you act on the output.
            </p>
          </Section>

          {/* 3. How we verify our data */}
          <Section id='methodology' title='How we verify our data'>
            <ul className='list-disc space-y-2 pl-5'>
              <li>
                <strong className='text-foreground'>Fees come from the
                provider, not from other blogs.</strong> Every advisory fee,
                account minimum, and tier threshold is read off the platform&apos;s
                own published pricing or disclosure documents.
              </li>
              <li>
                <strong className='text-foreground'>Figures are dated.</strong>{' '}
                Platform fee data used in the calculators was last verified on{' '}
                <time dateTime={FEE_DATA_VERIFIED}>{FEE_DATA_VERIFIED}</time>,
                and is re-checked quarterly.
              </li>
              <li>
                <strong className='text-foreground'>Assumptions are
                stated.</strong> The calculators model a constant rate of return
                and a constant fee rate. They do not model taxes, inflation,
                sequence-of-returns risk, or promotional fee waivers. Real
                results will differ.
              </li>
              <li>
                <strong className='text-foreground'>Corrections are
                made, not quietly deleted.</strong> If something here is wrong,{' '}
                <Link href='/contact' className='text-primary hover:underline'>
                  tell us
                </Link>{' '}
                and it gets fixed with the modified date updated.
              </li>
            </ul>
          </Section>

          {/* 4. How we make money */}
          <Section id='how-we-make-money' title='How we make money'>
            <p>
              Honesty about incentives is the whole basis for trusting anything
              on a site like this, so: WealthAlgor may earn affiliate commission
              if you open an account through certain links. Where that applies,
              it is disclosed on the page.
            </p>
            <p>
              What that money does not buy: a ranking, a rating, or a
              recommendation. No platform reviews, approves, or pays for
              coverage before publication, and the calculators do not weight
              results toward any provider. If the cheapest option is one we earn
              nothing from, that is what the numbers will say.
            </p>
          </Section>

          {/* 5. What we are not */}
          <Section id='not-advice' title='What we are not'>
            <p>
              WealthAlgor is a research and education site. It is{' '}
              <strong className='text-foreground'>
                not a registered investment adviser
              </strong>
              , and nothing here is personalized financial, tax, or legal
              advice. We do not know your full financial picture, and a
              calculator cannot know it either.
            </p>
            <p>
              To be explicit about the byline: {SITE_AUTHOR.name} is a software
              developer, not a licensed financial professional. What you get
              here is careful arithmetic against primary sources and openly
              stated assumptions — not a recommendation about what you
              personally should do with your money.
            </p>
            <p>
              Investing involves risk, including loss of principal. Past
              performance does not predict future results. Before acting on
              anything you read here, consider speaking with a licensed
              fiduciary adviser or tax professional about your own situation.
            </p>
          </Section>

          {/* 6. Contact */}
          <Section id='contact' title='Contact'>
            <p>
              Corrections, questions, and data disputes are all welcome — use
              the{' '}
              <Link href='/contact' className='text-primary hover:underline'>
                contact form
              </Link>
              {SITE_AUTHOR.email ? (
                <>
                  {' '}
                  or email{' '}
                  <a
                    href={`mailto:${SITE_AUTHOR.email}`}
                    className='text-primary hover:underline'>
                    {SITE_AUTHOR.email}
                  </a>
                </>
              ) : (
                <>
                  , or reach me through any of the profiles linked{' '}
                  <a href='#who' className='text-primary hover:underline'>
                    above
                  </a>
                </>
              )}
              .
            </p>
          </Section>

          {/* Tools cross-links */}
          <Section id='tools' title='The tools behind the research'>
            <ul className='grid gap-2 sm:grid-cols-2'>
              {TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className='text-primary hover:underline'>
                    {tool.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </main>
    </>
  );
}
