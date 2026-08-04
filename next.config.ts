import type { NextConfig } from 'next';

/**
 * Tool slugs renamed for search intent (2026-08-04). Keep these permanently —
 * removing a 301 orphans any link or index entry still pointing at the old URL.
 */
const TOOL_SLUG_REDIRECTS: Record<string, string> = {
  'fee-comparison-calculator': 'robo-advisor-fee-calculator',
  'retirement-savings-calculator': 'robo-advisor-retirement-calculator',
  'tax-loss-harvesting-estimator': 'tax-loss-harvesting-calculator',
  'dca-vs-lump-sum-simulator': 'dca-vs-lump-sum-calculator',
  'round-up-investing-estimator': 'round-up-investing-calculator',
};

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    cssChunking: 'strict',
  },
  async redirects() {
    return Object.entries(TOOL_SLUG_REDIRECTS).map(([from, to]) => ({
      source: `/tools/${from}`,
      destination: `/tools/${to}`,
      // 308: permanent, and preserves the request method. Never use a temporary
      // redirect here — Google won't transfer signals to the new URL.
      permanent: true,
    }));
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.wealthalgor.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
