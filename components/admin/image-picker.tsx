'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ImageIcon,
  Sparkles,
  Loader2,
  X,
  Upload,
  Library,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiPost, getToken } from '@/lib/api/client';
import { Media } from '@/lib/api/blog';
import { mediaApi } from '@/lib/api/media';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  value?: Media | null;
  onChange: (media: Media | null) => void;
  label?: string;
  description?: string;
}

export function ImagePicker({
  value,
  onChange,
  label = 'Featured Image',
  description,
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGenerating(true);
    try {
      const response = await apiPost<Media>('/images/generate', {
        prompt: prompt,
        altText: prompt,
        size: '512x512',
      });

      if (response.data) {
        onChange(response.data);
        toast.success('Image generated successfully!');
        setIsOpen(false);
        setPrompt('');
      } else {
        toast.error(response.error?.message || 'Failed to generate image');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while generating image');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
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

      // Get auth token using the shared getToken function
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

      const media: Media = await response.json();
      onChange(media);
      toast.success('Image uploaded successfully!');
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while uploading');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  const imageUrl = value?.url || value?.filePath;

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      {description && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}

      {/* Hidden file input */}
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept='image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
        className='hidden'
      />

      {imageUrl ? (
        <div className='relative group'>
          <div className='relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border'>
            <Image
              src={imageUrl}
              alt={value?.fileName || 'Featured image'}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 400px'
            />
          </div>
          <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size='sm' variant='secondary'>
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-125'>
                <DialogHeader>
                  <DialogTitle>Select Image</DialogTitle>
                  <DialogDescription>
                    Upload an image or generate one using AI
                  </DialogDescription>
                </DialogHeader>
                <ImagePickerContent
                  prompt={prompt}
                  setPrompt={setPrompt}
                  generating={generating}
                  uploading={uploading}
                  onGenerate={handleGenerateImage}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onSelect={(media) => {
                    onChange(media);
                    setIsOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button size='sm' variant='destructive' onClick={handleRemoveImage}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className='w-full max-w-md h-32 border-dashed'>
              <div className='flex flex-col items-center gap-2'>
                <ImageIcon className='h-8 w-8 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Click to add an image
                </span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
              <DialogDescription>
                Upload an image, select from library, or generate one using AI
              </DialogDescription>
            </DialogHeader>
            <ImagePickerContent
              prompt={prompt}
              setPrompt={setPrompt}
              generating={generating}
              uploading={uploading}
              onGenerate={handleGenerateImage}
              onUploadClick={() => fileInputRef.current?.click()}
              onSelect={(media) => {
                onChange(media);
                setIsOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ImagePickerContentProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generating: boolean;
  uploading: boolean;
  onGenerate: () => void;
  onUploadClick: () => void;
  onSelect: (media: Media) => void;
}

function ImagePickerContent({
  prompt,
  setPrompt,
  generating,
  uploading,
  onGenerate,
  onUploadClick,
  onSelect,
}: ImagePickerContentProps) {
  return (
    <Tabs defaultValue='upload' className='w-full'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='upload'>
          <Upload className='mr-2 h-4 w-4' />
          Upload
        </TabsTrigger>
        <TabsTrigger value='library'>
          <Library className='mr-2 h-4 w-4' />
          Library
        </TabsTrigger>
        <TabsTrigger value='generate'>
          <Sparkles className='mr-2 h-4 w-4' />
          Generate
        </TabsTrigger>
      </TabsList>

      <TabsContent value='upload' className='space-y-4 py-4'>
        <div className='flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary/50 transition-colors'>
          <Upload className='h-10 w-10 text-muted-foreground mb-4' />
          <p className='text-sm text-muted-foreground mb-4 text-center'>
            Click to select an image file
            <br />
            <span className='text-xs'>
              JPEG, PNG, GIF, WebP, SVG (max 10MB)
            </span>
          </p>
          <Button type='button' onClick={onUploadClick} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Select File
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value='library' className='py-4'>
        <MediaLibrary onSelect={onSelect} />
      </TabsContent>

      <TabsContent value='generate' className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='prompt'>Image Description</Label>
          <Input
            id='prompt'
            placeholder='Describe the image you want to generate...'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !generating) {
                onGenerate();
              }
            }}
          />
          <p className='text-xs text-muted-foreground'>
            Be descriptive for better results. E.g., &quot;A professional photo
            of a modern office with natural lighting&quot;
          </p>
        </div>
        <Button
          type='button'
          onClick={onGenerate}
          disabled={generating || !prompt.trim()}
          className='w-full'>
          {generating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 h-4 w-4' />
              Generate with AI
            </>
          )}
        </Button>
      </TabsContent>
    </Tabs>
  );
}

function MediaLibrary({ onSelect }: { onSelect: (media: Media) => void }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const response = await mediaApi.getAll();
      if (response.data) {
        setMedia(response.data);
      }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center text-center p-8'>
        <ImageIcon className='h-12 w-12 text-muted-foreground mb-2' />
        <p className='text-muted-foreground'>No media found in your library.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <ScrollArea className='h-100 pr-4'>
        <div className='grid grid-cols-3 gap-4'>
          {media.map((item) => {
            const imageUrl = item.url || item.filePath;
            return (
              <div
                key={item.id}
                className={cn(
                  'relative aspect-square cursor-pointer rounded-lg border-2 overflow-hidden group transition-all',
                  selectedId === item.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-slate-200',
                )}
                onClick={() => setSelectedId(item.id)}>
                <Image
                  src={imageUrl!}
                  alt={item.fileName || 'Media'}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 33vw, 200px'
                />
                {selectedId === item.id && (
                  <div className='absolute inset-0 bg-primary/20 flex items-center justify-center'>
                    <div className='bg-primary text-primary-foreground rounded-full p-1'>
                      <Check className='h-4 w-4' />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className='flex justify-end'>
        <Button
          disabled={!selectedId}
          onClick={() => {
            const selected = media.find((m) => m.id === selectedId);
            if (selected) onSelect(selected);
          }}>
          Insert Selected
        </Button>
      </div>
    </div>
  );
}
