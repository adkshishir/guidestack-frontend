'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users, role: 'ADMIN' as const },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  {
    href: '/admin/blog-tasks',
    label: 'Blog Tasks',
    icon: FileText,
    role: 'EDITOR' as const,
  },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/profile', label: 'My Profile', icon: UserCog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, isAdmin, isEditor } = useAuth();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.role === 'ADMIN' && !isAdmin) {
      return false;
    }
    if (item.role === 'EDITOR' && !isEditor) {
      return false;
    }
    return true;
  });

  return (
    <div className='flex h-screen w-64 flex-col border-r bg-card'>
      <div className='flex h-16 items-center border-b px-6'>
        <h1 className='text-lg font-semibold'>Admin Panel</h1>
      </div>
      <nav className='flex-1 space-y-1 p-4'>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}>
              <Icon className='h-5 w-5' />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className='border-t p-4'>
        <Button
          variant='ghost'
          className='w-full justify-start'
          onClick={() => logout()}>
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </Button>
      </div>
    </div>
  );
}
