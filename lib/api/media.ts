import { apiGet, apiDelete } from './client';
import { Media } from './blog';

export const mediaApi = {
  getAll: () => apiGet<Media[]>('/media'),
  getById: (id: number) => apiGet<Media>(`/media/${id}`),
  delete: (id: number) => apiDelete<void>(`/media/${id}`),
};
