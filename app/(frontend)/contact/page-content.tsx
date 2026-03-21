'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { contactApi, CreateContactDto } from '@/lib/api/contact';
import { toast } from 'sonner';
import { Send, CheckCircle2 } from 'lucide-react';
import { MultiplexAd } from '@/components/adsense';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(255, 'Subject is too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export function ContactContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setIsSubmitting(true);
    try {
      const contactData: CreateContactDto = {
        name: values.name,
        email: values.email,
        subject: values.subject || undefined,
        message: values.message,
      };

      const response = await contactApi.create(contactData);

      if (response.data) {
        toast.success('Thank you! Your message has been sent successfully.');
        form.reset();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        toast.error(
          response.error?.message ||
            'Failed to send message. Please try again.',
        );
      }
    } catch (error) {
      toast.error(
        'An error occurred while sending your message. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <PageHeader
        title='Contact Us'
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />

      <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-8 text-center'>
          <p className='text-lg text-slate-600 dark:text-slate-400'>
            Have a question or want to get in touch? We&apos;d love to hear from
            you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        {isSubmitted && (
          <div className='mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3'>
            <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
            <p className='text-green-800 dark:text-green-300'>
              Your message has been sent successfully! We&apos;ll get back to
              you soon.
            </p>
          </div>
        )}

        <div className='rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-700 dark:text-slate-300'>
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Your name'
                          className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-slate-700 dark:text-slate-300'>
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='your.email@example.com'
                          className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 dark:text-slate-300'>
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='What is this regarding?'
                        className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 dark:text-slate-300'>
                      Message *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Your message here...'
                        className='min-h-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full md:w-auto'>
                {isSubmitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2'>
              Email
            </h3>
            <p className='text-slate-600 dark:text-slate-400'>
              contact@wealthalgor.com
            </p>
          </div>
          <div className='text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2'>
              Location
            </h3>
            <p className='text-slate-600 dark:text-slate-400'>
              Global Digital Presence
            </p>
          </div>
          <div className='text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2'>
              Response Time
            </h3>
            <p className='text-slate-600 dark:text-slate-400'>
              Within 24 hours
            </p>
          </div>
        </div>

        <div className='mt-16 pt-8'>
          <MultiplexAd containerClassName='' />
        </div>
      </div>
    </main>
  );
}
