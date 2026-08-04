import { serverApi } from '@/lib/api/server';
import { getBaseUrl, toAbsoluteHttpsUrl, MIN_POSTS_FOR_INDEX } from '@/lib/seo';
import { TOOLS } from '@/lib/tools-data';

type SitemapImage = {
  loc: string;
  title?: string;
  caption?: string;
};

type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: string;
  images?: SitemapImage[];
};

/** Normalized site root (no trailing slash) so all sitemap URLs are consistent and match canonical URLs. */
function getNormalizedBaseUrl(): string {
  const base = getBaseUrl();
  return base.replace(/\/+$/, '') || base;
}

const baseUrl = getNormalizedBaseUrl();

/** Static routes in SEO-friendly order: home, main sections, then utility pages. */
const staticPaths = [
  { path: '', changeFrequency: 'daily' as const, priority: '1.0' },
  { path: '/blog', changeFrequency: 'daily' as const, priority: '0.9' },
  { path: '/tools', changeFrequency: 'monthly' as const, priority: '0.9' },
  ...TOOLS.map((tool) => ({
    path: `/tools/${tool.slug}`,
    changeFrequency: 'monthly' as const,
    priority: '0.8',
  })),
  { path: '/category', changeFrequency: 'weekly' as const, priority: '0.8' },
  { path: '/tag', changeFrequency: 'weekly' as const, priority: '0.8' },
  { path: '/about', changeFrequency: 'monthly' as const, priority: '0.7' },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: '0.6' },
  { path: '/privacy', changeFrequency: 'monthly' as const, priority: '0.5' },
];

const staticRoutes: SitemapEntry[] = staticPaths.map(({ path, changeFrequency, priority }) => ({
  url: path ? `${baseUrl}${path}` : baseUrl,
  lastModified: new Date().toISOString(),
  changeFrequency,
  priority,
}));

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml(routes: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${routes
    .map((route) => {
      const imageEntries =
        route.images && route.images.length > 0
          ? route.images
              .map(
                (img) => `
    <image:image>
      <image:loc>${xmlEscape(img.loc)}</image:loc>
      ${img.title ? `<image:title>${xmlEscape(img.title)}</image:title>` : ''}
      ${img.caption ? `<image:caption>${xmlEscape(img.caption)}</image:caption>` : ''}
    </image:image>`,
              )
              .join('')
          : '';
      return `
  <url>
    <loc>${xmlEscape(route.url)}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>${imageEntries}
  </url>`;
    })
    .join('')}
</urlset>`;
}

export async function GET() {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
  };

  try {
    const [tagsResult, postsResult, categoriesResult] =
      await Promise.allSettled([
        serverApi.getTags(),
        serverApi.getBlogPosts('PUBLISHED'),
        serverApi.getCategories(),
      ]);

    const tags =
      tagsResult.status === 'fulfilled' ? tagsResult.value.data || [] : [];
    const payload =
      postsResult.status === 'fulfilled' ? postsResult.value.data : null;
    const posts = payload?.data ?? [];
    const categories =
      categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.data || []
        : [];

    const seen = new Set<string>();
    const orderedRoutes: SitemapEntry[] = [];

    function add(entry: SitemapEntry) {
      if (entry.url && !seen.has(entry.url)) {
        seen.add(entry.url);
        orderedRoutes.push(entry);
      }
    }

    // Only submit taxonomy pages that actually have published posts —
    // an empty tag/category page is thin content and shouldn't be indexed.
    const usedTagSlugs = new Set<string>();
    // Count posts per category so the sitemap applies the same MIN_POSTS_FOR_INDEX
    // threshold the category page's robots metadata does — submitting a URL we
    // also noindex is a contradictory signal.
    const categoryPostCounts = new Map<string, number>();
    for (const post of posts) {
      for (const bt of post.blogTags || []) {
        if (bt.tag?.slug) usedTagSlugs.add(bt.tag.slug);
      }
      for (const bc of post.blogCategories || []) {
        const slug = bc.category?.slug;
        if (slug) categoryPostCounts.set(slug, (categoryPostCounts.get(slug) ?? 0) + 1);
      }
    }

    // 1. Static routes (exact order: home, blog, category, tag, contact, privacy)
    staticRoutes.forEach(add);

    // 2. Tag index and tag slugs with at least one published post
    for (const tag of tags) {
      if (tag?.slug && usedTagSlugs.has(tag.slug)) {
        add({
          url: `${baseUrl}/tag/${tag.slug}`,
          lastModified: new Date(tag.updatedAt || Date.now()).toISOString(),
          changeFrequency: 'weekly',
          priority: '0.6',
        });
      }
    }

    // 3. Category index and category slugs with at least one published post
    for (const category of categories) {
      if (
        category?.slug &&
        (categoryPostCounts.get(category.slug) ?? 0) >= MIN_POSTS_FOR_INDEX
      ) {
        add({
          url: `${baseUrl}/category/${category.slug}`,
          lastModified: new Date(
            category.updatedAt || Date.now(),
          ).toISOString(),
          changeFrequency: 'weekly',
          priority: '0.7',
        });
      }
    }

    // 4. Blog index and all blog posts (wealthalgor.com/blog, wealthalgor.com/blog/[slug])
    for (const post of posts) {
      if (!post?.slug) continue;
      const url = `${baseUrl}/blog/${post.slug}`;
      if (seen.has(url)) continue;
      // Only use the stored URL (never filePath — it's a local disk path like "public/uploads/xxx.jpg"
      // which would produce broken sitemap entries like https://wealthalgor.com/public/uploads/xxx.jpg)
      const imageUrl = post.featuredImage?.url || null;
      const images: SitemapImage[] = imageUrl
        ? [
            {
              loc: toAbsoluteHttpsUrl(imageUrl, baseUrl),
              title: post.title,
              caption: post.excerpt || post.title,
            },
          ]
        : [];
      add({
        url,
        lastModified: new Date(post.updatedAt || Date.now()).toISOString(),
        changeFrequency: 'weekly',
        priority: '0.8',
        images,
      });
    }

    return new Response(buildXml(orderedRoutes), { headers });
  } catch (error) {
    return new Response(buildXml(staticRoutes), { headers });
  }
}
