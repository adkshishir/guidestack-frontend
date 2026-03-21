'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import {
  TextInput,
  TextareaInput,
  FormFieldWrapper,
} from '@/components/admin/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { taxonomyApi, Category } from '@/lib/api/taxonomy';
import { Media } from '@/lib/api/blog';
import { ImagePicker } from '@/components/admin/image-picker';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.any(),
  featuredImageId: z.number().optional().nullable(),
});

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredImage, setFeaturedImage] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: 'none',
    },
  });

  useEffect(() => {
    loadCategory();
    loadCategories();
  }, [id]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const response = await taxonomyApi.categories.getById(id);
      if (response.data) {
        setCategory(response.data);
        form.reset({
          name: response.data.name,
          slug: response.data.slug,
          description: response.data.description || '',
          parentId: response.data.parentId || 'none',
        });
        // Set featured image if exists
        if (response.data.featuredImage) {
          setFeaturedImage(response.data.featuredImage);
        }
      } else {
        toast.error(response.error?.message || 'Failed to load category');
        router.push('/admin/categories');
      }
    } catch (error) {
      toast.error('An error occurred while loading the category');
      router.push('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const response = await taxonomyApi.categories.getAll();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await taxonomyApi.categories.update(id, {
        ...values,
        parentId: values?.parentId !== 'none' ? values.parentId : null,
        featuredImageId: featuredImage?.id || null,
      });
      if (response.data) {
        toast.success('Category updated successfully');
        router.push('/admin/categories');
      } else {
        toast.error(response.error?.message || 'Failed to update category');
      }
    } catch (error) {
      toast.error('An error occurred while updating the category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole='EDITOR'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent'></div>
            <p className='mt-4 text-muted-foreground'>Loading category...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!category) {
    return null;
  }

  const parentOptions = categories
    .filter((cat) => cat.id !== category.id)
    .map((cat) => ({ value: cat.id.toString(), label: cat.name }));

  return (
    <ProtectedRoute requiredRole='EDITOR'>
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/categories'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Edit Category</h1>
            <p className='text-muted-foreground'>Update category information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Update the information for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'>
                <TextInput name='name' label='Name' required />
                <TextInput
                  name='slug'
                  label='Slug'
                  description='Leave empty to auto-generate from name'
                />
                <TextareaInput
                  name='description'
                  label='Description'
                  rows={4}
                  description='A brief description of this category'
                />
                <ImagePicker
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  label='Featured Image'
                  description='Add an image to represent this category'
                />
                {parentOptions.length > 0 && (
                  <FormFieldWrapper
                    name='parentId'
                    label='Parent Category'
                    description='Select a parent category (optional)'>
                    {(field) => (
                      <Select
                        onValueChange={(value) =>
                          field.onChange(
                            value !== 'none' ? parseInt(value) : 'none',
                          )
                        }
                        value={field.value ? field.value.toString() : 'none'}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select parent category (optional)' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          {parentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormFieldWrapper>
                )}
                <div className='flex justify-end gap-3 pt-4 border-t'>
                  <Link href='/admin/categories'>
                    <Button type='button' variant='outline'>
                      Cancel
                    </Button>
                  </Link>
                  <Button type='submit' disabled={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
