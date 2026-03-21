import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { Media } from './blog';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  featuredImageId?: number;
  featuredImage?: Media;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTag {
  categoryId: number;
  tagId: number;
  category?: Category;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  categoryTags?: CategoryTag[];
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
  featuredImageId?: number | null;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
  featuredImageId?: number | null;
}

export interface CreateTagDto {
  name: string;
  slug?: string;
  description?: string;
  categoryIds?: number[] | null;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  description?: string;
  categoryIds?: number[] | null;
}

export interface NavigationCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  blogs: Array<{ name: string; slug: string }>;
  children: NavigationCategory[];
}

export const taxonomyApi = {
  categories: {
    getAll: () => apiGet<Category[]>('/taxonomy/categories'),
    getById: (id: number) => apiGet<Category>(`/taxonomy/categories/${id}`),
    getBySlug: (slug: string) =>
      apiGet<Category>(`/taxonomy/categories/slug/${slug}`),
    create: (data: CreateCategoryDto) =>
      apiPost<Category>('/taxonomy/categories', data),
    update: (id: number, data: UpdateCategoryDto) =>
      apiPatch<Category>(`/taxonomy/categories/${id}`, data),
    delete: (id: number) => apiDelete<void>(`/taxonomy/categories/${id}`),
  },
  tags: {
    getAll: () => apiGet<Tag[]>('/taxonomy/tags'),
    getById: (id: number) => apiGet<Tag>(`/taxonomy/tags/${id}`),
    getBySlug: (slug: string) => apiGet<Tag>(`/taxonomy/tags/slug/${slug}`),
    create: (data: CreateTagDto) => apiPost<Tag>('/taxonomy/tags', data),
    update: (id: number, data: UpdateTagDto) =>
      apiPatch<Tag>(`/taxonomy/tags/${id}`, data),
    delete: (id: number) => apiDelete<void>(`/taxonomy/tags/${id}`),
  },
  navigation: {
    getCategories: () => apiGet<NavigationCategory[]>('/taxonomy/navigation'),
  },
};
