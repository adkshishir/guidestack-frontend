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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TextInput, TextareaInput } from '@/components/admin/form-field';
import { taxonomyApi, Tag, Category } from '@/lib/api/taxonomy';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryIds: z.array(z.number()).optional().nullable(),
});

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryIds: [],
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTag();
  }, [id]);

  const loadCategories = async () => {
    const response = await taxonomyApi.categories.getAll();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const loadTag = async () => {
    setLoading(true);
    try {
      const response = await taxonomyApi.tags.getById(id);
      if (response.data) {
        setTag(response.data);
        // Extract category IDs from the tag's categoryTags relationship
        const categoryIds =
          response.data.categoryTags?.map(
            (ct) => ct.category?.id || ct.categoryId
          ) || [];
        
        form.reset({
          name: response.data.name,
          slug: response.data.slug,
          description: response.data.description || '',
          categoryIds: categoryIds,
        });
      } else {
        toast.error(response.error?.message || 'Failed to load tag');
        router.push('/admin/tags');
      }
    } catch (error) {
      toast.error('An error occurred while loading the tag');
      router.push('/admin/tags');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof tagSchema>) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...values,
        categoryIds:
          values.categoryIds && values.categoryIds.length > 0
            ? values.categoryIds
            : null,
      };
      const response = await taxonomyApi.tags.update(id, submitData);
      if (response.data) {
        toast.success('Tag updated successfully');
        router.push('/admin/tags');
      } else {
        toast.error(response.error?.message || 'Failed to update tag');
      }
    } catch (error) {
      toast.error('An error occurred while updating the tag');
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
            <p className='mt-4 text-muted-foreground'>Loading tag...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!tag) {
    return null;
  }

  return (
    <ProtectedRoute requiredRole='EDITOR'>
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/tags'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Edit Tag</h1>
            <p className='text-muted-foreground'>Update tag information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tag Details</CardTitle>
            <CardDescription>
              Update the information for this tag
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
                  description='A brief description of this tag'
                />

                {/* Categories Selection */}
                <FormField
                  control={form.control}
                  name='categoryIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <div className='space-y-2 max-h-40 overflow-y-auto border rounded-md p-3'>
                          {categories.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>
                              No categories available
                            </p>
                          ) : (
                            categories.map((category) => (
                              <div
                                key={category.id}
                                className='flex items-center space-x-2'>
                                <Checkbox
                                  checked={
                                    field.value?.includes(category.id) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...currentValue,
                                        category.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter(
                                          (id) => id !== category.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                  {category.name}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-3 pt-4 border-t'>
                  <Link href='/admin/tags'>
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
