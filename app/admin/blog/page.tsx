'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column, StatusBadge } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { blogApi, BlogPost } from '@/lib/api/blog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
      render: (post) => <StatusBadge status={post.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (post) => new Date(post.createdAt).toLocaleDateString(),
    },
  ];

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
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={posts}
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
