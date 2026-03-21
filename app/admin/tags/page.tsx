'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taxonomyApi, Tag } from '@/lib/api/taxonomy';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTags = async () => {
    setLoading(true);
    const response = await taxonomyApi.tags.getAll();
    if (response.data) {
      setTags(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to load tags');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleEdit = (tag: Tag) => {
    router.push(`/admin/tags/${tag.id}/edit`);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      return;
    }

    const response = await taxonomyApi.tags.delete(tag.id);
    if (!response.error) {
      toast.success('Tag deleted successfully');
      loadTags();
    } else {
      toast.error(response.error?.message || 'Failed to delete tag');
    }
  };

  const columns: Column<Tag>[] = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'slug',
      header: 'Slug',
    },
    {
      key: 'description',
      header: 'Description',
      render: (tag) => tag.description || '-',
    },
  ];

  return (
    <ProtectedRoute requiredRole='EDITOR'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Tags</h1>
            <p className='text-muted-foreground'>Manage blog tags</p>
          </div>
          <Link href='/admin/tags/create'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Tag
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tags}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage='No tags found'
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
