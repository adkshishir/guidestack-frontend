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
import { Send, CheckCircle2, Mail, MapPin, Clock } from 'lucide-react';
import { MultiplexAd } from '@/components/adsense';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(255, 'Subject is too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const INFO_CARDS = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@wealthalgor.com',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Global Digital Presence',
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: 'Within 24 hours',
  },
];

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
    } catch {
      toast.error(
        'An error occurred while sending your message. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='min-h-screen bg-background'>
      <PageHeader
        title='Contact Us'
        description="Have a question or feedback? We'd love to hear from you."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />

      <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>

        {/* Info cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-10'>
          {INFO_CARDS.map(({ icon: Icon, title, value }) => (
            <div
              key={title}
              className='flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Icon className='h-5 w-5 text-primary' />
              </div>
              <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
              <p className='text-xs text-muted-foreground'>{value}</p>
            </div>
          ))}
        </div>

        {/* Success message */}
        {isSubmitted && (
          <div className='mb-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 flex items-center gap-3'>
            <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 shrink-0' />
            <p className='text-sm text-green-800 dark:text-green-300'>
              Your message has been sent successfully! We&apos;ll get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        <div className='rounded-2xl border border-border bg-card p-7 md:p-8 shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground text-sm'>
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Your name'
                          className='bg-background border-input'
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
                      <FormLabel className='text-foreground text-sm'>
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='your@email.com'
                          className='bg-background border-input'
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
                    <FormLabel className='text-foreground text-sm'>
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='What is this about?'
                        className='bg-background border-input'
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
                    <FormLabel className='text-foreground text-sm'>
                      Message *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Write your message here...'
                        className='min-h-40 bg-background border-input'
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
                className='w-full md:w-auto font-semibold'>
                {isSubmitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
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

        {/* Ad slot */}
        <div className='mt-14 ad-slot min-h-[200px] flex items-center justify-center'>
          <MultiplexAd containerClassName='w-full' />
        </div>
      </div>
    </main>
  );
}
