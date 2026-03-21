'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column, StatusBadge } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  blogTasksApi,
  BlogTask,
  CreateBlogTaskDto,
} from '@/lib/api/blog-tasks';
import { taxonomyApi, Category, Tag } from '@/lib/api/taxonomy';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional().nullable(),
  tagIds: z.array(z.number()).optional().nullable(),
});

export default function BlogTasksPage() {
  const [tasks, setTasks] = useState<BlogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BlogTask | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: null,
      isActive: true,
      categoryIds: [],
      tagIds: [],
    },
  });

  const loadTasks = async () => {
    setLoading(true);
    const response = await blogTasksApi.getAll();
    if (response.data) {
      setTasks(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to load blog tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    const [categoriesResponse, tagsResponse] = await Promise.all([
      taxonomyApi.categories.getAll(),
      taxonomyApi.tags.getAll(),
    ]);
    if (categoriesResponse.data) {
      setCategories(categoriesResponse.data);
    }
    if (tagsResponse.data) {
      setTags(tagsResponse.data);
    }
  };

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    // Convert string boolean to actual boolean if needed
    const submitData = {
      ...values,
      isActive:
        typeof values.isActive === 'string'
          ? values.isActive === 'true'
          : values.isActive ?? true,
      // Ensure categoryIds and tagIds are arrays or null
      categoryIds:
        values.categoryIds && values.categoryIds.length > 0
          ? values.categoryIds
          : null,
      tagIds: values.tagIds && values.tagIds.length > 0 ? values.tagIds : null,
    };

    if (editingTask) {
      const response = await blogTasksApi.update(editingTask.id, submitData);
      if (response.data) {
        toast.success('Blog task updated successfully');
        setIsDialogOpen(false);
        setEditingTask(null);
        form.reset({
          title: '',
          description: null,
          isActive: true,
          categoryIds: [],
          tagIds: [],
        });
        loadTasks();
      } else {
        toast.error(response.error?.message || 'Failed to update blog task');
      }
    } else {
      const { isActive, ...createData } = submitData;
      const response = await blogTasksApi.create(
        createData as CreateBlogTaskDto
      );
      if (response.data) {
        toast.success('Blog task created successfully');
        setIsDialogOpen(false);
        form.reset({
          title: '',
          description: null,
          isActive: true,
          categoryIds: [],
          tagIds: [],
        });
        loadTasks();
      } else {
        toast.error(response.error?.message || 'Failed to create blog task');
      }
    }
  };

  const handleEdit = (task: BlogTask) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || null,
      isActive: task.isActive.toString() as any,
      categoryIds: task.categoryIds || [],
      tagIds: task.tagIds || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (task: BlogTask) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    const response = await blogTasksApi.delete(task.id);
    if (!response.error) {
      toast.success('Blog task deleted successfully');
      loadTasks();
    } else {
      toast.error(response.error?.message || 'Failed to delete blog task');
    }
  };

  const columns: Column<BlogTask>[] = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'title',
      header: 'Title',
    },
    {
      key: 'description',
      header: 'Description',
      render: (task) =>
        task.description || <span className='text-muted-foreground'>-</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (task) => (
        <StatusBadge status={task.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (task) => new Date(task.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <ProtectedRoute requiredRole='EDITOR'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Blog Tasks</h1>
            <p className='text-muted-foreground'>
              Manage scheduled blog generation tasks. The scheduler will only
              run when there are active tasks.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTask(null);
                  form.reset({
                    title: '',
                    description: null,
                    isActive: true,
                    categoryIds: [],
                    tagIds: [],
                  });
                }}>
                <Plus className='mr-2 h-4 w-4' />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? 'Update blog task information'
                    : 'Create a new blog generation task'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'>
                  <TextInput name='title' label='Title' required />
                  <TextareaInput
                    name='description'
                    label='Description'
                    rows={3}
                    description='Optional description to provide more context for blog generation'
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
                                      field.value?.includes(category.id) ||
                                      false
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

                  {/* Tags Selection */}
                  <FormField
                    control={form.control}
                    name='tagIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <div className='space-y-2 max-h-40 overflow-y-auto border rounded-md p-3'>
                            {tags.length === 0 ? (
                              <p className='text-sm text-muted-foreground'>
                                No tags available
                              </p>
                            ) : (
                              tags.map((tag) => (
                                <div
                                  key={tag.id}
                                  className='flex items-center space-x-2'>
                                  <Checkbox
                                    checked={
                                      field.value?.includes(tag.id) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValue,
                                          tag.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (id) => id !== tag.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                    {tag.name}
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

                  {editingTask && (
                    <SelectInput
                      name='isActive'
                      label='Status'
                      options={[
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                      ]}
                    />
                  )}
                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingTask(null);
                        form.reset();
                      }}>
                      Cancel
                    </Button>
                    <Button type='submit'>Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tasks}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage='No blog tasks found. Create a task to enable scheduled blog generation.'
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
