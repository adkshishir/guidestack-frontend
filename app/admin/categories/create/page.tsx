'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { taxonomyApi, CreateCategoryDto } from '@/lib/api/taxonomy';
import { Media } from '@/lib/api/blog';
import { ImagePicker } from '@/components/admin/image-picker';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect } from 'react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.any(),
});

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<Media | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);

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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await taxonomyApi.categories.getAll();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true);
    try {
      const payload: CreateCategoryDto = {
        ...values,
        parentId: values?.parentId !== 'none' ? values.parentId : null,
        featuredImageId: featuredImage?.id || null,
      };
      const response = await taxonomyApi.categories.create(payload);
      if (response.data) {
        toast.success('Category created successfully');
        router.push('/admin/categories');
      } else {
        toast.error(response.error?.message || 'Failed to create category');
      }
    } catch (error) {
      toast.error('An error occurred while creating the category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

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
            <h1 className='text-3xl font-bold'>Create New Category</h1>
            <p className='text-muted-foreground'>
              Add a new category to organize your blog posts
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Fill in the information for your new category
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
                    {isSubmitting ? 'Creating...' : 'Create Category'}
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
