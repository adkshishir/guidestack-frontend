'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taxonomyApi, Category } from '@/lib/api/taxonomy';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    const response = await taxonomyApi.categories.getAll();
    if (response.data) {
      setCategories(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to load categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    router.push(`/admin/categories/${category.id}/edit`);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    const response = await taxonomyApi.categories.delete(category.id);
    if (!response.error) {
      toast.success('Category deleted successfully');
      loadCategories();
    } else {
      toast.error(response.error?.message || 'Failed to delete category');
    }
  };

  const columns: Column<Category>[] = [
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
      render: (category) => category.description || '-',
    },
  ];

  return (
    <ProtectedRoute requiredRole='EDITOR'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Categories</h1>
            <p className='text-muted-foreground'>Manage blog categories</p>
          </div>
          <Link href='/admin/categories/create'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Category
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={categories}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage='No categories found'
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
