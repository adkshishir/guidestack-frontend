'use client';

import React from 'react';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, ArrowRight } from 'lucide-react';
import { NavigationCategory, taxonomyApi } from '@/lib/api/taxonomy';
import { SearchModal } from './search-modal';
import Image from 'next/image';

interface SubMenuItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  title: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  subItems?: SubMenuItem[];
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface MegaMenuProps {
  logo: string;
  companyName: string;
}

export default function MegaMenu({ logo, companyName }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

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

    // Calculate dropdown position based on button position
    const buttonElement = buttonRefs.current.get(menuKey);
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const buttonCenter = rect.left + rect.width / 2;

      // Determine position based on where the button is in the viewport
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
    <header className='border-b border-border bg-background sticky top-0 z-50'>
      <nav ref={menuRef} className='mx-auto max-w-7xl max-md:px-2'>
        {/* Desktop Navigation */}
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 font-bold text-lg'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold'>
              {logo}
            </div>
            <span className='hidden sm:inline text-foreground'>
              {companyName}
            </span>
          </Link>

          {/* Desktop Menu Items */}
          <div className='hidden lg:flex items-center gap-4 '>
            {Object.entries(categories).map(([key, category]) => (
              <div
                key={key}
                ref={(el) => {
                  if (el) buttonRefs.current.set(key, el);
                }}
                className='relative group'
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}>
                <button className='flex items-center gap-1  py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 group-hover:text-primary'>
                  {category.name}
                  <ChevronDown className='w-4 h-4 transition-transform duration-200 group-hover:rotate-180' />
                </button>

                {/* Mega Menu Dropdown */}
                {activeMenu === key && (
                  <div
                    className={`absolute mt-0 w-screen max-w-4xl bg-card  rounded-lg shadow-sm z-50 ${
                      dropdownPosition === 'left'
                        ? 'left-0'
                        : dropdownPosition === 'right'
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                    style={{
                      maxWidth: 'min(64rem, calc(100vw - 2rem))',
                    }}
                    onMouseEnter={() => handleMouseEnter(key)}
                    onMouseLeave={handleMouseLeave}>
                    <div className='grid grid-cols-2 max-h-[80vh] overflow-y-auto md:grid-cols-3 2xl:grid-cols-4 justify-center  p-2'>
                      {category.children.map((item, idx) => (
                        <div key={idx} className='space-y-4'>
                          {/* Category Title */}
                          <div className='group/item p-3 rounded-lg hover:bg-secondary transition-colors duration-200'>
                            <div className='flex items-start gap-2'>
                              {/* {item.icon && (
                                <div className='shrink-0 mt-1'>{item.icon}</div>
                              )} */}
                              <div className='flex-1'>
                                {item.slug ? (
                                  <Link href={`/category/${item.slug}`}>
                                    <h3 className='font-semibold text-foreground group-hover/item:text-primary transition-colors mb-1'>
                                      {item.name}
                                    </h3>
                                  </Link>
                                ) : (
                                  <h3 className='font-semibold text-foreground mb-1'>
                                    {item.name}
                                  </h3>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Sub Items */}
                          {item.blogs && item.blogs.length > 0 && (
                            <div className='space-y-2 border-l-2 border-border pl-4'>
                              {item.blogs.map((subItem, subIdx) => (
                                <Link
                                  key={subIdx}
                                  href={`/blog/${subItem.slug}`}
                                  className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/sub'>
                                  {/* {subItem.icon && (
                                    <span className='shrink-0'>
                                      {subItem.icon}
                                    </span>
                                  )} */}
                                  <span className='group-hover/sub:underline'>
                                    {subItem.name}
                                  </span>
                                </Link>
                              ))}
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

          {/* Right Section */}
          <div className='hidden md:flex items-center gap-3'>
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label='Search categories and posts'
              className='p-2 hover:bg-secondary rounded-lg transition-colors'>
              <Search className='w-5 h-5 text-foreground' />
            </button>
            <Link href='/blog'>
              <button className='px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'>
                Browse Guides
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className='lg:hidden flex items-center gap-4'>
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label='Search categories and posts'
              className='p-2 hover:bg-secondary rounded-lg transition-colors'>
              <Search className='w-5 h-5 text-foreground' />
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              className='p-2 hover:bg-secondary rounded-lg transition-colors'>
              <svg
                className={`w-6 h-6 transition-transform ${
                  isMobileOpen ? 'rotate-90' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                {isMobileOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className='lg:hidden border-t border-border bg-card'>
            <div className='max-h-[calc(100vh-64px)] overflow-y-auto'>
              {Object.entries(categories).map(([key, category]) => (
                <div key={key} className='border-b border-border'>
                  <button
                    onClick={() => toggleMobileMenu(key)}
                    className='w-full flex items-center justify-between px-4 py-4 font-medium text-foreground hover:bg-secondary transition-colors'>
                    {category.name}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        activeMenu === key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Mobile Dropdown */}
                  {activeMenu === key && (
                    <div className='bg-secondary/50 px-0 py-2'>
                      {category.children.map((item, idx) => {
                        const itemId = `${key}-${idx}`;
                        const isExpanded = expandedMobileItems.has(itemId);
                        const hasBlogs = item.blogs && item.blogs.length > 0;

                        return (
                          <div key={idx}>
                            {/* Main Category Item */}
                            <button
                              onClick={() => {
                                if (hasBlogs) {
                                  toggleMobileSubItem(itemId);
                                } else if (item.slug) {
                                  setIsMobileOpen(false);
                                }
                              }}
                              className={`w-full flex items-start justify-between px-4 py-3 hover:bg-secondary transition-colors group ${
                                !hasBlogs && item.slug ? 'cursor-pointer' : ''
                              }`}>
                              <div className='flex-1 text-left'>
                                {item.slug && !hasBlogs ? (
                                  <Link
                                    href={item.slug}
                                    onClick={() => setIsMobileOpen(false)}>
                                    <h4 className='font-medium text-foreground group-hover:text-primary transition-colors'>
                                      {item.name}
                                    </h4>
                                  </Link>
                                ) : (
                                  <h4 className='font-medium text-foreground group-hover:text-primary transition-colors'>
                                    {item.name}
                                  </h4>
                                )}
                              </div>
                              {hasBlogs ? (
                                <ChevronDown
                                  className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform mt-0.5 ml-2 shrink-0 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              ) : (
                                item.slug && (
                                  <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 ml-2 shrink-0' />
                                )
                              )}
                            </button>

                            {/* Blog Items */}
                            {hasBlogs && isExpanded && (
                              <div className='bg-secondary/25 pl-6 py-2 space-y-1 border-l-2 border-primary/30 ml-4'>
                                {item.blogs!.map((blog, blogIdx) => (
                                  <Link
                                    key={blogIdx}
                                    href={`/blog/${blog.slug}`}
                                    onClick={() => setIsMobileOpen(false)}
                                    className='flex items-center gap-2 py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors rounded group/sub'>
                                    <span className='group-hover/sub:underline line-clamp-2'>
                                      {blog.name}
                                    </span>
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

              {/* Mobile CTA */}
              <div className='p-4 border-t border-border'>
                <Link href='/blog' onClick={() => setIsMobileOpen(false)}>
                  <button className='w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm'>
                    Browse All Guides
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={categories}
      />
    </header>
  );
}
