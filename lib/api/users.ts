import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
  status?: 'ACTIVE' | 'SUSPENDED';
}

export const usersApi = {
  getAll: () => apiGet<User[]>('/users'),
  getById: (id: number) => apiGet<User>(`/users/${id}`),
  getCurrent: () => apiGet<User>('/users/me'),
  create: (data: CreateUserDto) => apiPost<User>('/users', data),
  update: (id: number, data: UpdateUserDto) => apiPatch<User>(`/users/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/users/${id}`),
};

