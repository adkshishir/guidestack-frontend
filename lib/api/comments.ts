import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export type CommentStatus =
  | 'VISIBLE'
  | 'DELETED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_VERIFICATION';

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Comment {
  id: number;
  content: string;
  status: CommentStatus;
  blogPostId: number;
  parentId?: number | null;
  userId?: number;
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  replies?: Comment[];
  commentToken?: string; // Returned after verification for future use
}

export interface CreateCommentDto {
  content: string;
  blogPostId: number;
  parentId?: number;
  authorName?: string;
  authorEmail?: string;
  commentToken?: string; // For verified guests to skip OTP
}

export interface VerifyCommentDto {
  email: string;
  code: string;
  commentId: number;
}

export interface UpdateCommentDto {
  content?: string;
  status?: CommentStatus;
}

export const commentsApi = {
  getAll: (blogPostId?: number) => {
    const query = blogPostId ? `?blogPostId=${blogPostId}` : '';
    return apiGet<Comment[]>(`/comments${query}`);
  },
  getById: (id: number) => apiGet<Comment>(`/comments/${id}`),
  getByBlogPost: (blogPostId: number) =>
    apiGet<Comment[]>(`/comments/blog/${blogPostId}`),
  create: (data: CreateCommentDto) => apiPost<Comment>('/comments', data),
  verify: (data: VerifyCommentDto) =>
    apiPost<Comment>('/comments/verify', data),
  update: (id: number, data: UpdateCommentDto) =>
    apiPatch<Comment>(`/comments/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/comments/${id}`),
  hardDelete: (id: number) => apiDelete<void>(`/comments/${id}/hard`),
};
