'use client';

import * as React from 'react';
import { Search, X, FileText, Folder, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NavigationCategory } from '@/lib/api/taxonomy';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NavigationCategory[];
}

export function SearchModal({ isOpen, onClose, categories }: SearchModalProps) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // This would need to be handled by the parent, but we can't easily trigger parent's setIsSearchOpen(true) from here
          // unless we lift state. For now, since the browser might handle it, we'll just handle closing.
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return [];

    const results: Array<{
      type: 'category' | 'blog';
      name: string;
      slug: string;
      parentName?: string;
    }> = [];

    const traverse = (cats: NavigationCategory[], parentName?: string) => {
      cats.forEach((cat) => {
        if (cat.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'category',
            name: cat.name,
            slug: cat.slug,
            parentName,
          });
        }

        cat.blogs.forEach((blog) => {
          if (blog.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'blog',
              name: blog.name,
              slug: blog.slug,
              parentName: cat.name,
            });
          }
        });

        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, cat.name);
        }
      });
    };

    traverse(categories);
    return results.slice(0, 10); // Limit to 10 results
  }, [categories, query]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-none w-full h-full p-0 border-none bg-background/98 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col rounded-none'>
        <DialogTitle className='sr-only'>Search Navigation</DialogTitle>
        <div className='flex items-center border-b border-border px-6 h-20'>
          <Search className='w-6 h-6 text-muted-foreground mr-4' />
          <Input
            ref={inputRef}
            placeholder='Search categories and posts...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='flex-1 border-none focus-visible:ring-0 text-xl bg-transparent h-full'
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className='p-1 hover:bg-secondary rounded-md text-muted-foreground mr-2'
              aria-label='Clear search'>
              <X className='w-4 h-4' />
            </button>
          )}
          <kbd className='hidden sm:inline-flex mx-2 px-2 py-1  items-center gap-1 text-[10px] font-medium text-muted-foreground bg-secondary rounded border border-border mr-4'>
            <span className='text-xs'>⌘</span>K
          </kbd>
          {/* <button
            onClick={onClose}
            className='p-2 hover:bg-secondary rounded-full transition-colors'
            aria-label='Close search'>
            <X className='w-6 h-6' />
          </button> */}
        </div>

        <ScrollArea className='flex-1 px-6 py-8'>
          <div className='max-w-4xl mx-auto w-full'>
            {!query ? (
              <div className='py-12 text-center space-y-4'>
                <div className='bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto'>
                  <Search className='w-8 h-8 text-muted-foreground' />
                </div>
                <div className='space-y-1'>
                  <p className='text-lg font-medium'>Search the site</p>
                  <p className='text-sm text-muted-foreground'>
                    Find categories and blog posts from the navigation menu.
                  </p>
                </div>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-2 px-2 mb-4'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                    Results for &quot;{query}&quot;
                  </p>
                  <Link
                    href={`/blog?search=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className='text-xs font-medium text-primary hover:underline'
                  >
                    View all articles →
                  </Link>
                </div>
                <div className='grid gap-2'>
                  {filteredItems.map((item, idx) => (
                    <Link
                      key={`${item.type}-${item.slug}-${idx}`}
                      href={
                        item.type === 'category'
                          ? `/category/${item.slug}`
                          : `/blog/${item.slug}`
                      }
                      onClick={onClose}
                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all group border border-transparent hover:border-border'>
                      <div className='w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                        {item.type === 'category' ? (
                          <Folder className='w-5 h-5' />
                        ) : (
                          <FileText className='w-5 h-5' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-foreground truncate'>
                          {item.name}
                        </p>
                        {item.parentName && (
                          <p className='text-xs text-muted-foreground truncate'>
                            in {item.parentName}
                          </p>
                        )}
                      </div>
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                        <ArrowRight className='w-4 h-4 text-primary' />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className='py-12 text-center space-y-4'>
                <p className='text-muted-foreground'>
                  No results found for &quot;{query}&quot;
                </p>
                <Link
                  href={`/blog?search=${encodeURIComponent(query.trim())}`}
                  onClick={onClose}
                  className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
                >
                  Search all articles →
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className='p-4 bg-secondary/30 border-t border-border flex justify-between items-center text-xs text-muted-foreground'>
          <div className='flex gap-4'>
            <span className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 rounded border border-border bg-background'>
                ESC
              </kbd>{' '}
              to close
            </span>
            <span className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 rounded border border-border bg-background'>
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>
          <p>Powered by GuideStack AI</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
