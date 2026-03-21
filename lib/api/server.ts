import { API_BASE_URL } from './config';
import {
  BlogPost,
  BlogPostStatus,
  PaginatedBlogResponse,
  CategoryBlogsResponse,
  TagBlogsResponse,
  Category,
  Tag,
} from './blog';
import { NavigationCategory } from './taxonomy';

/**
 * Server-side API client for fetching data in Next.js server components
 * This doesn't use localStorage or browser APIs
 */
async function serverRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: { message: string; statusCode?: number } }> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Enable caching for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: {
          message: data.message || data.error || 'An error occurred',
          statusCode: response.status,
        },
      };
    }

    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

export const serverApi = {
  /** Fetch blog posts. With page/limit returns paginated; without returns all (for sitemap). */
  getBlogPosts: (
    status?: BlogPostStatus,
    page?: number,
    limit?: number,
  ) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (page != null && page > 0) params.set('page', String(page));
    if (limit != null && limit > 0) params.set('limit', String(limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return serverRequest<PaginatedBlogResponse>(`/blog${query}`);
  },
  getBlogPostBySlug: (slug: string) => {
    return serverRequest<BlogPost>(`/blog/slug/${slug}`);
  },
  getBlogPostById: (id: number) => {
    return serverRequest<BlogPost>(`/blog/${id}`);
  },
  getBlogPostsByCategorySlug: (slug: string) => {
    return serverRequest<CategoryBlogsResponse>(`/blog/category/${slug}`);
  },
  getBlogPostsByTagSlug: (slug: string) => {
    return serverRequest<TagBlogsResponse>(`/blog/tag/${slug}`);
  },
  getCategories: () => {
    return serverRequest<Category[]>(`/taxonomy/categories`);
  },
  getTags: () => {
    return serverRequest<Tag[]>(`/taxonomy/tags`);
  },
  getNavigationCategories: () => {
    return serverRequest<NavigationCategory[]>(`/taxonomy/navigation`);
  },
};
