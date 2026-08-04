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
import {
  TextInput,
  TextareaInput,
  SelectInput,
} from '@/components/admin/form-field';
import { BlogEditor } from '@/components/admin/blog-editor';
import { blogApi, BlogPost } from '@/lib/api/blog';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  htmlContent: z.string().optional(),
});

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'DRAFT',
      htmlContent: '',
    },
  });

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const response = await blogApi.getById(id);
      if (response.data) {
        setPost(response.data);

        // Content lives on the blogContent relation, not on the post itself.
        // Reading the (always null) top-level field was why the editor opened
        // empty for every post.
        const htmlContent =
          response.data.blogContent?.htmlContent ||
          response.data.htmlContent ||
          '';

        form.reset({
          title: response.data.title,
          slug: response.data.slug,
          excerpt: response.data.excerpt || '',
          status: response.data.status,
          htmlContent,
        });
      } else {
        toast.error(response.error?.message || 'Failed to load blog post');
        router.push('/admin/blog');
      }
    } catch (error) {
      toast.error('An error occurred while loading the blog post');
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await blogApi.update(id, values);

      if (response.data) {
        toast.success('Blog post updated successfully');
        router.push('/admin/blog');
      } else {
        toast.error(response.error?.message || 'Failed to update blog post');
      }
    } catch (error) {
      toast.error('An error occurred while updating the blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent'></div>
            <p className='mt-4 text-muted-foreground'>Loading blog post...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/blog'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Edit Blog Post</h1>
            <p className='text-muted-foreground'>
              Update blog post information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Post Details</CardTitle>
            <CardDescription>
              Update the information for this blog post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'>
                <TextInput name='title' label='Title' required />
                <TextInput
                  name='slug'
                  label='Slug'
                  description='Leave empty to auto-generate from title'
                />
                <TextareaInput
                  name='excerpt'
                  label='Excerpt'
                  rows={3}
                  description='A brief summary of the blog post'
                />
                <SelectInput
                  name='status'
                  label='Status'
                  options={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'REVIEW', label: 'Pending Review' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' },
                  ]}
                />
                <FormField
                  control={form.control}
                  name='htmlContent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <BlogEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder='Start editing your blog post...'
                          />
                          <p className='text-xs text-muted-foreground'>
                            Use the rich text editor above to edit your blog
                            post content
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-end gap-3 pt-4 border-t'>
                  <Link href='/admin/blog'>
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
