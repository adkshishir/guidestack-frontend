'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column, StatusBadge } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { commentsApi, Comment } from '@/lib/api/comments';
import { toast } from 'sonner';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    setLoading(true);
    const response = await commentsApi.getAll();
    if (response.data) {
      setComments(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to load comments');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDelete = async (comment: Comment) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    const response = await commentsApi.delete(comment.id);
    if (!response.error) {
      toast.success('Comment deleted successfully');
      loadComments();
    } else {
      toast.error(response.error?.message || 'Failed to delete comment');
    }
  };

  const columns: Column<Comment>[] = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'content',
      header: 'Content',
      render: (comment) => (
        <div className="max-w-md truncate">{comment.content}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (comment) => <StatusBadge status={comment.status} />,
    },
    {
      key: 'blogPostId',
      header: 'Blog Post ID',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (comment) => new Date(comment.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-muted-foreground">Manage blog comments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={comments}
              columns={columns}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage="No comments found"
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

