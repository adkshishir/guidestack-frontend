'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ImageIcon, Upload, Sparkles, Loader2, Trash2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiPost, apiGet, apiDelete, getToken } from '@/lib/api/client';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MediaItem {
  id: number;
  type: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  altText: z.string().optional(),
  blogPostId: z.number().optional(),
});

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof generateImageSchema>>({
    resolver: zodResolver(generateImageSchema),
    defaultValues: {
      prompt: '',
      altText: '',
      blogPostId: undefined,
    },
  });

  const handleGenerateImage = async (
    values: z.infer<typeof generateImageSchema>
  ) => {
    setGenerating(true);
    try {
      const response = await apiPost<MediaItem>('/images/generate', {
        prompt: values.prompt,
        altText: values.altText,
        blogPostId: values.blogPostId,
        model: 'gemini-2.5-flash-image',
        size: 'LARGE',
      });

      if (response.data) {
        toast.success('Image generated successfully!');
        form.reset();
        loadMedia();
      } else {
        toast.error(response.error?.message || 'Failed to generate image');
      }
    } catch (error: any) {
      toast.error(
        error.message || 'An error occurred while generating the image'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp|svg\+xml)$/)) {
      toast.error('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);

      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4007';
      const response = await fetch(`${apiUrl}/media/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      toast.success('File uploaded successfully!');
      loadMedia();
      // Reset the file input
      event.target.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    try {
      const response = await apiDelete(`/media/${id}`);
      if (response.error) {
        toast.error(response.error.message || 'Failed to delete media');
        return;
      }
      toast.success('Media deleted successfully!');
      loadMedia();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete media');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await apiGet<MediaItem[]>('/media');
      if (response.data) {
        setMediaItems(response.data);
      }
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <ProtectedRoute>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Media Library</h1>
          <p className='text-muted-foreground'>
            Manage your media files and generate images with AI
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Generate Image Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary' />
                <CardTitle>Generate Image with AI</CardTitle>
              </div>
              <CardDescription>
                Use Gemini AI to generate images from text prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleGenerateImage)}
                  className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='prompt'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe the image you want to generate...'
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='altText'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Alternative text for the image'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='submit'
                    disabled={generating}
                    className='w-full'>
                    {generating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Generate Image
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Upload File Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Upload className='h-5 w-5 text-primary' />
                <CardTitle>Upload Media</CardTitle>
              </div>
              <CardDescription>
                Upload images, videos, or other media files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-center w-full'>
                  <Label
                    htmlFor='file-upload'
                    className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors'>
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                      <Upload className='w-10 h-10 mb-3 text-muted-foreground' />
                      <p className='mb-2 text-sm text-muted-foreground'>
                        <span className='font-semibold'>Click to upload</span>{' '}
                        or drag and drop
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        PNG, JPG, GIF, MP4, or other media files
                      </p>
                    </div>
                    <Input
                      id='file-upload'
                      type='file'
                      className='hidden'
                      onChange={handleFileUpload}
                      disabled={uploading}
                      accept='image/*,video/*'
                    />
                  </Label>
                </div>
                {uploading && (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                    <span className='ml-2 text-sm text-muted-foreground'>
                      Uploading...
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>
              All your uploaded and generated media files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : mediaItems.length > 0 ? (
              <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className='group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition-shadow'>
                    {item.type === 'IMAGE' ? (
                      <div className='relative h-48 w-full'>
                        <Image
                          src={item.url}
                          alt={item.altText || 'Media item'}
                          fill
                          className='object-cover'
                          sizes='(max-width: 768px) 50vw, 25vw'
                        />
                      </div>
                    ) : (
                      <div className='flex h-48 w-full items-center justify-center bg-muted'>
                        <ImageIcon className='h-12 w-12 text-muted-foreground' />
                      </div>
                    )}
                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2'>
                      <div className='text-center text-white p-2'>
                        <p className='text-sm font-medium truncate max-w-full px-2'>
                          {item.altText || 'No description'}
                        </p>
                        {item.width && item.height && (
                          <p className='text-xs text-white/80 mt-1'>
                            {item.width} × {item.height}
                          </p>
                        )}
                        {item.size && (
                          <p className='text-xs text-white/80'>
                            {(item.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => copyToClipboard(item.url)}
                          title='Copy URL'>
                          <Copy className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => window.open(item.url, '_blank')}
                          title='Open in new tab'>
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='destructive'
                              title='Delete'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                the media file from the server.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMedia(item.id)}
                                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>No media files yet</p>
                <p className='text-sm text-muted-foreground mt-2'>
                  Generate an image or upload a file to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
