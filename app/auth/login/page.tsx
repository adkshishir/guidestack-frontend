'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Form } from '@/components/ui/form';
import { TextInput } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loginWithTwoFactor, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEmail, setMfaEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);

    const result = await login(values);

    if (result.error) {
      setError(result.error.message || 'Login failed');
      setIsLoading(false);
    } else if (result.mfaRequired) {
      setMfaRequired(true);
      setMfaEmail(result.email || values.email);
      setIsLoading(false);
    } else {
      router.push('/admin');
    }
  };

  const onTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await loginWithTwoFactor(mfaEmail, twoFactorCode);

    if (result.error) {
      setError(result.error.message || 'Invalid 2FA code');
      setIsLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>
            {mfaRequired ? 'Two-Factor Authentication' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {mfaRequired
              ? 'Please enter the verification code from your authenticator app'
              : 'Enter your credentials to access the admin panel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaRequired ? (
            <form onSubmit={onTwoFactorSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                  Verification Code
                </label>
                <input
                  type='text'
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  placeholder='Enter 6-digit code'
                  required
                />
              </div>
              {error && (
                <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'>
                <TextInput
                  name='email'
                  label='Email'
                  type='email'
                  placeholder='admin@example.com'
                  required
                />
                <TextInput
                  name='password'
                  label='Password'
                  type='password'
                  placeholder='Enter your password'
                  required
                />
                {error && (
                  <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
                    {error}
                  </div>
                )}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
