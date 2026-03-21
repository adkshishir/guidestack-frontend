import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { Comment } from './comments';

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AuthorProfile {
  id: number;
  displayName?: string;
  bio?: string;
  avatar?: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  authorProfile?: AuthorProfile;
}

export interface Media {
  id: number;
  url?: string;
  filePath?: string;
  fileName?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  featuredImage?: Media;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: number;
  category: Category;
}

export interface BlogTag {
  id: number;
  tag: Tag;
}

export interface BlogContent {
  id: number;
  htmlContent: string;
  wordCount?: number;
}

export interface BlogFaq {
  id: number;
  question: string;
  answer: string;
  orderIndex: number;
}

export interface BlogAnalytics {
  views: number;
  likes: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  status: BlogPostStatus;
  htmlContent?: string;
  featuredImageId?: number;
  language?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  readingTime?: number | null;
  authorId: number;
  // Relations (when loaded)
  author?: User;
  featuredImage?: Media;
  blogContent?: BlogContent;
  blogCategories?: BlogCategory[];
  blogTags?: BlogTag[];
  blogFaqs?: BlogFaq[];
  blogAnalytics?: BlogAnalytics;
  comments?: Comment[];
}

export interface CreateBlogDto {
  title: string;
  slug?: string;
  excerpt?: string;
  status?: BlogPostStatus;
  htmlContent?: string;
  featuredImageId?: number;
  language?: string;
  categoryIds?: number[];
  tagIds?: number[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface UpdateBlogDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  status?: BlogPostStatus;
  htmlContent?: string;
  featuredImageId?: number;
  language?: string;
  categoryIds?: number[];
  tagIds?: number[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface GenerateBlogDto {
  topic: string;
}

export interface PaginatedBlogResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryBlogsResponse {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    featuredImage?: Media;
  };
  posts: BlogPost[];
}

export interface TagBlogsResponse {
  tag: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
  posts: BlogPost[];
}

export const blogApi = {
  /** Get blog posts. Without page/limit returns all (for admin/sitemap); with page/limit returns paginated. */
  getAll: (status?: BlogPostStatus, page?: number, limit?: number) => {
    const search = new URLSearchParams();
    if (status) search.set('status', status);
    if (page != null) search.set('page', String(page));
    if (limit != null) search.set('limit', String(limit));
    const query = search.toString() ? `?${search.toString()}` : '';
    return apiGet<PaginatedBlogResponse>(`/blog${query}`);
  },
  /** Get paginated blog posts (convenience). */
  getPaginated: (
    params?: { status?: BlogPostStatus; page?: number; limit?: number },
  ) => {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const query = search.toString() ? `?${search.toString()}` : '';
    return apiGet<PaginatedBlogResponse>(`/blog${query}`);
  },
  getById: (id: number) => apiGet<BlogPost>(`/blog/${id}`),
  getBySlug: (slug: string) => apiGet<BlogPost>(`/blog/slug/${slug}`),
  getByCategorySlug: (slug: string) =>
    apiGet<CategoryBlogsResponse>(`/blog/category/${slug}`),
  getByTagSlug: (slug: string) => apiGet<TagBlogsResponse>(`/blog/tag/${slug}`),
  create: (data: CreateBlogDto) => apiPost<BlogPost>('/blog', data),
  update: (id: number, data: UpdateBlogDto) =>
    apiPatch<BlogPost>(`/blog/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/blog/${id}`),
  generate: (data: GenerateBlogDto) =>
    apiPost<BlogPost>('/blog/generate', data),
  incrementView: (id: number) => apiPost<void>(`/blog/${id}/view`, {}),
  incrementLike: (id: number) => apiPost<void>(`/blog/${id}/like`, {}),
};
