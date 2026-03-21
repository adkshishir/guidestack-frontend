'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user, isAdmin, isEditor, isAuthor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
        return;
      }

      if (requiredRole) {
        if (requiredRole === 'ADMIN' && !isAdmin) {
          router.push('/admin');
          return;
        }
        if (requiredRole === 'EDITOR' && !isEditor) {
          router.push('/admin');
          return;
        }
        if (requiredRole === 'AUTHOR' && !isAuthor) {
          router.push('/admin');
          return;
        }
      }
    }
  }, [loading, isAuthenticated, requiredRole, isAdmin, isEditor, isAuthor, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

