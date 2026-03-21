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
import { blogApi, CreateBlogDto } from '@/lib/api/blog';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SerializedEditorState } from 'lexical';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  htmlContent: z.string().optional(),
  lexicalContent: z.any().optional(), // Store Lexical serialized state
});

export default function CreateBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lexicalState, setLexicalState] =
    useState<SerializedEditorState | null>(null);

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'DRAFT',
      htmlContent: '',
      lexicalContent: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    setIsSubmitting(true);
    try {
      // Convert Lexical state to HTML if available
      let htmlContent = values.htmlContent || '';
      if (lexicalState) {
        // For now, we'll store the serialized state as JSON in htmlContent
        // You can convert it to HTML on the backend or frontend as needed
        htmlContent = JSON.stringify(lexicalState);
      }

      const response = await blogApi.create({
        ...values,
        htmlContent,
      } as CreateBlogDto);

      if (response.data) {
        toast.success('Blog post created successfully');
        router.push('/admin/blog');
      } else {
        toast.error(response.error?.message || 'Failed to create blog post');
      }
    } catch (error) {
      toast.error('An error occurred while creating the blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (serializedState: SerializedEditorState) => {
    setLexicalState(serializedState);
    form.setValue('lexicalContent', serializedState);
  };

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
            <h1 className='text-3xl font-bold'>Create New Blog Post</h1>
            <p className='text-muted-foreground'>
              Add a new blog post to your site
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Post Details</CardTitle>
            <CardDescription>
              Fill in the information for your new blog post
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
                            value={field.value}
                            onChange={(serializedState) => {
                              handleEditorChange(serializedState);
                              field.onChange(JSON.stringify(serializedState));
                            }}
                            placeholder='Start writing your blog post...'
                          />
                          <p className='text-xs text-muted-foreground'>
                            Use the rich text editor above to create your blog
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
                    {isSubmitting ? 'Creating...' : 'Create Post'}
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
