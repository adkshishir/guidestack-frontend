import { BlogPost } from '@/lib/api/blog';
import { API_BASE_URL } from '@/lib/api/config';

/**
 * Transform backend BlogPost to frontend format for display
 */

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

export function processContent(html: string): {
  content: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  
  // Regex to match h2 and h3 tags, capturing attributes, level, and content
  // Note: This matches standard HTML tags. Nested tags inside h2/h3 are preserved in content but stripped for TOC text.
  const processedContent = html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attributes, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '');
      const id = slugify(cleanText);
      toc.push({ id, text: cleanText, level: parseInt(level) });
      
      // If the tag already has an id, keep it (though we overwrite if we want to enforce our IDs)
      // For simplicity, we append our ID if one doesn't exist, or replace the tag to include it.
      // Since we want to ensure standard IDs for TOC, we'll force the ID.
      
      // Check if attributes already contain id
      if (attributes.includes('id=')) {
        return match; // Already has ID, maybe skip or parse it? Let's assume we want to control IDs.
      }
      
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
  );

  return { content: processedContent, toc };
}

export function transformBlogPostForDisplay(post: BlogPost) {
  // Get first category name or default
  const categoryName =
    post.blogCategories?.[0]?.category?.name || 'Uncategorized';

  // Get tags
  const tags = post.blogTags?.map((bt) => bt.tag.name) || [];

  // Get author name
  const authorName =
    post.author?.authorProfile?.displayName ||
    post.author?.email?.split('@')[0] ||
    'Anonymous';
  const authorEmail = post.author?.email || '';
  const authorAvatar =
    post.author?.authorProfile?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorEmail)}`;
  const authorBio =
    post.author?.authorProfile?.bio || `Author of ${post.title}`;

  // Format date
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  // Get reading time
  const readTime = post.readingTime
    ? `${post.readingTime} min read`
    : post.blogContent?.wordCount
      ? `${Math.ceil(post.blogContent.wordCount / 200)} min read`
      : '5 min read';

  // Get first valid category image for fallback
  let categoryImageUrl = undefined;
  if (post.blogCategories && post.blogCategories.length > 0) {
    for (const bc of post.blogCategories) {
      if (
        bc.category?.featuredImage?.url ||
        bc.category?.featuredImage?.filePath
      ) {
        categoryImageUrl =
          bc.category.featuredImage.url || bc.category.featuredImage.filePath;
        break;
      }
    }
  }

  // Get image URL - use post's featured image, fallback to category image, then placeholder
  let imageUrl =
    post.featuredImage?.url ||
    post.featuredImage?.filePath ||
    categoryImageUrl ||
    '/placeholder.svg';

  // Ensure absolute URL for relative paths from backend
  if (imageUrl && imageUrl.startsWith('/') && imageUrl !== '/placeholder.svg') {
    // Remove trailing slash from base if exists
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  // Get content and process for TOC
  const rawContent = post.blogContent?.htmlContent || post.htmlContent || '';
  const { content, toc } = processContent(rawContent);

  // Get FAQs
  const faqs =
    post.blogFaqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })) || [];

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: categoryName,
    image: imageUrl,
    author: {
      name: authorName,
      avatar: authorAvatar,
      bio: authorBio,
    },
    date,
    readTime,
    content,
    excerpt: post.excerpt || '',
    tags,
    faqs,
    toc,
    analytics: {
      views: post.blogAnalytics?.views || 0,
      likes: post.blogAnalytics?.likes || 0,
    },
    commentCount: post.comments?.length || 0,
  };
}
