'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { DataTable, Column, StatusBadge, RoleBadge } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { TextInput, SelectInput } from '@/components/admin/form-field';
import { usersApi, User, CreateUserDto } from '@/lib/api/users';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'EDITOR', 'AUTHOR']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'AUTHOR',
      status: 'ACTIVE',
    },
  });

  const loadUsers = async () => {
    setLoading(true);
    const response = await usersApi.getAll();
    if (response.data) {
      setUsers(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    if (editingUser) {
      const response = await usersApi.update(editingUser.id, values);
      if (response.data) {
        toast.success('User updated successfully');
        setIsDialogOpen(false);
        setEditingUser(null);
        form.reset();
        loadUsers();
      } else {
        toast.error(response.error?.message || 'Failed to update user');
      }
    } else {
      const response = await usersApi.create(values as CreateUserDto);
      if (response.data) {
        toast.success('User created successfully');
        setIsDialogOpen(false);
        form.reset();
        loadUsers();
      } else {
        toast.error(response.error?.message || 'Failed to create user');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }

    const response = await usersApi.delete(user.id);
    if (!response.error) {
      toast.success('User deleted successfully');
      loadUsers();
    } else {
      toast.error(response.error?.message || 'Failed to delete user');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingUser(null);
                form.reset();
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information' : 'Create a new user account'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <TextInput name="email" label="Email" type="email" required />
                  <TextInput
                    name="password"
                    label="Password"
                    type="password"
                    required={!editingUser}
                    description={editingUser ? 'Leave empty to keep current password' : undefined}
                  />
                  <SelectInput
                    name="role"
                    label="Role"
                    options={[
                      { value: 'AUTHOR', label: 'Author' },
                      { value: 'EDITOR', label: 'Editor' },
                      { value: 'ADMIN', label: 'Admin' },
                    ]}
                  />
                  <SelectInput
                    name="status"
                    label="Status"
                    options={[
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'SUSPENDED', label: 'Suspended' },
                    ]}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingUser(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage="No users found"
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

