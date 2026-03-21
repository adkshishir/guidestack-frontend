import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export interface BlogTask {
  id: number;
  title: string;
  description: string | null;
  isActive: boolean;
  categoryIds: number[] | null;
  tagIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogTaskDto {
  title: string;
  description?: string | null;
  categoryIds?: number[] | null;
  tagIds?: number[] | null;
}

export interface UpdateBlogTaskDto {
  title?: string;
  description?: string | null;
  isActive?: boolean;
  categoryIds?: number[] | null;
  tagIds?: number[] | null;
}

export const blogTasksApi = {
  getAll: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return apiGet<BlogTask[]>(`/blog/tasks${query}`);
  },
  getById: (id: number) => apiGet<BlogTask>(`/blog/tasks/${id}`),
  create: (data: CreateBlogTaskDto) => apiPost<BlogTask>('/blog/tasks', data),
  update: (id: number, data: UpdateBlogTaskDto) => apiPatch<BlogTask>(`/blog/tasks/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/blog/tasks/${id}`),
};

