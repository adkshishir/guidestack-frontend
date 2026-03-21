import { apiGet } from './client';

export interface DashboardCounts {
  blogPosts: number;
  publishedPosts: number;
  draftPosts: number;
  users: number;
  comments: number;
  categories: number;
  tags: number;
  subscribers: number;
}

export interface PostsOverTimeItem {
  date: string;
  count: number;
  published: number;
}

export interface EngagementStats {
  totalViews: number;
  totalLikes: number;
  topPostsByViews: Array<{ id: number; title: string; slug: string; views: number }>;
  topPostsByLikes: Array<{ id: number; title: string; slug: string; likes: number }>;
}

export interface PostsByStatusItem {
  status: string;
  count: number;
}

export interface DashboardAnalytics {
  counts: DashboardCounts;
  postsOverTime: PostsOverTimeItem[];
  engagement: EngagementStats;
  postsByStatus: PostsByStatusItem[];
}

export const dashboardApi = {
  getAnalytics: (days?: number) =>
    apiGet<DashboardAnalytics>(
      days ? `/dashboard/analytics?days=${days}` : '/dashboard/analytics',
    ),
};
