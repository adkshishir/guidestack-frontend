'use client';

import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, BookOpen, X, Menu } from 'lucide-react';
import { NavigationCategory, taxonomyApi } from '@/lib/api/taxonomy';

interface MegaMenuProps {
  logo: string;
  companyName: string;
}

export default function MegaMenu({ logo, companyName }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(
    new Set(),
  );
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);

  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<
    'left' | 'center' | 'right'
  >('center');
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setIsMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const buttonElement = buttonRefs.current.get(menuKey);
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const buttonCenter = rect.left + rect.width / 2;
      if (buttonCenter < viewportWidth * 0.3) {
        setDropdownPosition('left');
      } else if (buttonCenter > viewportWidth * 0.7) {
        setDropdownPosition('right');
      } else {
        setDropdownPosition('center');
      }
    }
    setActiveMenu(menuKey);
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 300);
  };

  const toggleMobileMenu = (menuKey: string) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const toggleMobileSubItem = (itemId: string) => {
    const newExpanded = new Set(expandedMobileItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedMobileItems(newExpanded);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await taxonomyApi.navigation.getCategories();
    if (response.data) {
      setCategories(response.data);
    }
  };

  return (
    <header className='sticky top-0 z-50 bg-background'>
      {/* Top announcement bar */}
      {isTopBarVisible && (
        <div className='bg-primary text-primary-foreground'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-8 items-center justify-between text-xs'>
              <div className='flex-1 text-center font-medium tracking-wide'>
                Free learning resources — practical guides written for clarity
                <Link
                  href='/blog'
                  className='ml-2 inline-flex items-center gap-0.5 font-semibold underline underline-offset-2 hover:no-underline'>
                  Start exploring →
                </Link>
              </div>
              <button
                onClick={() => setIsTopBarVisible(false)}
                className='shrink-0 opacity-70 hover:opacity-100 transition-opacity'
                aria-label='Close announcement bar'>
                <X className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <div className='border-b border-border'>
        <nav ref={menuRef} className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between gap-4'>
            {/* Logo */}
            <Link
              href='/'
              aria-label={`${companyName} home`}
              className='flex shrink-0 items-center gap-2.5 font-bold text-lg'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm'>
                <BookOpen className='h-5 w-5' />
              </div>
              <span className='hidden sm:inline text-foreground tracking-tight'>
                {companyName}
              </span>
            </Link>

            {/* Desktop category nav */}
            <div className='hidden lg:flex items-center gap-1 flex-1 justify-center'>
              {Object.entries(categories).map(([key, category]) => (
                <div
                  key={key}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(key, el);
                  }}
                  className='relative'
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}>
                  <button className='group flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150'>
                    {category.name}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === key ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>

                  {/* Mega dropdown */}
                  {activeMenu === key && (
                    <div
                      className={`absolute top-full mt-1 w-screen max-w-3xl rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden ${
                        dropdownPosition === 'left'
                          ? 'left-0'
                          : dropdownPosition === 'right'
                            ? 'right-0'
                            : 'left-1/2 -translate-x-1/2'
                      }`}
                      style={{
                        maxWidth: 'min(48rem, calc(100vw - 2rem))',
                      }}
                      onMouseEnter={() => handleMouseEnter(key)}
                      onMouseLeave={handleMouseLeave}>
                      {/* Dropdown header */}
                      <div className='border-b border-border bg-secondary/40 px-5 py-3'>
                        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                          {category.name}
                        </p>
                      </div>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-0 max-h-[70vh] overflow-y-auto p-3'>
                        {category.children.map((item, idx) => (
                          <div key={idx} className='p-2'>
                            {item.slug ? (
                              <Link href={`/category/${item.slug}`}>
                                <div className='group/item rounded-lg p-3 hover:bg-secondary transition-colors duration-150'>
                                  <h3 className='font-semibold text-sm text-foreground group-hover/item:text-primary transition-colors leading-snug'>
                                    {item.name}
                                  </h3>
                                  {item.blogs && item.blogs.length > 0 && (
                                    <p className='text-xs text-muted-foreground mt-0.5'>
                                      {item.blogs.length} guide
                                      {item.blogs.length !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ) : (
                              <div className='rounded-lg p-3'>
                                <h3 className='font-semibold text-sm text-foreground leading-snug'>
                                  {item.name}
                                </h3>
                              </div>
                            )}
                            {item.blogs && item.blogs.length > 0 && (
                              <div className='mt-1 space-y-0.5 px-3'>
                                {item.blogs
                                  .slice(0, 4)
                                  .map((subItem, subIdx) => (
                                    <Link
                                      key={subIdx}
                                      href={`/blog/${subItem.slug}`}
                                      className='flex items-start gap-1.5 rounded py-1 text-xs text-muted-foreground hover:text-primary transition-colors group/sub'>
                                      <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-border group-hover/sub:bg-primary transition-colors' />
                                      <span className='line-clamp-1'>
                                        {subItem.name}
                                      </span>
                                    </Link>
                                  ))}
                                {item.blogs.length > 4 && (
                                  <Link
                                    href={`/category/${item.slug}`}
                                    className='block py-1 text-xs font-medium text-primary hover:underline pl-2.5'>
                                    +{item.blogs.length - 4} more →
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className='hidden md:flex shrink-0 items-center gap-2'>
              {/* <Link href='/blog'>
                <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm'>
                  Browse Topics
                </button>
              </Link> */}
            </div>

            {/* Mobile actions */}
            <div className='lg:hidden flex items-center gap-2'>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                className='rounded-lg p-2 hover:bg-secondary transition-colors'>
                {isMobileOpen ? (
                  <X className='h-5 w-5' />
                ) : (
                  <Menu className='h-5 w-5' />
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className='lg:hidden border-b border-border bg-card shadow-lg'>
          <div className='max-h-[calc(100vh-64px)] overflow-y-auto divide-y divide-border'>
            {Object.entries(categories).map(([key, category]) => (
              <div key={key}>
                <button
                  onClick={() => toggleMobileMenu(key)}
                  className='flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-secondary transition-colors'>
                  {category.name}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      activeMenu === key ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeMenu === key && (
                  <div className='bg-secondary/30 pb-2'>
                    {category.children.map((item, idx) => {
                      const itemId = `${key}-${idx}`;
                      const isExpanded = expandedMobileItems.has(itemId);
                      const hasBlogs = item.blogs && item.blogs.length > 0;

                      return (
                        <div key={idx}>
                          <button
                            onClick={() => {
                              if (hasBlogs) {
                                toggleMobileSubItem(itemId);
                              } else if (item.slug) {
                                setIsMobileOpen(false);
                              }
                            }}
                            className='flex w-full items-center justify-between px-5 py-3 hover:bg-secondary transition-colors'>
                            <div className='flex-1 text-left'>
                              {item.slug && !hasBlogs ? (
                                <Link
                                  href={`/category/${item.slug}`}
                                  onClick={() => setIsMobileOpen(false)}>
                                  <span className='text-sm font-medium text-foreground hover:text-primary transition-colors'>
                                    {item.name}
                                  </span>
                                </Link>
                              ) : (
                                <span className='text-sm font-medium text-foreground'>
                                  {item.name}
                                </span>
                              )}
                            </div>
                            {hasBlogs && (
                              <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </button>

                          {hasBlogs && isExpanded && (
                            <div className='ml-5 border-l-2 border-primary/20 pl-4 pb-2 space-y-0.5'>
                              {item.blogs!.map((blog, blogIdx) => (
                                <Link
                                  key={blogIdx}
                                  href={`/blog/${blog.slug}`}
                                  onClick={() => setIsMobileOpen(false)}
                                  className='block rounded py-2 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors line-clamp-2'>
                                  {blog.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className='p-4'>
              <Link href='/blog' onClick={() => setIsMobileOpen(false)}>
                <button className='w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity'>
                  Browse All Topics
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
