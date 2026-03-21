/**
 * Central SEO helpers: always use HTTPS for canonical/schema URLs
 * so Search Console and rich results (breadcrumbs, FAQ) stay valid.
 */

// Update this when you have your new domain
const DEFAULT_SITE_URL = 'https://guidestack.dev';

/**
 * Returns the site base URL with protocol forced to HTTPS.
 * Use this for all canonical URLs, JSON-LD schema, sitemap, and robots.
 * Prevents breadcrumb/FAQ drops from mixed content or accidental http.
 */
export function getBaseUrl(): string {
  const raw =
    (typeof process !== 'undefined' && process.env?.SITE_URL) || DEFAULT_SITE_URL;
  const trimmed = (raw || '').trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  try {
    const url = new URL(trimmed);
    url.protocol = 'https:';
    return url.origin;
  } catch {
    return trimmed.startsWith('http') ? trimmed : DEFAULT_SITE_URL;
  }
}

/**
 * Strip HTML tags and normalize whitespace for schema.org text fields.
 * FAQPage acceptedAnswer.text must be plain text; HTML can cause validation errors.
 */
export function stripHtmlForSchema(html: string): string {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ensure a URL is absolute and HTTPS (for images, links in schema).
 */
export function toAbsoluteHttpsUrl(pathOrUrl: string, baseUrl?: string): string {
  const base = baseUrl ?? getBaseUrl();
  const s = (pathOrUrl || '').trim();
  if (!s) return base;
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s);
      u.protocol = 'https:';
      return u.href;
    } catch {
      return s;
    }
  }
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${base.replace(/\/$/, '')}${path}`;
}
