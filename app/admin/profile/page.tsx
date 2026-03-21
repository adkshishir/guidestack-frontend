'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { generateTwoFactor, enableTwoFactor } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TextInput } from '@/components/admin/form-field';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

export default function ProfilePage() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formSchema = z.object({
    code: z.string().min(6).max(6),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  const handleSetup = async () => {
    const res = await generateTwoFactor();
    if (res.data) {
      setQrCode(res.data.qrCodeDataUrl);
      setSecret(res.data.secret);
      setStatus(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!secret) return;
    const res = await enableTwoFactor(values.code, secret);
    if (res.error) {
      setStatus('error');
      setErrorMessage(res.error.message || 'Verification failed');
    } else {
      setStatus('success');
      setQrCode(null);
      setSecret(null);
      form.reset();
      // Reload page or re-fetch user to update status
      window.location.reload();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>My Profile</h1>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Email
              </label>
              <p className='font-medium'>{user?.email}</p>
            </div>
            <div className='grid gap-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Role
              </label>
              <Badge variant='outline' className='w-fit'>
                {user?.role}
              </Badge>
            </div>
            <div className='grid gap-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Status
              </label>
              <Badge
                variant={user?.status === 'ACTIVE' ? 'default' : 'destructive'}
                className='w-fit'>
                {user?.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Two-Factor Authentication</p>
                <p className='text-sm text-muted-foreground'>
                  Secure your account with 2FA.
                </p>
              </div>
              <Badge
                variant={user?.isTwoFactorEnabled ? 'default' : 'secondary'}>
                {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {!user?.isTwoFactorEnabled && (
              <>
                {!qrCode ? (
                  <Button onClick={handleSetup}>Setup 2FA</Button>
                ) : (
                  <div className='space-y-4 border rounded-lg p-4 bg-muted/50'>
                    <div className='text-center'>
                      <p className='text-sm font-medium mb-4'>
                        Enter this code in your authenticator app
                      </p>
                      {/* <img src={qrCode} alt="2FA QR Code" className="mx-auto rounded-lg bg-white p-2" /> */}
                      <div className='flex items-center justify-center gap-2 p-4 bg-background rounded-md border'>
                        <code className='text-lg font-mono font-bold tracking-wider'>
                          {secret}
                        </code>
                      </div>
                      <p className='text-xs text-muted-foreground mt-2'>
                        (QR code hidden by request based on rendering issues.
                        Use the secret key above manually.)
                      </p>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'>
                        <TextInput
                          name='code'
                          label='Verification Code'
                          placeholder='Enter 6-digit code'
                        />
                        {status === 'error' && (
                          <p className='text-sm text-destructive'>
                            {errorMessage}
                          </p>
                        )}
                        <div className='flex gap-2'>
                          <Button type='submit'>Verify & Enable</Button>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => setQrCode(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
