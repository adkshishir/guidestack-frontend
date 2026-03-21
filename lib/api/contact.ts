import { apiGet, apiPost } from './client';

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
}

export interface CreateContactDto {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactApi = {
  create: (data: CreateContactDto) => apiPost<Contact>('/contact', data),
  getAll: () => apiGet<Contact[]>('/contact'),
  getById: (id: number) => apiGet<Contact>(`/contact/${id}`),
};

