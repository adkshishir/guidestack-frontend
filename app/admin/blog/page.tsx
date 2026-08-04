'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { blogApi, BlogPost, BlogPostStatus } from '@/lib/api/blog';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: BlogPostStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'Pending Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const STATUS_FILTERS: { value: BlogPostStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  ...STATUS_OPTIONS,
];

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'ALL'>(
    'ALL',
  );
  /** Post id currently being saved, so only its row shows a spinner. */
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    const response = await blogApi.getAll();
    const payload = response.data;
    if (payload?.data) {
      setPosts(payload.data);
    } else if (response.error) {
      toast.error(response.error?.message || 'Failed to load blog posts');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Inline status change straight from the list — the approval path for
   * AI-generated posts, which land in REVIEW and would otherwise need a trip
   * through the full edit form just to be published.
   */
  const handleStatusChange = async (post: BlogPost, next: BlogPostStatus) => {
    if (next === post.status) return;

    if (
      next === 'PUBLISHED' &&
      !confirm(`Publish "${post.title}"? It will become publicly visible.`)
    ) {
      return;
    }

    setUpdatingId(post.id);
    // Optimistic: the select shows the new value immediately, and is rolled
    // back below if the request fails.
    setPosts((current) =>
      current.map((p) => (p.id === post.id ? { ...p, status: next } : p)),
    );

    const response = await blogApi.update(post.id, { status: next });
    if (response.error) {
      setPosts((current) =>
        current.map((p) =>
          p.id === post.id ? { ...p, status: post.status } : p,
        ),
      );
      toast.error(response.error.message || 'Failed to update status');
    } else {
      toast.success(
        next === 'PUBLISHED'
          ? `"${post.title}" is now live`
          : `Status set to ${next.toLowerCase()}`,
      );
    }
    setUpdatingId(null);
  };

  const handleEdit = (post: BlogPost) => {
    router.push(`/admin/blog/${post.id}/edit`);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    const response = await blogApi.delete(post.id);
    if (!response.error) {
      toast.success('Blog post deleted successfully');
      loadPosts();
    } else {
      toast.error(response.error?.message || 'Failed to delete blog post');
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'title',
      header: 'Title',
    },
    {
      key: 'slug',
      header: 'Slug',
    },
    {
      key: 'status',
      header: 'Status',
      render: (post) => (
        <div className='flex items-center gap-2'>
          <Select
            value={post.status}
            disabled={updatingId === post.id}
            onValueChange={(value) =>
              handleStatusChange(post, value as BlogPostStatus)
            }>
            <SelectTrigger className='h-8 w-[150px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updatingId === post.id && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (post) => new Date(post.createdAt).toLocaleDateString(),
    },
  ];

  const filteredPosts =
    statusFilter === 'ALL'
      ? posts
      : posts.filter((post) => post.status === statusFilter);

  return (
    <ProtectedRoute>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Blog Posts</h1>
            <p className='text-muted-foreground'>Manage your blog posts</p>
          </div>
          <Link href='/admin/blog/create'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Post
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>All Posts</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as BlogPostStatus | 'ALL')
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPosts}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage='No blog posts found'
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
